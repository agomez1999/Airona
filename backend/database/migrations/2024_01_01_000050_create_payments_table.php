<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->unique();
            $table->string('stripe_payment_intent_id')->unique()->nullable();
            $table->string('stripe_checkout_session_id')->unique()->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->unsignedInteger('amount_cents');
            $table->char('currency', 3)->default('EUR');
            $table->enum('status', [
                'pending',
                'processing',
                'succeeded',
                'failed',
                'cancelled',
                'refunded',
            ])->default('pending');
            $table->string('payment_method', 50)->nullable()->comment('card, ideal, etc.');
            $table->jsonb('stripe_metadata')->nullable()->comment('Raw Stripe response snapshot');
            $table->string('failure_code', 100)->nullable();
            $table->text('failure_message')->nullable();
            $table->unsignedInteger('refunded_amount_cents')->default(0);
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('webhook_received_at')->nullable();
            $table->timestamps();

            $table->index('stripe_payment_intent_id');
            $table->index('stripe_checkout_session_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
