<?php

namespace App\Http\Controllers\Order;

use App\Enums\FacilityType;
use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Pool;
use App\Models\User;
use App\Services\Payments\MidtransService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use PhpParser\Node\Stmt\TryCatch;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silahkan login terlebih dahulu');
        }
        $facilities = Facility::withAvailableStock()->whereNull('deleted_at')->get();
        $pool = Pool::first();
        $poolPrice = $pool->price;
        return Inertia::render('landing/pesan', [
            'facilities' => $facilities,
            'poolPrice' => $poolPrice,
        ]);
    }

    public function checkPoolCapacity(Request $request)
    {

        try {
            $poolCapacity = Pool::availableCapacity($request->date, $request->time);
            return response()->json($poolCapacity, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'trace' => $e->getTrace(), 'data' => 0], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (! $user?->role || $user->role != Role::User) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:1'],
            'time' => ['required', 'integer', 'min:8', 'max:21'],
            'extra_facilities' => ['nullable', 'array'],
            'extra_facilities.*.facility_id' => ['required', 'exists:facilities,id'],
            'extra_facilities.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        // 1) Cek kapasitas kolam untuk tanggal & jam itu
        // Jika method-mu tidak menerima argumen, pakai: $availablePool = Pool::availableCapacity();
        $availablePool = Pool::availableCapacity($validated['date'], $validated['time']);

        if ((int)$validated['amount'] > (int)$availablePool["data"]) {
            return back()
                ->withErrors(['amount' => "Jumlah melebihi kapasitas tersedia ({$availablePool['data']})."])
                ->withInput();
        }

        // 2) Normalisasi & gabungkan duplikasi facility_id dari client
        $extras = collect($validated['extra_facilities'] ?? [])
            ->groupBy('facility_id')
            ->map(fn($rows, $fid) => [
                'facility_id' => (int) $fid,
                'quantity'    => (int) $rows->sum('quantity'),
            ])
            ->values();

        if ($extras->isEmpty()) {
            // return back()
            //     ->withErrors(['extra_facilities' => 'Pilih minimal 1 fasilitas.'])
            //     ->withInput();
        }

        $orderId = (string) Str::uuid();

        // 3) Transaksi untuk atomicity + kunci baris fasilitas
        return DB::transaction(function () use ($user, $validated, $extras, $orderId) {
            // Ambil fasilitas terkait + kolom stok terhitung (butuh scope withAvailableStock yang sudah kamu buat)
            $facilityIds = $extras->pluck('facility_id')->all();
            $facilities = Facility::query()
                ->withAvailableStock()          // pastikan scope ini menambahkan `available_stock`
                ->whereIn('id', $facilityIds)
                ->lockForUpdate()               // cegah race condition saat cek/deduct stok
                ->get()
                ->keyBy('id');

            // 4) Hitung pricing & validasi stok per fasilitas
            $lines = [];
            $subtotal = 0;

            foreach ($extras as $row) {
                $fid = (int) $row['facility_id'];
                $qty = (int) $row['quantity'];

                $facility = $facilities->get($fid);
                if (! $facility) {
                    throw ValidationException::withMessages([
                        'extra_facilities' => "Fasilitas #{$fid} tidak ditemukan.",
                    ]);
                }


                if ((int)$facility->available_stock < $qty) {
                    throw ValidationException::withMessages([
                        'extra_facilities' => "Stok {$facility->facility_name} tidak cukup (tersisa {$facility->available_stock}).",
                    ]);
                }

                $price = (int) $facility->facility_price;
                $lineTotal = $price * $qty;
                $subtotal += $lineTotal;

                $lines[] = [
                    'facility_id' => $fid,
                    'quantity'    => $qty,
                    'price'       => $price,
                    'total'       => $lineTotal,
                    'facility_type' => $facility->facility_type,
                ];
            }

            $poolPrice = Pool::first()->price;
            $subtotal += $poolPrice * (int) $validated['amount'];
            $tax = (int) round($subtotal * 0.10);
            $total = (int) ($subtotal + $tax);

            $midtrans = MidtransService::make();
            $snap = $midtrans->checkout([
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $total,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email'      => $user->email,
                ],
                'callbacks' => [
                    'finish' => route('pesan.invoice.show', $orderId),
                    'unfinish' => route('pesan.invoice.show', $orderId),
                    'error' => route('pesan.invoice.show', $orderId),
                ],
            ]);




            $midtransSnapToken = (string) $snap['token'];
            $midtransRedirectUrl = (string) $snap['redirect_url'];

            $date = Carbon::parse($validated['date'])->setTimezone('Asia/Jakarta')->format('Y-m-d');

            // 5) Buat order
            $order = Order::create([
                'id'       => $orderId,
                'user_id'  => $user->id,
                'date'     => $date,
                'time'     => (int) $validated['time'],
                'amount'   => (int) $validated['amount'],
                'subtotal' => $subtotal,
                'tax'      => $tax,
                'total'    => $total,
                'status' => OrderStatus::Pending,
                'midtrans_snap_token' => $midtransSnapToken,
                'midtrans_redirect_url' => $midtransRedirectUrl,
                'pool_price' => $poolPrice,
            ]);

            // 6) Buat order details + (opsional) kurangi stok untuk SELL
            foreach ($lines as $line) {
                OrderDetail::create([
                    'order_id'    => $order->id,
                    'facility_id' => $line['facility_id'],
                    'quantity'    => $line['quantity'],
                    'price'       => $line['price'],
                    'total'       => $line['total'],
                ]);
            }

            // 7) Selesai → redirect ke invoice
            return redirect()
                ->route('pesan.invoice.show', $order->id)
                ->with('success', 'Berhasil membuat pesanan');
        });
    }

    public function showInvoice(Request $request)
    {
        $order = Order::with(['orderDetails.facility', 'user'])->find($request->orderId);
        if (!$order) {
            return redirect()->route('pesan.index')->with('error', 'Pesanan tidak ditemukan');
        }
        if ($order->user_id != Auth::user()->id && (Auth::user()->role != Role::Admin && Auth::user()->role != Role::SuperAdmin)) {
            return redirect()->route('pesan.index')->with('error', 'Pesanan tidak ditemukan');
        }
        if ($order->status == OrderStatus::Pending) {
            //CHECK MIDTRANS STATUS
            $midtrans = MidtransService::make();
            $midtransCheck = $midtrans->status($order->id);

            if (isset($midtransCheck['transaction_status']) && $midtransCheck['transaction_status'] == 'settlement') {
                $order->status = OrderStatus::Confirmed;
                $order->save();
            }
            if (isset($midtransCheck['transaction_status']) && $midtransCheck['transaction_status'] == 'pending') {
                $order->status = OrderStatus::Pending;
                $order->save();
            }
            if (isset($midtransCheck['transaction_status']) && $midtransCheck['transaction_status'] == 'cancel') {
                $order->status = OrderStatus::Cancelled;
                $order->save();
            }
        }
        return Inertia::render('order/invoice', [
            'order' => $order,
            'midtransClientKey' => config('services.midtrans.client_key'),
        ]);
    }

    public function cancelOrder(Request $request)
    {
        $order = Order::find($request->orderId);
        $midtrans = MidtransService::make();
        $cancel = $midtrans->cancel($order->id);
        $order->status = OrderStatus::Cancelled;
        $order->save();
        return response()->json($cancel, 200);
    }

    public function allHistory()
    {
        $user = Auth::user();

        $orders = Order::with(['orderDetails.facility', 'user'])
            ->when($user->role === Role::User, fn($q) => $q->where('user_id', $user->id))
            ->get(); // hasilnya sudah array-like (0..n)

        return Inertia::render('order/riwayat-pesanan', [
            'orders' => $orders,
        ]);
    }

    public function checkInOutOrder(Request $request)
    {
        $validated = $request->validate([
            'orderId' => ['required', 'string'],
            'type' => ['required', 'string', 'in:check_in,check_out'],
        ]);
        $order = Order::find($validated['orderId']);
        if (!$order) {
            // return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
            return back()->with('error', 'Pesanan tidak ditemukan');
        }
        if ($order->status != OrderStatus::Confirmed) {
            // return response()->json(['message' => 'Pesanan belum dikonfirmasi'], 400);
            return back()->with('error', 'Pesanan belum dikonfirmasi');
        }
        $orderTime = $order->time;
        $orderDate = $order->date;
        $now = Carbon::now();
        $nowDate = $now->format('Y-m-d');
        $nowTime = $now->format('H');
        if ($validated['type'] == 'check_in') {
            if ($order->check_in_at) {
                // return response()->json(['message' => 'Pesanan sudah di check-in'], 400);
                return back()->with('error', 'Pesanan sudah di check-in');
            }
            if ($nowDate != $orderDate || $nowTime != $orderTime) {
                // return response()->json(['message' => 'Waktu pesanan tidak sesuai DEBUG: ' . $nowDate . ' ' . $nowTime . ' ' . $orderDate . ' ' . $orderTime], 400);
                return back()->with('error', 'Waktu pesanan tidak sesuai');
            }
            $order->check_in_at = $now;
            $order->save();
            return back()->with('success', 'Pesanan berhasil di check-in');
        } else {
            if ($order->check_out_at) {
                // return response()->json(['message' => 'Pesanan sudah di check-out'], 400);
                return back()->with('error', 'Pesanan sudah di check-out');
            }
            if (!$order->check_in_at) {
                // return response()->json(['message' => 'Pesanan belum di check-in'], 400);
                return back()->with('error', 'Pesanan belum di check-in');
            }
            $order->check_out_at = $now;
            $order->save();
            return back()->with('success', 'Pesanan berhasil di check-out');
        }
        $order->save();
        return back()->with('success', 'Pesanan berhasil di ' . $validated['type'] == 'check_in' ? 'check-in' : 'check-out');
        // return response()->json(['message' => 'Pesanan berhasil di ' . $validated['type'] == 'check_in' ? 'check-in' : 'check-out'], 200);
    }
}
