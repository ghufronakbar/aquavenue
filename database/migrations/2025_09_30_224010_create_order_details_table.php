<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('order_details', function (Blueprint $t) {
            $t->uuid('id')->primary();

            $t->uuid('order_id');
            $t->foreign('order_id')
                ->references('id')->on('orders')
                ->cascadeOnUpdate()
                ->cascadeOnDelete(); // hapus detail saat order dihapus

            $t->foreignId('facility_id')
                ->constrained('facilities')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $t->integer('quantity'); // >= 1
            $t->integer('price');    // harga satuan (rupiah)
            $t->integer('total');    // quantity * price (rupiah)

            $t->timestamp('created_at')->useCurrent();
            $t->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $t->index(['order_id', 'facility_id']);
            $t->unique(['order_id', 'facility_id']); // satu baris per facility per order
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_details');
    }
};
