<?php

use App\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $t) {
            $t->uuid('id')->primary();

            $t->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete(); // cegah hapus user yg punya order

            $t->enum('status', array_column(OrderStatus::cases(), 'value'))
                ->default(OrderStatus::Pending->value)
                ->index();

            $t->integer('tax');      // dalam rupiah
            $t->integer('subtotal'); // rupiah
            $t->integer('total');    // rupiah
            $t->integer('pool_price'); // rupiah

            $t->integer('amount');
            $t->integer('time');
            $t->date('date');

            $t->string('midtrans_snap_token');
            $t->string('midtrans_redirect_url');

            $t->timestamp('created_at')->useCurrent();
            $t->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $t->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
