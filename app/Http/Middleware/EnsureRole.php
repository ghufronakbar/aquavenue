<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Pakai: ->middleware('role:admin,superadmin')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            // auth/verified sudah handle redirect ke login.
            // Jaga-jaga kalau dipakai tanpa 'auth'
            return redirect()->route('login');
        }

        // Normalisasi daftar role yang diizinkan
        $allowed = collect($roles)
            ->flatten()
            ->map(fn($r) => strtolower((string) $r))
            ->all();

        // Ambil role user (mendukung enum/backed enum/string)
        $userRole = $user->role instanceof \BackedEnum
            ? strtolower($user->role->value)
            : strtolower((string) $user->role);

        if (in_array($userRole, $allowed, true)) {
            return $next($request);
        }

        // Jika request JSON/AJAX, kembalikan 403 JSON
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        // Selain itu redirect ke dashboard + flash message
        return redirect()
            ->route('dashboard')
            ->with('error', 'Anda tidak berhak mengakses halaman tersebut.');
    }
}
