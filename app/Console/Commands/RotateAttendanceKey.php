<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\Information;

class RotateAttendanceKey extends Command
{
    protected $signature = 'attendance:rotate-key';
    protected $description = 'Rotate informations.attendance_key with a new UUID';

    public function handle(): int
    {
        // Generate UUID v4 dan simpan ke baris tunggal Information
        $key = (string) Str::uuid();
        Information::setAttendanceKey($key); // pakai method di model kamu
        $this->info("attendance_key updated: {$key}");
        return self::SUCCESS;
    }
}
