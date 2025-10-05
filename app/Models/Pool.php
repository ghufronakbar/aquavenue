<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Pool extends Model
{
    use HasFactory;

    protected $table = 'pools';

    protected $fillable = [
        'capacity',
        'price',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'price'    => 'integer',
    ];

    /**
     * Hitung sisa kapasitas untuk tanggal & jam tertentu.
     * Mengembalikan array agar kompatibel dengan pemakaianmu saat ini:
     * ['message' => string, 'data' => int]
     */
    public static function availableCapacity($date, $time): array
    {
        try {
            // Validasi input
            $validator = Validator::make(
                ['date' => $date, 'time' => $time],
                ['date' => ['required', 'date'], 'time' => ['required', 'integer', 'min:8', 'max:21']]
            );

            if ($validator->fails()) {
                return ['message' => 'Invalid date or time', 'data' => 0];
            }

            // Ambil record pool (asumsi single row konfigurasi)
            /** @var self|null $pool */
            $pool = self::query()->first();

            // Fallback ke env jika belum ada baris pool
            $capacity = $pool?->capacity ?? (int) env('POOL_CAPACITY', 10);

            // Hitung total booking (jumlah orang) pada slot itu
            // NOTE: kalau kamu punya kolom payment_status dan hanya mau hitung order aktif,
            // kamu bisa tambah whereIn('payment_status', ['pending','paid','settlement']) di bawah.
            $booked = Order::query()
                ->whereDate('date', $date)
                ->where('time', (int) $time)
                ->whereIn('status', [OrderStatus::Pending, OrderStatus::Confirmed,])
                ->sum('amount');



            $available = max(0, (int) $capacity - (int) $booked);

            return [
                'message' => 'Pool capacity available',
                'data'    => $available,
            ];
        } catch (\Throwable $e) {
            return [
                'message' => $e->getMessage(),
                'data'    => 0,
            ];
        }
    }

    /**
     * Versi ringkas kalau butuh angka mentah (opsional).
     */
    public static function availableCapacityNumber($date, $time): int
    {
        $res = self::availableCapacity($date, $time);
        return (int) ($res['data'] ?? 0);
    }
}
