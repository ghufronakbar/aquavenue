<?php

namespace App\Models;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'user_id',
        'date', // string "yyyy-mm-dd"
        'time', // string "hh:mm"
        // 'type' & 'status' diisi otomatis
    ];

    protected $casts = [
        'type'   => AttendanceType::class,
        'status' => AttendanceStatus::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Normalisasi date -> "Y-m-d"
    public function setDateAttribute($value): void
    {
        try {
            $this->attributes['date'] = Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable $e) {
            $this->attributes['date'] = (string) $value;
        }
    }

    // Normalisasi time -> "H:i"
    public function setTimeAttribute($value): void
    {
        if (is_string($value) && preg_match('/^(\d{1,2}):(\d{1,2})/', $value, $m)) {
            $h = str_pad((string) min(23, (int) $m[1]), 2, '0', STR_PAD_LEFT);
            $i = str_pad((string) min(59, (int) $m[2]), 2, '0', STR_PAD_LEFT);
            $this->attributes['time'] = "{$h}:{$i}";
            return;
        }
        $this->attributes['time'] = (string) $value;
    }

    protected static function booted(): void
    {
        // 1) Pastikan date & time ada (default: sekarang)
        $ensureDateTime = function (self $model): void {
            $now = Carbon::now(); // pakai timezone app
            if (empty($model->date)) {
                $model->date = $now->format('Y-m-d'); // via mutator
            }
            if (empty($model->time)) {
                $model->time = $now->format('H:i');   // via mutator
            }
        };

        // 2) Hitung type & status + validasi
        $compute = function (self $model): void {
            $time = $model->time ?? '';

            if (!preg_match('/^\d{2}:\d{2}$/', (string) $time)) {
                throw ValidationException::withMessages([
                    'time' => 'Format waktu harus HH:MM.',
                ]);
            }

            // sebelum 07:00 tidak diperbolehkan
            // if ($time < '07:00') {
            //     throw ValidationException::withMessages([
            //         'time' => 'Presensi sebelum 07:00 tidak diperbolehkan.',
            //     ]);
            // }

            // Type: <18:00 => in, >=18:00 => out
            $model->type = $time >= '18:00'
                ? AttendanceType::Out->value
                : AttendanceType::In->value;

            // Status:
            // 07:00–07:59 => ontime
            // 08:00–18:00 => late  (18:00 termasuk late)
            // >18:00      => ontime
            if ($time < '08:00') {
                $model->status = AttendanceStatus::OnTime->value;
            } elseif ($time <= '18:00') {
                $model->status = AttendanceStatus::Late->value;
            } else {
                $model->status = AttendanceStatus::OnTime->value;
            }
        };

        static::creating(function (self $model) use ($ensureDateTime, $compute) {
            $ensureDateTime($model); // auto isi kalau kosong
            $compute($model);        // lalu hitung type & status
        });

        static::updating(function (self $model) use ($compute) {
            // Saat update, kalau time berubah, otomatis re-komputasi.
            $compute($model);
        });
    }
}
