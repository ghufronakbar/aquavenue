<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Information extends Model
{
    protected $table = 'informations';

    protected $fillable = [
        'attendance_key',
    ];

    /**
     * Ambil atau buat satu-satunya baris Information.
     */
    public static function instance(): self
    {
        return static::query()->firstOrCreate([], [
            'attendance_key' => 'some-attendance-key',
        ]);
    }

    public static function getAttendanceKey(): string
    {
        return static::instance()->attendance_key ?? '';
    }

    public static function setAttendanceKey(string $key): self
    {
        $info = static::instance();
        $info->attendance_key = $key;
        $info->save();

        return $info;
    }
}
