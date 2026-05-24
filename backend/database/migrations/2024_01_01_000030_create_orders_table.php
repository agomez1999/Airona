<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique()->comment('Human-readable, e.g. AIR-2024-00001');
            $table->string('customer_email');
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 50)->nullable();
            $table->jsonb('billing_address')->nullable();
            $table->string('locale', 10)->default('es');
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('total_cents');
            $table->char('currency', 3)->default('EUR');
            $table->enum('status', [
                'pending_payment',
                'paid',
                'failed',
                'refunded',
                'cancelled',
            ])->default('pending_payment');
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('promo_code_applied', 50)->nullable();
            $table->string('stripe_checkout_session_id')->nullable()->unique();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->uuid('idempotency_key')->unique()->comment('Used as Stripe idempotency key');
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index('customer_email');
            $table->index(['status', 'created_at']);
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
