<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Uppercase, e.g. SUMMER20');
            $table->string('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount']);
            $table->unsignedInteger('discount_value')->comment('Percentage 0-100 OR fixed amount in cents');
            $table->unsignedInteger('min_order_cents')->default(0);
            $table->unsignedInteger('max_uses')->nullable()->comment('Null = unlimited');
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('applicable_product_ids')->nullable()->comment('Null = all products');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
