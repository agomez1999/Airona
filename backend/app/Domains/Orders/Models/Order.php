<?php

namespace App\Domains\Orders\Models;

use App\Domains\Payments\Models\Payment;
use App\Domains\Promotions\Models\Promotion;
use App\Domains\Vouchers\Models\Voucher;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_number',
        'customer_email',
        'customer_name',
        'customer_phone',
        'billing_address',
        'locale',
        'subtotal_cents',
        'discount_cents',
        'total_cents',
        'currency',
        'status',
        'promotion_id',
        'promo_code_applied',
        'stripe_checkout_session_id',
        'stripe_payment_intent_id',
        'idempotency_key',
        'notes',
        'ip_address',
        'paid_at',
        'failed_at',
        'refunded_at',
    ];

    protected function casts(): array
    {
        return [
            'billing_address' => 'array',
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'total_cents' => 'integer',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending_payment';
    }
}
