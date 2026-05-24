<?php

namespace App\Domains\Orders\DTOs;

readonly class CreateOrderDTO
{
    /**
     * @param CartItemDTO[] $items
     */
    public function __construct(
        public array $items,
        public string $customerEmail,
        public ?string $customerName,
        public ?string $customerPhone,
        public ?array $billingAddress,
        public string $locale,
        public ?string $promoCode,
        public ?string $ipAddress,
        public string $successUrl,
        public string $cancelUrl,
    ) {}

    public static function fromRequest(array $data, string $ipAddress): self
    {
        $locale = in_array($data['locale'] ?? 'es', ['es', 'ca', 'fr', 'en'])
            ? $data['locale']
            : 'es';

        return new self(
            items: array_map(fn ($i) => CartItemDTO::fromArray($i), $data['items']),
            customerEmail: $data['customer_email'],
            customerName: $data['customer_name'] ?? null,
            customerPhone: $data['customer_phone'] ?? null,
            billingAddress: $data['billing_address'] ?? null,
            locale: $locale,
            promoCode: $data['promo_code'] ?? null,
            ipAddress: $ipAddress,
            successUrl: $data['success_url'],
            cancelUrl: $data['cancel_url'],
        );
    }
}
