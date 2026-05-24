<?php

use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Models\OrderItem;
use App\Domains\Orders\Services\OrderService;
use App\Domains\Payments\Services\PaymentService;
use App\Domains\Products\Models\Product;
use App\Domains\Vouchers\Models\Voucher;
use App\Jobs\HandleStripeWebhookJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Stripe\Event as StripeEvent;

uses(RefreshDatabase::class);

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripeSignedPayload(array $eventData): array
{
    $timestamp = time();
    $body = json_encode($eventData);
    $secret = config('stripe.webhook_secret');
    $signature = hash_hmac('sha256', "{$timestamp}.{$body}", $secret);
    $header = "t={$timestamp},v1={$signature}";

    return ['body' => $body, 'header' => $header];
}

function makePendingOrder(): Order
{
    $product = Product::factory()
        ->withTranslation('es', ['name' => 'Test Flight', 'slug' => 'test-flight-' . Str::random(4)])
        ->create(['price_cents' => 14900, 'is_visible' => true]);

    $order = Order::create([
        'order_number' => 'AIR-2026-' . rand(10000, 99999),
        'customer_email' => 'buyer@test.com',
        'locale' => 'es',
        'subtotal_cents' => 14900,
        'discount_cents' => 0,
        'total_cents' => 14900,
        'currency' => 'EUR',
        'status' => 'pending_payment',
        'idempotency_key' => Str::uuid()->toString(),
        'stripe_checkout_session_id' => 'cs_test_' . Str::random(16),
    ]);

    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => 'Test Flight',
        'product_sku' => $product->sku,
        'unit_price_cents' => 14900,
        'quantity' => 1,
        'subtotal_cents' => 14900,
        'locale' => 'es',
    ]);

    Voucher::create([
        'order_id' => $order->id,
        'order_item_id' => $orderItem->id,
        'product_id' => $product->id,
        'code' => 'AIRONA-TEST-' . Str::upper(Str::random(4)) . '-' . Str::upper(Str::random(4)),
        'qr_payload' => 'http://localhost/admin/validate?code=AIRONA-TEST',
        'status' => 'pending_payment',
        'customer_email' => 'buyer@test.com',
        'locale' => 'es',
    ]);

    return $order->load('vouchers');
}

// ── Webhook endpoint security ─────────────────────────────────────────────────

it('rejects webhooks with invalid signature', function () {
    // call() bypasses withHeaders — must use HTTP_* server vars directly
    $this->call('POST', '/api/v1/webhooks/stripe', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => 'invalid',
        'CONTENT_TYPE' => 'application/json',
    ], '{"type":"test"}')
        ->assertStatus(400);
});

it('accepts webhooks with valid signature and dispatches job', function () {
    Queue::fake();

    $order = makePendingOrder();
    $sessionId = $order->stripe_checkout_session_id;

    $eventData = [
        'id' => 'evt_test_' . Str::random(16),
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => $sessionId,
                'object' => 'checkout.session',
                'amount_total' => 14900,
                'currency' => 'eur',
                'payment_intent' => 'pi_test_' . Str::random(16),
                'payment_method_types' => ['card'],
                'status' => 'complete',
                'metadata' => [
                    'order_id' => $order->id,
                    'idempotency_key' => $order->idempotency_key,
                ],
            ],
        ],
    ];

    ['body' => $body, 'header' => $header] = stripeSignedPayload($eventData);

    $this->call('POST', '/api/v1/webhooks/stripe', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => $header,
        'CONTENT_TYPE' => 'application/json',
    ], $body)
        ->assertOk();

    Queue::assertPushed(HandleStripeWebhookJob::class);
});

// ── HandleStripeWebhookJob: checkout.session.completed ────────────────────────

it('marks order as paid and activates vouchers on checkout.session.completed', function () {
    $order = makePendingOrder();

    $job = new HandleStripeWebhookJob('checkout.session.completed', [
        'id' => $order->stripe_checkout_session_id,
        'amount_total' => 14900,
        'currency' => 'eur',
        'payment_intent' => 'pi_test_' . Str::random(16),
        'payment_method_types' => ['card'],
        'status' => 'complete',
        'metadata' => [
            'order_id' => $order->id,
            'idempotency_key' => $order->idempotency_key,
        ],
    ]);

    $job->handle(app(OrderService::class));

    expect(Order::find($order->id)->status)->toBe('paid');
    expect(Voucher::where('order_id', $order->id)->first()->status)->toBe('active');
    expect(Voucher::where('order_id', $order->id)->first()->expires_at)->not->toBeNull();
    $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'succeeded']);
    $this->assertDatabaseHas('voucher_audit_log', ['action' => 'activated']);
});

it('is idempotent — second job with same session does not re-process paid order', function () {
    $order = makePendingOrder();
    $sessionData = [
        'id' => $order->stripe_checkout_session_id,
        'amount_total' => 14900,
        'currency' => 'eur',
        'payment_intent' => 'pi_test_' . Str::random(16),
        'payment_method_types' => ['card'],
        'status' => 'complete',
        'metadata' => [
            'order_id' => $order->id,
            'idempotency_key' => $order->idempotency_key,
        ],
    ];

    $orderService = app(OrderService::class);

    // First delivery
    (new HandleStripeWebhookJob('checkout.session.completed', $sessionData))->handle($orderService);
    $voucherCountAfterFirst = Voucher::where('order_id', $order->id)->count();

    // Second delivery (duplicate)
    (new HandleStripeWebhookJob('checkout.session.completed', $sessionData))->handle($orderService);

    expect(Voucher::where('order_id', $order->id)->count())->toBe($voucherCountAfterFirst);
    expect(Order::find($order->id)->status)->toBe('paid');
});

// ── HandleStripeWebhookJob: payment_intent.payment_failed ─────────────────────

it('marks order as failed and cancels vouchers on payment_intent.payment_failed', function () {
    $order = makePendingOrder();

    $job = new HandleStripeWebhookJob('payment_intent.payment_failed', [
        'id' => 'pi_test_' . Str::random(16),
        'amount' => 14900,
        'currency' => 'eur',
        'metadata' => ['order_id' => $order->id],
        'last_payment_error' => [
            'code' => 'card_declined',
            'message' => 'Your card was declined.',
        ],
    ]);

    $job->handle(app(OrderService::class));

    expect(Order::find($order->id)->status)->toBe('failed');
    expect(Voucher::where('order_id', $order->id)->first()->status)->toBe('cancelled');
});

// ── Order by session endpoint ─────────────────────────────────────────────────

it('returns order by stripe session id', function () {
    $order = makePendingOrder();

    $this->getJson("/api/v1/orders/by-session/{$order->stripe_checkout_session_id}")
        ->assertOk()
        ->assertJsonPath('data.status', 'pending_payment')
        ->assertJsonPath('data.customer_email', 'buyer@test.com');
});

it('returns paid order with voucher info after payment', function () {
    $order = makePendingOrder();
    $orderService = app(OrderService::class);

    (new HandleStripeWebhookJob('checkout.session.completed', [
        'id' => $order->stripe_checkout_session_id,
        'amount_total' => 14900,
        'currency' => 'eur',
        'payment_intent' => 'pi_test_' . Str::random(16),
        'payment_method_types' => ['card'],
        'status' => 'complete',
        'metadata' => ['order_id' => $order->id, 'idempotency_key' => $order->idempotency_key],
    ]))->handle($orderService);

    $this->getJson("/api/v1/orders/by-session/{$order->stripe_checkout_session_id}")
        ->assertOk()
        ->assertJsonPath('data.status', 'paid')
        ->assertJsonStructure(['data' => ['vouchers']]);
});

it('returns 404 for unknown session id', function () {
    $this->getJson('/api/v1/orders/by-session/cs_unknown')->assertNotFound();
});
