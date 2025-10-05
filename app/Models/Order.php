<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'tax',
        'subtotal',
        'total',
        'amount',
        'time',
        'date',
        'status',
        'midtrans_snap_token',
        'midtrans_redirect_url',
        'pool_price',
        'check_in_at',
        'check_out_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'amount' => 'integer',
        'time' => 'integer',
        'pool_price' => 'integer',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
    ];

    // auto-UUID saat create
    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->getKey())) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
