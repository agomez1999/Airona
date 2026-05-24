<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            // Snapshots at time of purchase — never updated
            $table->string('product_name')->comment('Snapshot: product name at purchase time');
            $table->string('product_sku')->comment('Snapshot: SKU at purchase time');
            $table->unsignedInteger('unit_price_cents')->comment('Snapshot: price at purchase time');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedInteger('subtotal_cents');
            $table->string('locale', 10)->default('es');
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
