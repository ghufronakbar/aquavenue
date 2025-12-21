<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Pool;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/index');
    }

    public function data(Request $request)
    {
        return response()->json([
            'recentOrders' => $this->getRecentOrders($request),
            'topFacilities' => $this->getTopFacilities($request),

            // sisanya sementara kosong; nanti diisi menyusul
            'utilization' => $this->getUtilization($request),
            'kpi' => [
                'income' => $this->getIncomeKpi($request),
                'order' => $this->getOrderKpi($request),
                'customer' => $this->getCustomerKpi($request),
                'utilization' => $this->getUtilizationKpi($request),
            ],
            'chart' => [
                'trend' => $this->getChartTrends($request),
                'distribution' => $this->getChartDistributions($request),
            ],
            'poolInformation' => $this->getPoolInformation($request),
        ]);
    }

    /**
     * Ambil 10 pesanan terbaru (ter-filter tanggal & role).
     * Output disesuaikan dengan RecentOrderRow pada context:
     * {
     *   id, user:{name,email,image}, total, status, bookedDate, bookedHour, created_at
     * }
     */
    private function getRecentOrders(Request $request): array
    {
        $user = Auth::user();
        $isAdmin = $user && $user->role !== Role::User;

        // ----- Ambil dan konversi from/to (ISO string) ke Y-m-d WIB -----
        $fromIso = $request->query('from'); // ex: 2025-10-07T00:00:00.000Z
        $toIso = $request->query('to');

        // Konversi ISO -> Asia/Jakarta -> 'Y-m-d' agar sama dengan tipe kolom orders.date
        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone('Asia/Jakarta')->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone('Asia/Jakarta')->toDateString() : null;

        // Normalisasi bila user memilih satu hari (from saja)
        if ($fromYmd && !$toYmd) {
            $toYmd = $fromYmd;
        }
        // Pastikan from <= to
        if ($fromYmd && $toYmd && $fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        // ----- Query dasar -----
        $q = Order::query()
            ->with(['user:id,name,email,image']) // minimal fields user
            ->select([
                'id',
                'user_id',
                'status',
                'total',
                'time',
                'date',
                'created_at',
            ])
            ->orderByDesc('created_at');

        // Filter role: user biasa hanya lihat miliknya TODO: remove comment
        if (!$isAdmin) {
            $q->where('user_id', $user->id);
        }

        // Filter tanggal berdasarkan kolom "orders.date" (string 'yyyy-MM-dd'), inclusive
        if ($fromYmd && $toYmd) {
            $q->whereBetween('date', [$fromYmd, $toYmd]);
        } elseif ($fromYmd) {
            $q->where('date', '>=', $fromYmd);
        } elseif ($toYmd) {
            $q->where('date', '<=', $toYmd);
        }

        // Batas "recent"
        $orders = $q->limit(10)->get();

        // ----- Map ke bentuk RecentOrderRow -----
        return $orders->map(function ($o) {
            return [
                'id' => (string) $o->id,
                'user' => [
                    'name' => (string) ($o->user->name ?? ''),
                    'email' => (string) ($o->user->email ?? ''),
                    'image' => $o->user->image ?? null,
                ],
                'total' => (int) $o->total,
                'status' => (string) $o->status->value,           // 'pending'|'confirmed'|'cancelled'
                'bookedDate' => (string) $o->date,             // "yyyy-MM-dd"
                'bookedHour' => (int) $o->time,                // number (jam)
                'created_at' => $o->created_at?->toISOString() // string ISO untuk frontend
                    ?? (string) $o->created_at,
            ];
        })->all();
    }

    /**
     * Return:
     * [
     *   ['name' => string, 'sold' => int, 'revenue' => int],
     *   ...
     * ]
     *
     * Sumber: order_details JOIN orders (status confirmed/success) JOIN facilities.
     * Filter tanggal berdasarkan orders.date (string yyyy-MM-dd), inclusive.
     * Urut: terbanyak terjual (sold) → desc. Batasi hasil via ?top_limit= (default 5).
     */
    private function getTopFacilities(Request $request): array
    {
        // Ambil rentang tanggal dari query (?from, ?to) -> konversi ke WIB 'Y-m-d'
        $tz = 'Asia/Jakarta';
        $today = Carbon::now($tz)->toDateString();

        $fromIso = $request->query('from');
        $toIso = $request->query('to');

        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone($tz)->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone($tz)->toDateString() : null;

        // Default: 14 hari terakhir jika tidak ada filter
        if (!$fromYmd && !$toYmd) {
            $toYmd = $today;
            $fromYmd = Carbon::parse($toYmd)->subDays(13)->toDateString();
        }
        if ($fromYmd && !$toYmd)
            $toYmd = $fromYmd;
        if ($toYmd && !$fromYmd)
            $fromYmd = $toYmd;
        if ($fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        // Batasi jumlah hasil
        $limit = (int) ($request->query('top_limit', 5));
        if ($limit <= 0 || $limit > 50)
            $limit = 5;

        // Agregasi per fasilitas
        $rows = OrderDetail::query()
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->join('facilities', 'order_details.facility_id', '=', 'facilities.id')
            ->whereIn('orders.status', ['confirmed']) // “berhasil”
            ->whereBetween('orders.date', [$fromYmd, $toYmd])     // filter by reserved date
            ->groupBy('facilities.facility_name')
            ->selectRaw('
            facilities.facility_name as name,
            SUM(order_details.quantity) as sold,
            SUM(order_details.total)    as revenue
        ')
            ->orderByDesc(DB::raw('SUM(order_details.quantity)'))
            ->limit($limit)
            ->get();

        return $rows->map(fn($r) => [
            'name' => (string) $r->name,
            'sold' => (int) $r->sold,
            'revenue' => (int) $r->revenue,
        ])->all();
    }

    /**
     * UTILIZATION:
     * potential: kapasitas total (pool_capacity × 14 jam × jumlah hari)
     * booked   : total orang yang ter-book (SUM(orders.amount) untuk status confirmed)
     *
     * Rentang tanggal berdasarkan orders.date (string 'Y-m-d'), inclusive.
     */
    private function getUtilization(Request $request): array
    {
        $tz = 'Asia/Jakarta';
        $today = Carbon::now($tz)->toDateString();

        // Ambil range dari query (?from=ISO, ?to=ISO), konversi ke Y-m-d (WIB)
        $fromIso = $request->query('from');
        $toIso = $request->query('to');

        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone($tz)->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone($tz)->toDateString() : null;

        // Default range: dari order confirmed paling awal sampai hari ini
        if (!$fromYmd && !$toYmd) {
            $firstConfirmed = Order::query()
                ->where('status', 'confirmed')
                ->min('date'); // kolom string 'Y-m-d'
            $fromYmd = $firstConfirmed ?: $today;
            $toYmd = $today;
        }

        // Lengkapi jika salah satu kosong
        if ($fromYmd && !$toYmd)
            $toYmd = $fromYmd;
        if ($toYmd && !$fromYmd)
            $fromYmd = $toYmd;

        // Pastikan from <= to
        if ($fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        // Hitung jumlah hari (inklusif)
        $fromDate = Carbon::createFromFormat('Y-m-d', $fromYmd, $tz)->startOfDay();
        $toDate = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)->startOfDay();
        $dayCount = $fromDate->diffInDays($toDate) + 1;

        // Ambil kapasitas kolam (asumsi 1 baris Pool dengan kolom capacity)
        $capacity = (int) (Pool::query()->value('capacity') ?? 0);

        // 08:00–22:00 = 14 slot per hari
        $hoursPerDay = 14;

        $potential = $capacity * $hoursPerDay * $dayCount;

        // Total booked = SUM(amount) orders confirmed pada rentang tanggal (berdasarkan orders.date)
        $booked = (int) Order::query()
            ->where('status', 'confirmed')
            ->whereBetween('date', [$fromYmd, $toYmd])
            ->sum('amount');

        return [
            'potential' => $potential,
            'booked' => $booked,
        ];
    }


    /**
     * Trend harian untuk chart.
     * - date: "Y-m-d"
     * - orders: jumlah order (confirmed)
     * - revenue: total rupiah (SUM(total)) dari order confirmed
     *
     * Range: ?from & ?to (ISO). Jika keduanya kosong -> 30 hari terakhir (inkl. hari ini).
     */
    private function getChartTrends(Request $request): array
    {
        $tz = 'Asia/Jakarta';
        $today = Carbon::now($tz)->toDateString();

        // Ambil range dari query (?from=ISO, ?to=ISO) -> konversi ke Y-m-d (WIB)
        $fromIso = $request->query('from');
        $toIso = $request->query('to');

        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone($tz)->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone($tz)->toDateString() : null;

        // Default: 30 hari terakhir (inkl. hari ini)
        if (!$fromYmd && !$toYmd) {
            $toYmd = $today;
            $fromYmd = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)->subDays(29)->toDateString();
        }

        // Lengkapi bila salah satu kosong (single day)
        if ($fromYmd && !$toYmd)
            $toYmd = $fromYmd;
        if ($toYmd && !$fromYmd)
            $fromYmd = $toYmd;

        // Pastikan from <= to
        if ($fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        // Query ringkas per hari (hanya confirmed)
        $rows = Order::query()
            ->where('status', 'confirmed')
            ->whereBetween('date', [$fromYmd, $toYmd]) // kolom string 'Y-m-d'
            ->selectRaw('`date` as d, COUNT(*) as orders, COALESCE(SUM(total),0) as revenue')
            ->groupBy('date')
            ->get()
            ->keyBy('d'); // map: d => row

        // Bentuk deret lengkap per hari (isi nol jika kosong)
        $result = [];
        $cursor = Carbon::createFromFormat('Y-m-d', $fromYmd, $tz)->startOfDay();
        $end = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)->startOfDay();

        while ($cursor->lte($end)) {
            $d = $cursor->format('Y-m-d');
            $row = $rows->get($d);

            $result[] = [
                'date' => $d,
                'orders' => (int) ($row->orders ?? 0),
                'revenue' => (int) ($row->revenue ?? 0),
            ];

            $cursor->addDay();
        }

        return $result;
    }



    /**
     * Distribusi status order untuk pie/donut chart.
     * Return selalu 3 item: confirmed, pending, cancelled.
     *
     * Range tanggal berbasis kolom string `orders.date` (format Y-m-d).
     * - ?from & ?to dalam ISO; dikonversi ke WIB dan diambil Y-m-d (inclusive).
     * - Jika keduanya kosong -> default 30 hari terakhir (inkl. hari ini).
     * - Jika role = user -> hanya order milik user tsb; selain itu semua order.
     */
    private function getChartDistributions(Request $request): array
    {
        $tz = 'Asia/Jakarta';
        $today = Carbon::now($tz)->toDateString();
        $user = Auth::user();
        $isAdmin = $user && $user->role !== Role::User;

        // Ambil range dari query (ISO -> WIB -> Y-m-d)
        $fromIso = $request->query('from');
        $toIso = $request->query('to');

        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone($tz)->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone($tz)->toDateString() : null;

        // Default 30 hari terakhir bila kosong
        if (!$fromYmd && !$toYmd) {
            $toYmd = $today;
            $fromYmd = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)->subDays(365)->toDateString();
        }

        // Lengkapi single-day
        if ($fromYmd && !$toYmd)
            $toYmd = $fromYmd;
        if ($toYmd && !$fromYmd)
            $fromYmd = $toYmd;

        // Pastikan from <= to
        if ($fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        // Agregasi sekali query
        $agg = Order::query()
            // TODO: remove comment
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->whereBetween('date', [$fromYmd, $toYmd]) // kolom string 'Y-m-d'
            ->selectRaw("SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed")
            ->selectRaw("SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) as pending")
            ->selectRaw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled")
            ->first();

        // Susun 3 item tetap
        return [
            ['name' => 'confirmed', 'value' => (int) ($agg->confirmed ?? 0)],
            ['name' => 'pending', 'value' => (int) ($agg->pending ?? 0)],
            ['name' => 'cancelled', 'value' => (int) ($agg->cancelled ?? 0)],
        ];
    }

    /* =========================== Helpers ============================ */

    /** Normalisasi range tanggal dari query (?from, ?to). */
    private function normalizeRange(Request $request, string $tz = 'Asia/Jakarta'): array
    {
        $fromIso = $request->query('from');
        $toIso = $request->query('to');

        if (!$fromIso && !$toIso) {
            return [
                'isAll' => true,
                'fromYmd' => null,
                'toYmd' => null,
                'daysLen' => null,
            ];
        }

        $fromYmd = $fromIso ? Carbon::parse($fromIso)->setTimezone($tz)->toDateString() : null;
        $toYmd = $toIso ? Carbon::parse($toIso)->setTimezone($tz)->toDateString() : null;

        // Single-day
        if ($fromYmd && !$toYmd)
            $toYmd = $fromYmd;
        if ($toYmd && !$fromYmd)
            $fromYmd = $toYmd;

        // Pastikan from <= to
        if ($fromYmd > $toYmd) {
            [$fromYmd, $toYmd] = [$toYmd, $fromYmd];
        }

        $daysLen = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)
            ->diffInDays(Carbon::createFromFormat('Y-m-d', $fromYmd, $tz)) + 1;

        return [
            'isAll' => false,
            'fromYmd' => $fromYmd,
            'toYmd' => $toYmd,
            'daysLen' => $daysLen, // inklusif
        ];
    }

    /** Hitung delta % dan arah (up). */
    private function makeDelta(float $now, float $prev): array
    {
        if ($prev == 0.0) {
            if ($now == 0.0) {
                return ['delta' => 0.0, 'up' => false];
            }
            return ['delta' => 100.0, 'up' => true];
        }
        $delta = (($now - $prev) / $prev) * 100.0;
        return ['delta' => $delta, 'up' => $delta > 0];
    }

    /** Filter query orders berdasar role & range (kolom 'date'). */
    private function scopedOrders(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user && $user->role !== Role::User;

        $q = Order::query();
        if (!$isAdmin) {
            // TODO: remove comment
            $q->where('user_id', $user->id);
        }

        $range = $this->normalizeRange($request);
        if (!$range['isAll']) {
            $q->whereBetween('date', [$range['fromYmd'], $range['toYmd']]);
        }

        return [$q, $range, $isAdmin, $user];
    }

    /** Dapatkan range sebelumnya dengan panjang yang sama. */
    private function previousRange(string $fromYmd, string $toYmd, int $daysLen, string $tz = 'Asia/Jakarta'): array
    {
        $prevFrom = Carbon::createFromFormat('Y-m-d', $fromYmd, $tz)->subDays($daysLen)->toDateString();
        $prevTo = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)->subDays($daysLen)->toDateString();
        return [$prevFrom, $prevTo];
    }

    /* ============================= KPI ============================== */

    /**
     * Income KPI: total revenue (sum orders.total) untuk status confirmed.
     * - value: nominal saat ini
     * - delta: % vs periode sebelumnya (null bila all-date)
     */
    private function getIncomeKpi(Request $request): array
    {
        [$q, $range] = $this->scopedOrders($request);

        // current value
        $nowVal = (float) (clone $q)
            ->where('status', 'confirmed')
            ->sum('total');

        if ($range['isAll']) {
            return ['value' => $nowVal, 'delta' => null, 'up' => false];
        }

        // previous period
        [$prevFrom, $prevTo] = $this->previousRange($range['fromYmd'], $range['toYmd'], $range['daysLen']);
        $prevVal = (float) Order::query()
            ->when($q->getQuery()->wheres, fn($qq) => $qq->addNestedWhereQuery($q->getQuery())) // clone role filter
            ->whereBetween('date', [$prevFrom, $prevTo])
            ->where('status', 'confirmed')
            ->sum('total');

        $delta = $this->makeDelta($nowVal, $prevVal);
        return ['value' => $nowVal, 'delta' => $delta['delta'], 'up' => $delta['up']];
    }

    /**
     * Order KPI: jumlah order (confirmed).
     */
    private function getOrderKpi(Request $request): array
    {
        [$q, $range] = $this->scopedOrders($request);

        $nowVal = (int) (clone $q)
            ->where('status', 'confirmed')
            ->count('id');

        if ($range['isAll']) {
            return ['value' => $nowVal, 'delta' => null, 'up' => false];
        }

        [$prevFrom, $prevTo] = $this->previousRange($range['fromYmd'], $range['toYmd'], $range['daysLen']);
        $prevVal = (int) Order::query()
            ->when($q->getQuery()->wheres, fn($qq) => $qq->addNestedWhereQuery($q->getQuery()))
            ->whereBetween('date', [$prevFrom, $prevTo])
            ->where('status', 'confirmed')
            ->count('id');

        $delta = $this->makeDelta($nowVal, $prevVal);
        return ['value' => $nowVal, 'delta' => $delta['delta'], 'up' => $delta['up']];
    }

    /**
     * Customer KPI: jumlah distinct pelanggan (confirmed).
     */
    private function getCustomerKpi(Request $request): array
    {
        [$q, $range] = $this->scopedOrders($request);

        $nowVal = (int) (clone $q)
            ->where('status', 'confirmed')
            ->distinct('user_id')
            ->count('user_id');

        if ($range['isAll']) {
            return ['value' => $nowVal, 'delta' => null, 'up' => false];
        }

        [$prevFrom, $prevTo] = $this->previousRange($range['fromYmd'], $range['toYmd'], $range['daysLen']);
        $prevVal = (int) Order::query()
            ->when($q->getQuery()->wheres, fn($qq) => $qq->addNestedWhereQuery($q->getQuery()))
            ->whereBetween('date', [$prevFrom, $prevTo])
            ->where('status', 'confirmed')
            ->distinct('user_id')
            ->count('user_id');

        $delta = $this->makeDelta($nowVal, $prevVal);
        return ['value' => $nowVal, 'delta' => $delta['delta'], 'up' => $delta['up']];
    }

    /**
     * Utilization KPI: persentase (0..100)
     * value = (booked / potential) * 100
     * - potential = (hari * 14 * capacity)
     * - booked    = sum(orders.amount) untuk confirmed
     * Jika all-date: start = confirmed pertama, end = hari ini (WIB).
     */
    private function getUtilizationKpi(Request $request): array
    {
        $tz = 'Asia/Jakarta';

        // Ambil kapasitas kolam (default 0 jika tidak ada).
        $capacity = (int) (Pool::query()->value('capacity') ?? 0);

        // Bila tidak ada kapasitas, KPI 0.
        if ($capacity <= 0) {
            return ['value' => 0.0, 'delta' => null, 'up' => false];
        }

        [$q, $range, $isAdmin, $user] = $this->scopedOrders($request);

        // Bila all-date: tentukan from = confirmed pertama, to = hari ini (WIB)
        if ($range['isAll']) {
            $firstConfirmed = (clone $q)
                ->where('status', 'confirmed')
                ->orderBy('date', 'asc')
                ->value('date'); // string Y-m-d atau null

            $today = Carbon::now($tz)->toDateString();

            if (!$firstConfirmed) {
                // Belum ada order confirmed sama sekali
                return ['value' => 0.0, 'delta' => null, 'up' => false];
            }

            $fromYmd = $firstConfirmed;
            $toYmd = $today;

            $daysLen = Carbon::createFromFormat('Y-m-d', $toYmd, $tz)
                ->diffInDays(Carbon::createFromFormat('Y-m-d', $fromYmd, $tz)) + 1;

            $potential = $daysLen * 14 * $capacity;
            $booked = (int) (clone $q)
                ->whereBetween('date', [$fromYmd, $toYmd])
                ->where('status', 'confirmed')
                ->sum('amount');

            $value = $potential > 0 ? round(($booked / $potential) * 100, 1) : 0.0;
            return ['value' => $value, 'delta' => null, 'up' => false];
        }

        // Range ada: gunakan range sekarang & bandingkan dengan periode sebelumnya.
        $fromYmd = $range['fromYmd'];
        $toYmd = $range['toYmd'];
        $daysLen = $range['daysLen'];

        $potentialNow = $daysLen * 14 * $capacity;
        $bookedNow = (int) (clone $q)
            ->whereBetween('date', [$fromYmd, $toYmd])
            ->where('status', 'confirmed')
            ->sum('amount');

        $valueNow = $potentialNow > 0 ? round(($bookedNow / $potentialNow) * 100, 1) : 0.0;

        // Periode sebelumnya
        [$prevFrom, $prevTo] = $this->previousRange($fromYmd, $toYmd, $daysLen, $tz);
        $potentialPrev = $daysLen * 14 * $capacity; // sama panjang
        $bookedPrev = (int) Order::query()
            ->when(!$isAdmin, fn($qq) => $qq->where('user_id', $user->id))
            ->whereBetween('date', [$prevFrom, $prevTo])
            ->where('status', 'confirmed')
            ->sum('amount');

        $valuePrev = $potentialPrev > 0 ? round(($bookedPrev / $potentialPrev) * 100, 1) : 0.0;

        $delta = $this->makeDelta($valueNow, $valuePrev);
        return ['value' => $valueNow, 'delta' => $delta['delta'], 'up' => $delta['up']];
    }

    private function getPoolInformation(Request $request): array
    {
        $pool = Pool::query()->first();
        return [
            'price' => $pool->price ?? 0,
            'capacity' => $pool->capacity ?? 0,
            'updated_at' => $pool->updated_at ?? '',
        ];
    }

    public function updatePoolInformation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'price' => 'required|numeric',
            'capacity' => 'required|numeric',
        ]);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        $pool = Pool::query()->first();
        $pool->price = $request->price;
        $pool->capacity = $request->capacity;
        $pool->save();
        return back()->with('success', 'Berhasil mengubah informasi kolam');
    }
}
