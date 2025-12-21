<?php

namespace App\Http\Controllers\Management;

use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ManagementShowController extends Controller
{
    public function showPengguna()
    {
        $users = User::where('role', Role::User)->withCount('orders')->orderBy('name', 'asc')->get();
        return Inertia::render('management/pengguna', [
            'users' => $users,
        ]);
    }


    public function showKaryawan()
    {
        $users = User::query()
            ->orderBy('name', 'asc')
            ->where('role', Role::Admin->value)
            ->get();

        return Inertia::render('management/karyawan', [
            'users' => $users,
            'period_label' => now()->translatedFormat('F Y'),
        ]);
    }

    public function showFasilitas()
    {
        $facilities = Facility::withAvailableStock()->orderBy('updated_at', 'desc')->get();
        return Inertia::render('management/fasilitas', [
            'facilities' => $facilities,
        ]);
    }
}
