<?php

use App\Enums\FacilityType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $t) {
            $t->id();
            $t->string('facility_name');
            $t->integer('facility_price');
            $t->text('facility_description');
            $t->string('facility_image')->nullable();
            $t->enum('facility_type', array_column(FacilityType::cases(), 'value'));

            // Timestamps ala Prisma (DB-level default)
            $t->timestamp('created_at')->useCurrent();
            $t->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $t->index('facility_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
