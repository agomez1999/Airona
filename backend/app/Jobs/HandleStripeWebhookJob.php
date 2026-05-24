<?php

namespace App\Jobs;

use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Services\OrderService;
use App\Domains\Payments\Models\Payment;
use App\Events\OrderFailed;
use App\Events\PaymentConfirmed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class HandleStripeWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(
        public readonly string $eventType,
        public readonly array $eventData,
    ) {
        $this->onQueue('webhooks');
    }

    public function handle(OrderService $orderService): void
    {
        match ($this->eventType) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($orderService),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($orderService),
            default => Log::info('Unhandled Stripe webhook event', ['type' => $this->eventType]),
        };
    }

    private function handleCheckoutCompleted(OrderService $orderService): void
    {
        $session = $this->eventData;
        $sessionId = $session['id'];
        $paymentIntentId = $session['payment_intent'] ?? null;
        $orderId = $session['metadata']['order_id'] ?? null;

        if (! $orderId) {
            Log::error('checkout.session.completed: missing order_id in metadata', ['session_id' => $sessionId]);
            return;
        }

        $order = Order::with('vouchers')->find($orderId);

        if (! $order) {
            Log::error('checkout.session.completed: order not found', ['order_id' => $orderId]);
            return;
        }

        // Idempotency: already processed
        if ($order->isPaid()) {
            Log::info('checkout.session.completed: order already paid (idempotent)', ['order_id' => $orderId]);
            return;
        }

        $orderService->markPaid($order, $paymentIntentId, $sessionId);

        // Record payment
        Payment::create([
            'order_id' => $order->id,
            'stripe_payment_intent_id' => $paymentIntentId,
            'stripe_checkout_session_id' => $sessionId,
            'amount_cents' => $session['amount_total'] ?? $order->total_cents,
            'currency' => strtoupper($session['currency'] ?? 'EUR'),
            'status' => 'succeeded',
            'payment_method' => $session['payment_method_types'][0] ?? null,
            'stripe_metadata' => $session,
            'webhook_received_at' => now(),
        ]);

        PaymentConfirmed::dispatch($order->fresh());
    }

    private function handlePaymentFailed(OrderService $orderService): void
    {
        $intent = $this->eventData;
        $paymentIntentId = $intent['id'];

        $order = Order::with('vouchers')
            ->where('stripe_payment_intent_id', $paymentIntentId)
            ->orWhere(function ($q) use ($intent) {
                if (isset($intent['metadata']['order_id'])) {
                    $q->where('id', $intent['metadata']['order_id']);
                }
            })
            ->first();

        if (! $order) {
            Log::warning('payment_intent.payment_failed: order not found', ['payment_intent_id' => $paymentIntentId]);
            return;
        }

        if ($order->status === 'failed') {
            return;
        }

        $orderService->markFailed($order);

        Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'stripe_payment_intent_id' => $paymentIntentId,
                'amount_cents' => $intent['amount'] ?? $order->total_cents,
                'currency' => strtoupper($intent['currency'] ?? 'EUR'),
                'status' => 'failed',
                'failure_code' => $intent['last_payment_error']['code'] ?? null,
                'failure_message' => $intent['last_payment_error']['message'] ?? null,
                'stripe_metadata' => $intent,
                'webhook_received_at' => now(),
            ]
        );

        OrderFailed::dispatch($order->fresh());
    }
}
