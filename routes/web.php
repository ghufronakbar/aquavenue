<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Management\ManagementMutateController;
use App\Http\Controllers\Management\ManagementShowController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\DashboardController;

Route::group(['prefix' => ''], function () {
    Route::get('/', fn() => Inertia::render('landing/welcome'))->name('home');
    Route::get('testimonial', fn() => Inertia::render('landing/testimonial'))->name('testimonial');
});

Route::group(['prefix' => 'upload'], function () {
    Route::post('', [UploadController::class, 'store'])->name('upload.store');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Hanya SUPERADMIN
    Route::get('management-pengguna', [ManagementShowController::class, 'showPengguna'])
        ->middleware('role:superadmin')
        ->name('management-pengguna');

    // Hanya ADMIN & SUPERADMIN
    Route::group([
        'prefix' => 'management-fasilitas',
        'middleware' => ['role:admin,superadmin'],
    ], function () {
        Route::get('', [ManagementShowController::class, 'showFasilitas'])->name('management-fasilitas');
        Route::post('', [ManagementMutateController::class, 'addFasilitas'])->name('management-fasilitas.add');
        Route::put('/{id}', [ManagementMutateController::class, 'editFasilitas'])->name('management-fasilitas.edit');
        Route::patch('/{id}', [ManagementMutateController::class, 'addAmountFasilitas'])->name('management-fasilitas.add-amount');
        Route::delete('/{id}', [ManagementMutateController::class, 'deleteFasilitas'])->name('management-fasilitas.delete');
    });

    // Pesan
    Route::group(['prefix' => 'pesan'], function () {
        Route::get('', [OrderController::class, 'index'])->middleware('role:user')->name('pesan.index'); // user
        Route::post('check-pool-capacity', [OrderController::class, 'checkPoolCapacity'])->name('pesan.check-pool-capacity'); // user+admin+superadmin
        Route::post('', [OrderController::class, 'store'])->middleware('role:user')->name('pesan.store');  // user
        Route::get('invoice/{orderId}', [OrderController::class, 'showInvoice'])->name('pesan.invoice.show'); // user+admin+superadmin
        Route::post('cancel-order/{orderId}', [OrderController::class, 'cancelOrder'])->middleware('role:user')->name('pesan.cancel-order'); // user

        // Hanya ADMIN & SUPERADMIN
        Route::post('check-in-out-order', [OrderController::class, 'checkInOutOrder'])
            ->middleware('role:admin,superadmin')
            ->name('pesan.check-in-out-order');

        Route::get('/riwayat', [OrderController::class, 'allHistory'])->name('pesan.riwayat-pesanan'); // user+admin+superadmin
    });

    // Hanya SUPERADMIN
    Route::group([
        'prefix' => 'management-karyawan',
        'middleware' => ['role:superadmin'],
    ], function () {
        Route::get('', [ManagementShowController::class, 'showKaryawan'])->name('management-karyawan');
        Route::post('', [ManagementMutateController::class, 'addKaryawan'])->name('management-karyawan.add');
        Route::delete('/{id}', [ManagementMutateController::class, 'deleteKaryawan'])->name('management-karyawan.delete');
    });

    Route::group([
        'prefix' => 'dashboard',
    ], function () {
        Route::get('', [DashboardController::class, 'index'])->name('dashboard'); // semua role
        Route::get('data', [DashboardController::class, 'data'])->name('dashboard.data'); // semua role
        Route::post('pool-information', [DashboardController::class, 'updatePoolInformation'])->name('dashboard.pool-information'); // superadmin
    });
});

// Route::get('dashboard/data', [DashboardController::class, 'data'])->name('dashboard.data');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
