<?php

namespace App\Models;

use App\Enums\FacilityType;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrderDetail; // <— tambahkan
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Facility extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'facility_name',
        'facility_price',
        'facility_description',
        'facility_image',
        'facility_type',
        'deleted_at',
    ];

    protected $casts = [
        'facility_type' => FacilityType::class,
        'deleted_at' => 'datetime',
    ];

    public function facilityStockIns()
    {
        return $this->hasMany(FacilityStockIn::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * ACCESSOR: $facility->available_stock
     *
     * - Base stok = SUM facility_stock_ins.stock (via alias dari scope / relasi / query).
     * - Dikurangi reserved qty dari order_details yang berstatus CONFIRMED.
     *   • Jika facility_type = SELL  → hitung semua confirmed (akumulatif).
     *   • Jika facility_type = RENT  → hitung hanya pada request('date') & request('time').
     *
     * Catatan:
     * - Tidak clamp ke 0; angka negatif dibiarkan (sesuai catatan sebelumnya).
     * - Tidak menambah parameter pemanggilan. Untuk RENT, ambil date/time dari request saja.
     */
    public function getAvailableStockAttribute(): int
    {
        // 1) Ambil base stok dari alias withSum, relasi eager, atau 1 query fallback
        $base = array_key_exists('available_stock', $this->attributes)
            ? (int) ($this->attributes['available_stock'] ?? 0)
            : ($this->relationLoaded('facilityStockIns')
                ? (int) $this->facilityStockIns->sum('stock')
                : (int) $this->facilityStockIns()->sum('stock'));

        // 2) Hitung reserved qty (CONFIRMED). Untuk RENT, filter date+time dari request jika ada.
        $reserved = $this->reservedQuantity();

        return $base - $reserved;
    }

    /**
     * SCOPE: ambil list dengan kolom agregat 'available_stock' (base stok saja).
     * Pemakaian:
     *   Facility::withAvailableStock()->get();
     */
    public function scopeWithAvailableStock($query)
    {
        // alias 'available_stock' = sum(stock_in). Pengurangannya dihitung di accessor.
        return $query->withSum('facilityStockIns as available_stock', 'stock');
    }

    /**
     * Hitung jumlah reserved (CONFIRMED) untuk fasilitas ini.
     * - SELL  : semua tanggal (karena barang keluar permanen).
     * - RENT  : hanya untuk date & time pada request (jika tidak ada, 0).
     */
    protected function reservedQuantity(): int
    {
        $q = OrderDetail::query()
            ->join('orders', 'orders.id', '=', 'order_details.order_id')
            ->where('order_details.facility_id', $this->id)
            ->whereIn('orders.status', [OrderStatus::Confirmed, OrderStatus::Pending]); // enum cast di model Order

        if ($this->facility_type === FacilityType::Rent) {
            $date = request()->input('date');
            $time = request()->input('time');

            if ($date !== null && $time !== null) {
                $q->whereDate('orders.date', $date)
                    ->where('orders.time', (int) $time);
            } else {
                $nowTime = Carbon::now()->setTimezone('Asia/Jakarta')->format('H');
                $nowDate = Carbon::now()->setTimezone('Asia/Jakarta')->format('Y-m-d');
                // Tidak ada konteks slot: untuk RENT anggap 0 agar tidak menyesatkan
                $q->whereDate('orders.date', $nowDate)
                    ->where('orders.time', (int) $nowTime);
            }
        }

        return (int) $q->sum('order_details.quantity');
    }
}
