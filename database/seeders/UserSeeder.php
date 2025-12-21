<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Enums\Role;

// noraulia03@gmail.com // superadmin
// norauliaaa@gmail.com // admin
// norauliar03@gmail.com // user
class UserSeeder extends Seeder
{
    public function run()
    {
        $checkSuperAdmin = User::where('email', 'noraulia03@gmail.com')->first();
        if (!$checkSuperAdmin) {
            User::firstOrCreate([
                'name' => 'Super Admin',
                // TODO: ganti email
                'email' => 'noraulia03@gmail.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::SuperAdmin,
            ]);
        }
        $checkAdmin = User::where('email', 'norauliaaa@gmail.com')->first();
        if (!$checkAdmin) {
            User::firstOrCreate([
                'name' => 'Admin',
                // TODO: ganti email
                'email' => 'norauliaaa@gmail.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::Admin,
            ]);
        }
        $checkUser = User::where('email', 'norauliar03@gmail.com')->first();
        if (!$checkUser) {
            User::firstOrCreate([
                'name' => 'User',
                // TODO: ganti email
                'email' => 'norauliar03@gmail.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'role' => Role::User,
            ]);
        }
    }
}
