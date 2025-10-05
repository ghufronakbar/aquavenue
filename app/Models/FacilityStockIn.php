<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacilityStockIn extends Model
{
    use HasFactory;

    protected $table = 'facility_stock_ins';

    protected $fillable = [
        'facility_id',
        'stock',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
