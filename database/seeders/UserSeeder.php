<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\Role;

class UserSeeder extends Seeder
{
    public function run()
    {
        $checkSuperAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$checkSuperAdmin) {
            User::firstOrCreate([
                'name' => 'Super Admin',
                'email' => 'superadmin@example.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::SuperAdmin,
            ]);
        }
        $checkAdmin = User::where('email', 'admin@example.com')->first();
        if (!$checkAdmin) {
            User::firstOrCreate([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::Admin,
            ]);
        }
        $checkUser = User::where('email', 'user@example.com')->first();
        if (!$checkUser) {
            User::firstOrCreate([
                'name' => 'User',
                'email' => 'user@example.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::User,
            ]);
        }
    }
}
