<?php

namespace App\Http\Controllers;

use App\Enums\AttendanceType;
use App\Enums\Role;
use App\Models\Attendance;
use App\Models\Information;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // MODE:
        // - Jika ?date=YYYY-MM-DD diberikan -> tampilkan satu hari itu dan include semua admin (yang belum absen pun ada barisnya)
        // - Jika tidak ada ?date -> tampilkan SEMUA hari yang ada di tabel attendance (atau batasi last 30 days kalau mau)

        $date = $request->query('date'); // optional

        // Ambil semua admin aktif
        $admins = User::query()
            ->where('role', Role::Admin)
            ->whereNull('deleted_at')
            ->select('id', 'name', 'email', 'image')
            ->orderBy('name')
            ->get();

        $adminIds = $admins->pluck('id')->all();

        // Basis attendance milik admin aktif
        $attendancesQuery = Attendance::query()
            ->whereIn('user_id', $adminIds)
            ->select('id', 'user_id', 'date', 'time', 'type', 'status');

        if ($date) {
            // Mode SATU HARI
            $attendancesQuery->where('date', $date);
        } else {
            // Mode SEMUA HARI (kalau mau dibatasi 30 hari terakhir, buka comment di bawah)
            // $attendancesQuery->where('date', '>=', now('Asia/Jakarta')->subDays(30)->toDateString());
        }

        // Ambil semua attendance yang relevan
        $attendances = $attendancesQuery->get();

        // Group per (user_id|date) agar kita dapat baris untuk setiap tanggal per user
        $grouped = $attendances->groupBy(function ($a) {
            return $a->user_id . '|' . $a->date;
        });

        $dataAttendances = collect();

        // 1) Bangun baris dari data attendance yang ada (akan mencakup banyak tanggal jika tanpa ?date)
        foreach ($grouped as $key => $rows) {
            [$userIdStr, $day] = explode('|', $key);
            $userId = (int) $userIdStr;

            // Earliest "in", latest "out" untuk hari tsb
            $inRow  = $rows->where('type', AttendanceType::In)->sortBy('time')->first();
            $outRow = $rows->where('type', AttendanceType::Out)->sortByDesc('time')->first();

            $u = $admins->firstWhere('id', $userId);

            $inStatus  = $inRow  ? (is_string($inRow->status)  ? $inRow->status  : ($inRow->status?->value ?? null)) : null;
            $outStatus = $outRow ? (is_string($outRow->status) ? $outRow->status : ($outRow->status?->value ?? null)) : null;

            $dataAttendances->push([
                'userId' => $userId,
                'user'   => [
                    'id'    => $u?->id,
                    'name'  => $u?->name,
                    'email' => $u?->email,
                    'image' => $u?->image,
                ],
                'date' => (string) $day,
                'time' => null, // (opsional, kalau tak dipakai di front-end)
                'in' => [
                    'id'     => $inRow->id   ?? null,
                    'time'   => $inRow->time ?? null,
                    'status' => $inStatus,
                ],
                'out' => [
                    'id'     => $outRow->id   ?? null,
                    'time'   => $outRow->time ?? null,
                    'status' => $outStatus,
                ],
            ]);
        }

        // 2) Jika mode SATU HARI, tambahkan baris untuk admin yang belum punya attendance di hari itu
        if ($date) {
            foreach ($admins as $u) {
                $exists = $dataAttendances->contains(function ($row) use ($u, $date) {
                    return $row['userId'] === $u->id && $row['date'] === $date;
                });

                if (!$exists) {
                    $dataAttendances->push([
                        'userId' => $u->id,
                        'user'   => [
                            'id'    => $u->id,
                            'name'  => $u->name,
                            'email' => $u->email,
                            'image' => $u->image,
                        ],
                        'date' => (string) $date,
                        'time' => null,
                        'in' => [
                            'id'     => null,
                            'time'   => null,
                            'status' => null,
                        ],
                        'out' => [
                            'id'     => null,
                            'time'   => null,
                            'status' => null,
                        ],
                    ]);
                }
            }
        }

        // Urutkan: tanggal desc, lalu nama asc
        $dataAttendances = $dataAttendances
            ->sortBy([
                // date desc
                fn($a, $b) => strcmp($b['date'], $a['date']),
                // name asc
                fn($a, $b) => strcmp($a['user']['name'] ?? '', $b['user']['name'] ?? ''),
            ])
            ->values();

        $attendanceKey = Information::getAttendanceKey();

        return Inertia::render('absensi/absensi-karyawan', [
            'dataAttendances' => $dataAttendances,
            'initialDate'     => $date ?? null,   // front-end bisa pakai untuk default filter hari
            'attendanceKey'   => $attendanceKey,
        ]);
    }


    public function makeAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendanceKey' => ['required', 'string'],
            ]);

            $attendanceKey = Information::getAttendanceKey();
            if ($attendanceKey !== $validated['attendanceKey']) {
                return response()->json(['message' => 'Kode presensi tidak valid'], 400);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'User tidak ditemukan'], 400);
            }
            if ($user->role !== Role::Admin) {
                return response()->json(['message' => 'User tidak memiliki role admin'], 400);
            }

            // === PAKAI TIMEZONE INDONESIA SECARA EKSPLISIT ===
            $tz  = config('app.timezone', 'Asia/Jakarta');
            $now = Carbon::now($tz);
            $date = $now->toDateString();     // "Y-m-d"
            $time = $now->format('H:i');      // "HH:MM"

            // if ($time < '07:00') {
            //     return response()->json(['message' => 'Presensi sebelum 07:00 tidak diperbolehkan.'], 400);
            // }

            $type = $time >= '18:00' ? AttendanceType::Out : AttendanceType::In;

            $existsSameType = Attendance::where('user_id', $user->id)
                ->where('date', $date)
                ->where('type', $type)
                ->exists();

            if ($existsSameType) {
                return response()->json([
                    'message' => $type === AttendanceType::In
                        ? 'Anda sudah absen masuk hari ini.'
                        : 'Anda sudah absen pulang hari ini.',
                ], 400);
            }

            if ($type === AttendanceType::Out) {
                $hasIn = Attendance::where('user_id', $user->id)
                    ->where('date', $date)
                    ->where('type', AttendanceType::In)
                    ->exists();
                if (!$hasIn) {
                    return response()->json(['message' => 'Anda belum absen masuk hari ini.'], 400);
                }
            }

            // === OPER date & time KE MODEL ===
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'date'    => $date,
                'time'    => $time,
            ]);


            return response()->json([
                'message'    => 'Presensi berhasil.',
                'attendance' => [
                    'id'     => $attendance->id,
                    'date'   => (string) $attendance->date,
                    'time'   => (string) $attendance->time,
                    'type'   => is_string($attendance->type) ? $attendance->type : $attendance->type->value,
                    'status' => is_string($attendance->status) ? $attendance->status : $attendance->status->value,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $ve->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Terjadi kesalahan', 'error' => $e->getMessage()], 500);
        }
    }
}
