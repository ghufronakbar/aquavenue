<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dateTime('check_in_at')->nullable()->after('midtrans_redirect_url');
            $table->dateTime('check_out_at')->nullable()->after('check_in_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['check_in_at', 'check_out_at']);
        });
    }
};
