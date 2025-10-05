<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facility_stock_ins', function (Blueprint $t) {
            $t->id();

            $t->foreignId('facility_id')
                ->constrained('facilities')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $t->integer('stock');

            $t->timestamp('created_at')->useCurrent();
            $t->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $t->index(['facility_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_stock_ins');
    }
};
