<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrderDetail extends Model
{
    use HasFactory;

    protected $table = 'order_details';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'facility_id',
        'quantity',
        'price',
        'total',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->getKey())) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
            // default total kalau belum diisi
            if (is_null($model->total)) {
                $model->total = (int) $model->quantity * (int) $model->price;
            }
        });

        // jaga konsistensi saat update qty/price
        static::updating(function (self $model) {
            if ($model->isDirty(['quantity', 'price']) && ! $model->isDirty('total')) {
                $model->total = (int) $model->quantity * (int) $model->price;
            }
        });
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
