<?php

namespace Database\Seeders;

use App\Models\Information;
use Illuminate\Database\Seeder;


class InformationSeeder extends Seeder
{
    public function run()
    {
        $countInformation = Information::count();
        if ($countInformation == 0) {
            Information::create([
                'attendance_key' => 'some-attendance-key',
            ]);
        }
    }
}
