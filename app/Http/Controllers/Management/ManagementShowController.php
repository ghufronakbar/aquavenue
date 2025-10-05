<?php

namespace App\Http\Controllers\Management;

use App\Enums\AttendanceType;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Attendance;

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
        $start = now()->startOfMonth()->toDateString(); // "YYYY-MM-DD"
        $end   = now()->endOfMonth()->toDateString();

        $users = User::query()
            ->orderBy('name', 'asc')
            ->where('role', Role::Admin->value)
            ->withCount([
                // alias agar mudah dipakai di view: attends_this_month_count
                'attendances as attends_this_month_count' => function ($q) use ($start, $end) {
                    $q->where('type', AttendanceType::Out->value)
                        ->whereBetween('date', [$start, $end]); // kolom date kamu string
                },
            ])
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
