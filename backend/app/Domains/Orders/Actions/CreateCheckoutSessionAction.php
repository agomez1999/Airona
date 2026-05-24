<?php

namespace App\Domains\Orders\Actions;

use App\Domains\Orders\DTOs\CreateOrderDTO;
use App\Domains\Orders\Services\OrderService;
use App\Domains\Payments\Services\PaymentService;

class CreateCheckoutSessionAction
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly PaymentService $paymentService,
    ) {}

    public function execute(CreateOrderDTO $dto): array
    {
        ['order' => $order] = $this->orderService->createFromCart($dto);

        $checkoutUrl = $this->paymentService->createCheckoutSession(
            $order,
            $dto->successUrl,
            $dto->cancelUrl,
        );

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'checkout_url' => $checkoutUrl,
        ];
    }
}
