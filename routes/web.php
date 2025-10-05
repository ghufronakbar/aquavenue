<?php

use App\Http\Controllers\Management\ManagementMutateController;
use App\Http\Controllers\Management\ManagementShowController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('landing/welcome');
// })->name('home');
Route::group(['prefix' => ''], function () {
    Route::get('/', function () {
        return Inertia::render('landing/welcome');
    })->name('home');
    Route::get('testimonial', function () {
        return Inertia::render('landing/testimonial');
    })->name('testimonial');
});

Route::group(['prefix' => 'pesan'], function () {
    Route::get('', [OrderController::class, 'index'])->name('pesan.index');
    Route::post('check-pool-capacity', [OrderController::class, 'checkPoolCapacity'])->name('pesan.check-pool-capacity');
    Route::middleware(['auth'])->group(function () {
        Route::post('', [OrderController::class, 'store'])->name('pesan.store');
        Route::get('invoice/{orderId}', [OrderController::class, 'showInvoice'])->name('pesan.invoice.show');
        Route::post('cancel-order/{orderId}', [OrderController::class, 'cancelOrder'])->name('pesan.cancel-order');
        Route::post('check-in-out-order', [OrderController::class, 'checkInOutOrder'])->name('pesan.check-in-out-order');
    });
});

Route::group(['prefix' => 'upload'], function () {
    Route::post('', [UploadController::class, 'store'])->name('upload.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('management-pengguna', [ManagementShowController::class, 'showPengguna'])->name('management-pengguna');

    Route::group(['prefix' => 'management-fasilitas'], function () {
        Route::get('', [ManagementShowController::class, 'showFasilitas'])->name('management-fasilitas');
        Route::post('', [ManagementMutateController::class, 'addFasilitas'])->name('management-fasilitas.add');
        Route::put('/{id}', [ManagementMutateController::class, 'editFasilitas'])->name('management-fasilitas.edit');
        Route::patch('/{id}', [ManagementMutateController::class, 'addAmountFasilitas'])->name('management-fasilitas.add-amount');
        Route::delete('/{id}', [ManagementMutateController::class, 'deleteFasilitas'])->name('management-fasilitas.delete');
    });

    Route::group(['prefix' => 'management-karyawan'], function () {
        Route::get('', [ManagementShowController::class, 'showKaryawan'])->name('management-karyawan');
        Route::post('', [ManagementMutateController::class, 'addKaryawan'])->name('management-karyawan.add');
        Route::delete('/{id}', [ManagementMutateController::class, 'deleteKaryawan'])->name('management-karyawan.delete');
    });


    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::group(['prefix' => 'absensi-karyawan'], function () {
        Route::get('', [AttendanceController::class, 'index'])->name('absensi-karyawan');
        Route::post('make-attendance', [AttendanceController::class, 'makeAttendance'])->name('absensi-karyawan.make-attendance');
    });

    Route::group(['prefix' => 'riwayat-pesanan'], function () {
        Route::get('', [OrderController::class, 'allHistory'])->name('riwayat-pesanan');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
