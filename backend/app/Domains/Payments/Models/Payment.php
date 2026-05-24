<?php

namespace App\Domains\Payments\Models;

use App\Domains\Orders\Models\Order;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'stripe_charge_id',
        'amount_cents',
        'currency',
        'status',
        'payment_method',
        'stripe_metadata',
        'failure_code',
        'failure_message',
        'refunded_amount_cents',
        'refunded_at',
        'webhook_received_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'refunded_amount_cents' => 'integer',
            'stripe_metadata' => 'array',
            'refunded_at' => 'datetime',
            'webhook_received_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
