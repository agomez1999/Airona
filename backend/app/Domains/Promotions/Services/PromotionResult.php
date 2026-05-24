<?php

namespace App\Domains\Promotions\Services;

use App\Domains\Promotions\Models\Promotion;

final class PromotionResult
{
    private function __construct(
        public readonly bool $valid,
        public readonly ?Promotion $promotion,
        public readonly int $discountCents,
        public readonly ?string $errorMessage,
    ) {}

    public static function valid(Promotion $promotion, int $discountCents): self
    {
        return new self(true, $promotion, $discountCents, null);
    }

    public static function invalid(string $message): self
    {
        return new self(false, null, 0, $message);
    }
}
