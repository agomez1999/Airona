<?php

namespace App\Domains\Vouchers\Models;

use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Models\OrderItem;
use App\Domains\Products\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'order_item_id',
        'product_id',
        'code',
        'qr_payload',
        'status',
        'customer_email',
        'customer_name',
        'locale',
        'pdf_path',
        'pdf_generated_at',
        'email_sent_at',
        'reminder_sent_at',
        'expires_at',
        'activated_at',
        'redeemed_at',
        'redeemed_by_user_id',
        'refunded_at',
        'cancelled_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'pdf_generated_at' => 'datetime',
            'email_sent_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'expires_at' => 'datetime',
            'activated_at' => 'datetime',
            'redeemed_at' => 'datetime',
            'refunded_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function redeemedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redeemed_by_user_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(VoucherAuditLog::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired'
            || ($this->expires_at !== null && $this->expires_at->isPast());
    }
}
