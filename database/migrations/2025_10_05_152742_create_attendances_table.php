<?php

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            // FK ke users
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Disimpan sebagai string sesuai permintaan
            $table->string('date', 10); // "yyyy-mm-dd"
            $table->string('time', 5);  // "hh:mm"

            // Enum sederhana (DB-level)
            $table->enum('type', array_column(AttendanceType::cases(), 'value'));
            $table->enum('status', array_column(AttendanceStatus::cases(), 'value'));

            $table->timestamps();

            // Index bantu
            $table->index(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
