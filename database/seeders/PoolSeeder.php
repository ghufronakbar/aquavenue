<?php

namespace Database\Seeders;

use App\Models\Pool;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\Role;

class PoolSeeder extends Seeder
{
    public function run()
    {
        $countPool = Pool::count();
        if ($countPool == 0) {
            Pool::create([
                'capacity' => 10,
                'price' => 100000,
            ]);
        }
    }
}
