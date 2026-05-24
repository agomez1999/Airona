<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->enum('type', ['shared', 'private', 'gift', 'special']);
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('sale_price_cents')->nullable();
            $table->char('currency', 3)->default('EUR');
            $table->boolean('is_visible')->default(false);
            $table->smallInteger('capacity')->nullable()->comment('Max persons per voucher');
            $table->smallInteger('duration_minutes')->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_visible');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
