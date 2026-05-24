<?php

namespace App\Domains\Promotions\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotion extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'min_order_cents',
        'max_uses',
        'used_count',
        'is_active',
        'applicable_product_ids',
        'starts_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'min_order_cents' => 'integer',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'applicable_product_ids' => 'array',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function isCurrentlyValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(int $subtotalCents): int
    {
        if ($this->discount_type === 'percentage') {
            return (int) round($subtotalCents * $this->discount_value / 100);
        }

        return min($this->discount_value, $subtotalCents);
    }
}
