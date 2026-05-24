<?php

namespace App\Domains\Promotions\Services;

use App\Domains\Promotions\Models\Promotion;

final class PromotionValidationService
{
    public function validate(string $code, int $subtotalCents, array $productIds = []): PromotionResult
    {
        $promotion = Promotion::where('code', strtoupper($code))->first();

        if (! $promotion) {
            return PromotionResult::invalid('Promotion code not found.');
        }

        if (! $promotion->is_active) {
            return PromotionResult::invalid('This promotion is no longer active.');
        }

        if ($promotion->starts_at && $promotion->starts_at->isFuture()) {
            return PromotionResult::invalid('This promotion has not started yet.');
        }

        if ($promotion->expires_at && $promotion->expires_at->isPast()) {
            return PromotionResult::invalid('This promotion has expired.');
        }

        if ($promotion->max_uses !== null && $promotion->used_count >= $promotion->max_uses) {
            return PromotionResult::invalid('This promotion has reached its maximum uses.');
        }

        if ($subtotalCents < $promotion->min_order_cents) {
            $minFormatted = number_format($promotion->min_order_cents / 100, 2);
            return PromotionResult::invalid("Minimum order of €{$minFormatted} required.");
        }

        if ($promotion->applicable_product_ids !== null) {
            $applicable = array_intersect($productIds, $promotion->applicable_product_ids);
            if (empty($applicable)) {
                return PromotionResult::invalid('This promotion does not apply to the selected products.');
            }
        }

        $discountCents = $promotion->calculateDiscount($subtotalCents);

        return PromotionResult::valid($promotion, $discountCents);
    }

    public function incrementUsage(Promotion $promotion): void
    {
        Promotion::where('id', $promotion->id)->increment('used_count');
    }
}
