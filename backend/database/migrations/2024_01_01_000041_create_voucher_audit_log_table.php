<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Append-only — no updated_at, no soft deletes, never modified
        Schema::create('voucher_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('voucher_id')->constrained('vouchers');
            $table->enum('actor_type', ['system', 'admin', 'customer'])->default('system');
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->comment('created|activated|redemption_attempted|redeemed|expired|refunded|cancelled|email_sent|pdf_generated|pdf_downloaded');
            $table->jsonb('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at');

            $table->index(['voucher_id', 'created_at']);
            $table->index('actor_id');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_audit_log');
    }
};
