<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders');
            $table->foreignId('order_item_id')->constrained('order_items');
            $table->foreignId('product_id')->constrained('products');
            $table->string('code', 32)->unique()->comment('Format: AIRONA-XXXX-XXXX-XXXX');
            $table->text('qr_payload')->comment('URL encoded in QR code for admin scanning');
            $table->enum('status', [
                'pending_payment',
                'active',
                'redeemed',
                'expired',
                'refunded',
                'cancelled',
            ])->default('pending_payment');
            $table->string('customer_email');
            $table->string('customer_name')->nullable();
            $table->string('locale', 10)->default('es');
            $table->string('pdf_path', 500)->nullable();
            $table->timestamp('pdf_generated_at')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable()->comment('30-day expiry reminder');
            $table->timestamp('expires_at')->nullable()->comment('Set to paid_at + 365 days on activation');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->foreignId('redeemed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Critical indexes
            $table->index(['status', 'expires_at']);
            $table->index('customer_email');
            $table->index('order_id');
            $table->index('product_id');
            $table->index(['status', 'reminder_sent_at'])->comment('For expiry reminder cron');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
