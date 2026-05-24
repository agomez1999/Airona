<?php

namespace App\Domains\Payments\Services;

use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Models\OrderItem;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret_key'));
    }

    public function createCheckoutSession(Order $order, string $successUrl, string $cancelUrl): string
    {
        $order->load('items.product.translations');

        $lineItems = $order->items->map(function (OrderItem $item) {
            return [
                'price_data' => [
                    'currency' => strtolower($order->currency),
                    'product_data' => [
                        'name' => $item->product_name,
                    ],
                    'unit_amount' => $item->unit_price_cents,
                ],
                'quantity' => $item->quantity,
            ];
        })->toArray();

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'currency' => strtolower($order->currency),
            'customer_email' => $order->customer_email,
            'line_items' => $lineItems,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'expires_at' => now()->addMinutes(30)->timestamp,
            'metadata' => [
                'order_id' => $order->id,
                'idempotency_key' => $order->idempotency_key,
            ],
            'payment_intent_data' => [
                'metadata' => [
                    'order_id' => $order->id,
                ],
            ],
        ], [
            'idempotency_key' => $order->idempotency_key,
        ]);

        $order->update(['stripe_checkout_session_id' => $session->id]);

        return $session->url;
    }

    /**
     * @throws SignatureVerificationException
     */
    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent(
            $payload,
            $sigHeader,
            config('stripe.webhook_secret')
        );
    }
}
