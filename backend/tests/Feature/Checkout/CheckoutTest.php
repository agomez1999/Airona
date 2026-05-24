<?php

use App\Domains\Orders\Actions\CreateCheckoutSessionAction;
use App\Domains\Orders\DTOs\CreateOrderDTO;
use App\Domains\Orders\Models\Order;
use App\Domains\Products\Models\Product;
use App\Domains\Promotions\Models\Promotion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

// Helper: mock PaymentService to avoid hitting Stripe in tests
function mockPaymentService(string $fakeUrl = 'https://checkout.stripe.com/fake'): void
{
    \Illuminate\Support\Facades\App::bind(
        \App\Domains\Payments\Services\PaymentService::class,
        function () use ($fakeUrl) {
            $mock = \Mockery::mock(\App\Domains\Payments\Services\PaymentService::class);
            $mock->shouldReceive('createCheckoutSession')->andReturnUsing(function ($order) use ($fakeUrl) {
                $order->update(['stripe_checkout_session_id' => 'cs_test_fake_' . $order->id]);
                return $fakeUrl;
            });
            return $mock;
        }
    );
}

function makeProductWithTranslation(array $productOverrides = [], string $locale = 'es'): Product
{
    return Product::factory()
        ->withTranslation($locale, ['name' => 'Vuelo Compartido', 'slug' => 'vuelo-compartido'])
        ->create(array_merge(['price_cents' => 14900, 'is_visible' => true], $productOverrides));
}

function checkoutPayload(Product $product, array $overrides = []): array
{
    return array_merge([
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'customer_email' => 'buyer@test.com',
        'customer_name' => 'Test Buyer',
        'locale' => 'es',
        'success_url' => 'http://localhost:5173/es/confirmacion/ORDER_ID?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => 'http://localhost:5173/es/carrito',
    ], $overrides);
}

// ── Successful checkout ───────────────────────────────────────────────────────

it('creates an order and returns checkout URL', function () {
    mockPaymentService();
    $product = makeProductWithTranslation();

    $response = $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product));

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['order_id', 'order_number', 'checkout_url']]);

    $this->assertDatabaseHas('orders', [
        'customer_email' => 'buyer@test.com',
        'status' => 'pending_payment',
        'total_cents' => 14900,
    ]);

    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'unit_price_cents' => 14900,
        'product_sku' => $product->sku,
    ]);
});

it('stores a price snapshot in order_items regardless of product price changes', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['price_cents' => 14900]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product))->assertCreated();

    // Change product price after order creation
    $product->update(['price_cents' => 99900]);

    // The order item still has the original price
    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'unit_price_cents' => 14900,
    ]);
});

it('creates pending_payment vouchers for each quantity unit', function () {
    mockPaymentService();
    $product = makeProductWithTranslation();

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ]))->assertCreated();

    $this->assertDatabaseCount('vouchers', 2);
    $this->assertDatabaseHas('vouchers', ['status' => 'pending_payment', 'customer_email' => 'buyer@test.com']);
});

it('uses sale_price_cents when set', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['price_cents' => 19900, 'sale_price_cents' => 14900]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product))->assertCreated();

    $this->assertDatabaseHas('order_items', ['unit_price_cents' => 14900]);
    $this->assertDatabaseHas('orders', ['total_cents' => 14900]);
});

// ── Price validation ──────────────────────────────────────────────────────────

it('rejects invisible products', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['is_visible' => false]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product))
        ->assertUnprocessable();
});

// ── Promo code ────────────────────────────────────────────────────────────────

it('applies a valid percentage promo code', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['price_cents' => 20000]);

    Promotion::create([
        'code' => 'SAVE10',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'is_active' => true,
        'min_order_cents' => 0,
        'used_count' => 0,
    ]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, ['promo_code' => 'SAVE10']))
        ->assertCreated();

    $this->assertDatabaseHas('orders', [
        'promo_code_applied' => 'SAVE10',
        'subtotal_cents' => 20000,
        'discount_cents' => 2000,
        'total_cents' => 18000,
    ]);
});

it('applies a valid fixed amount promo code', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['price_cents' => 20000]);

    Promotion::create([
        'code' => 'FLAT5',
        'discount_type' => 'fixed_amount',
        'discount_value' => 500,
        'is_active' => true,
        'min_order_cents' => 0,
        'used_count' => 0,
    ]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, ['promo_code' => 'FLAT5']))
        ->assertCreated();

    $this->assertDatabaseHas('orders', ['discount_cents' => 500, 'total_cents' => 19500]);
});

it('rejects an expired promo code', function () {
    mockPaymentService();
    $product = makeProductWithTranslation();

    Promotion::create([
        'code' => 'EXPIRED',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'is_active' => true,
        'min_order_cents' => 0,
        'used_count' => 0,
        'expires_at' => now()->subDay(),
    ]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, ['promo_code' => 'EXPIRED']))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This promotion has expired.');
});

it('rejects a promo code that has exhausted its max uses', function () {
    mockPaymentService();
    $product = makeProductWithTranslation();

    Promotion::create([
        'code' => 'MAXED',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'is_active' => true,
        'min_order_cents' => 0,
        'max_uses' => 1,
        'used_count' => 1,
    ]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, ['promo_code' => 'MAXED']))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'This promotion has reached its maximum uses.');
});

it('increments promo used_count on successful checkout', function () {
    mockPaymentService();
    $product = makeProductWithTranslation(['price_cents' => 20000]);

    $promo = Promotion::create([
        'code' => 'COUNT1',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'is_active' => true,
        'min_order_cents' => 0,
        'used_count' => 0,
    ]);

    $this->postJson('/api/v1/checkout/sessions', checkoutPayload($product, ['promo_code' => 'COUNT1']))
        ->assertCreated();

    $this->assertEquals(1, $promo->fresh()->used_count);
});

// ── Validation ────────────────────────────────────────────────────────────────

it('rejects checkout with missing required fields', function () {
    $this->postJson('/api/v1/checkout/sessions', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['items', 'customer_email', 'success_url', 'cancel_url']);
});

// ── Promo validate endpoint ───────────────────────────────────────────────────

it('validates a promo code via the validate endpoint', function () {
    Promotion::create([
        'code' => 'VALID20',
        'discount_type' => 'percentage',
        'discount_value' => 20,
        'is_active' => true,
        'min_order_cents' => 0,
        'used_count' => 0,
    ]);

    $this->getJson('/api/v1/promotions/validate?code=VALID20&subtotal_cents=10000')
        ->assertOk()
        ->assertJson([
            'valid' => true,
            'discount_cents' => 2000,
        ]);
});

it('returns invalid for unknown promo code', function () {
    $this->getJson('/api/v1/promotions/validate?code=NOPE&subtotal_cents=10000')
        ->assertUnprocessable()
        ->assertJson(['valid' => false]);
});
