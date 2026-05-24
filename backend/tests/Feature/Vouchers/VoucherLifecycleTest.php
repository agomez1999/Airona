<?php

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Models\VoucherAuditLog;
use App\Domains\Vouchers\Services\PdfVoucherService;
use App\Domains\Vouchers\Services\VoucherStateMachine;
use App\Exceptions\InvalidVoucherTransitionException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Models\OrderItem;
use App\Domains\Products\Models\Product;

uses(RefreshDatabase::class);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeActiveVoucher(array $overrides = []): Voucher
{
    $product = Product::factory()
        ->withTranslation('es', ['name' => 'Vuelo Globo', 'slug' => 'vuelo-globo-' . Str::random(4)])
        ->create(['price_cents' => 14900, 'is_visible' => true]);

    $order = Order::create([
        'order_number'                => 'AIR-2026-' . rand(10000, 99999),
        'customer_email'              => 'test@test.com',
        'locale'                      => 'es',
        'subtotal_cents'              => 14900,
        'discount_cents'              => 0,
        'total_cents'                 => 14900,
        'currency'                    => 'EUR',
        'status'                      => 'paid',
        'idempotency_key'             => Str::uuid()->toString(),
        'stripe_checkout_session_id'  => 'cs_test_' . Str::random(16),
    ]);

    $orderItem = OrderItem::create([
        'order_id'          => $order->id,
        'product_id'        => $product->id,
        'product_name'      => 'Vuelo Globo',
        'product_sku'       => $product->sku,
        'unit_price_cents'  => 14900,
        'quantity'          => 1,
        'subtotal_cents'    => 14900,
        'locale'            => 'es',
    ]);

    return Voucher::create(array_merge([
        'order_id'       => $order->id,
        'order_item_id'  => $orderItem->id,
        'product_id'     => $product->id,
        'code'           => 'AIRONA-TEST-' . Str::upper(Str::random(4)) . '-' . Str::upper(Str::random(4)),
        'qr_payload'     => 'http://localhost/admin/validate?code=AIRONA-TEST',
        'status'         => 'active',
        'customer_email' => 'test@test.com',
        'locale'         => 'es',
        'expires_at'     => now()->addYear(),
        'activated_at'   => now(),
    ], $overrides));
}

// ── VoucherStateMachine ───────────────────────────────────────────────────────

it('transitions active voucher to redeemed', function () {
    $voucher = makeActiveVoucher();
    $sm = app(VoucherStateMachine::class);

    $redeemed = $sm->transition($voucher, 'redeemed', 'admin', null, ['via' => 'test']);

    expect($redeemed->status)->toBe('redeemed');
    expect($redeemed->redeemed_at)->not->toBeNull();
    expect(VoucherAuditLog::where('voucher_id', $voucher->id)->where('action', 'redeemed')->exists())->toBeTrue();
});

it('throws on invalid transition from redeemed to active', function () {
    $voucher = makeActiveVoucher(['status' => 'redeemed', 'redeemed_at' => now()]);
    $sm = app(VoucherStateMachine::class);

    expect(fn () => $sm->transition($voucher, 'active'))
        ->toThrow(InvalidVoucherTransitionException::class);
});

it('throws on invalid transition from pending_payment to redeemed', function () {
    $voucher = makeActiveVoucher(['status' => 'pending_payment', 'activated_at' => null, 'expires_at' => null]);
    $sm = app(VoucherStateMachine::class);

    expect(fn () => $sm->transition($voucher, 'redeemed'))
        ->toThrow(InvalidVoucherTransitionException::class);
});

it('transitions active voucher to cancelled', function () {
    $voucher = makeActiveVoucher();
    $sm = app(VoucherStateMachine::class);

    $cancelled = $sm->transition($voucher, 'cancelled', 'admin', null, ['reason' => 'Test']);

    expect($cancelled->status)->toBe('cancelled');
    expect($cancelled->cancelled_at)->not->toBeNull();
    expect(VoucherAuditLog::where('voucher_id', $voucher->id)->where('action', 'cancelled')->exists())->toBeTrue();
});

it('canTransition returns true for valid move and false for invalid', function () {
    $voucher = makeActiveVoucher();
    $sm = app(VoucherStateMachine::class);

    expect($sm->canTransition($voucher, 'redeemed'))->toBeTrue();
    expect($sm->canTransition($voucher, 'active'))->toBeFalse();
});

// ── Admin voucher redeem endpoint ─────────────────────────────────────────────

it('admin can redeem an active voucher via the API', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/vouchers/{$voucher->code}/redeem")
        ->assertOk()
        ->assertJsonPath('voucher.status', 'redeemed');

    expect(Voucher::find($voucher->id)->status)->toBe('redeemed');
});

it('admin cannot redeem an already redeemed voucher', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher(['status' => 'redeemed', 'redeemed_at' => now()]);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/vouchers/{$voucher->code}/redeem")
        ->assertStatus(422);
});

it('admin cannot redeem an expired voucher', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher(['expires_at' => now()->subDay()]);

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/vouchers/{$voucher->code}/redeem")
        ->assertStatus(422)
        ->assertJsonPath('message', 'El vale ha expirado.');
});

it('admin can cancel an active voucher', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/admin/vouchers/{$voucher->code}/cancel", ['reason' => 'Customer request'])
        ->assertOk()
        ->assertJsonPath('voucher.status', 'cancelled');
});

it('admin validate endpoint returns valid for active in-date voucher', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher();

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/vouchers/validate', ['code' => $voucher->code])
        ->assertOk()
        ->assertJsonPath('valid', true);
});

it('admin validate endpoint returns invalid for expired voucher', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $voucher = makeActiveVoucher(['expires_at' => now()->subDay()]);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/vouchers/validate', ['code' => $voucher->code])
        ->assertStatus(422)
        ->assertJsonPath('valid', false);
});

it('admin can list vouchers with status filter', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    makeActiveVoucher(['status' => 'active']);
    makeActiveVoucher(['status' => 'redeemed', 'redeemed_at' => now()]);

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/vouchers?status=active')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// ── ExpireVouchersCommand ─────────────────────────────────────────────────────

it('expires active vouchers past their expiry date', function () {
    $expired = makeActiveVoucher(['expires_at' => now()->subDay()]);
    $valid   = makeActiveVoucher(['expires_at' => now()->addYear()]);

    $this->artisan('vouchers:expire')->assertSuccessful();

    expect(Voucher::find($expired->id)->status)->toBe('expired');
    expect(Voucher::find($valid->id)->status)->toBe('active');
    expect(VoucherAuditLog::where('voucher_id', $expired->id)->where('action', 'expired')->exists())->toBeTrue();
});

it('does not expire active vouchers that have not yet expired', function () {
    $voucher = makeActiveVoucher(['expires_at' => now()->addYear()]);

    $this->artisan('vouchers:expire')->assertSuccessful();

    expect(Voucher::find($voucher->id)->status)->toBe('active');
});

// ── SendVoucherExpirySoonRemindersCommand ─────────────────────────────────────

it('queues expiry reminder for vouchers expiring within 30 days', function () {
    Queue::fake();
    $soon    = makeActiveVoucher(['expires_at' => now()->addDays(15)]);
    $later   = makeActiveVoucher(['expires_at' => now()->addDays(60)]);

    $this->artisan('vouchers:send-expiry-reminders')->assertSuccessful();

    expect(Voucher::find($soon->id)->reminder_sent_at)->not->toBeNull();
    expect(Voucher::find($later->id)->reminder_sent_at)->toBeNull();
});

it('does not resend expiry reminder if already sent', function () {
    Queue::fake();
    $voucher = makeActiveVoucher([
        'expires_at'        => now()->addDays(15),
        'reminder_sent_at'  => now()->subDay(),
    ]);

    $this->artisan('vouchers:send-expiry-reminders')->assertSuccessful();

    // reminder_sent_at should not be updated (still the original value)
    expect(Voucher::find($voucher->id)->reminder_sent_at->isYesterday())->toBeTrue();
});

// ── PDF download signed URL ───────────────────────────────────────────────────

it('rejects voucher download with invalid signature', function () {
    $voucher = makeActiveVoucher(['pdf_path' => 'vouchers/test.pdf']);

    $this->get("/api/v1/vouchers/{$voucher->code}/download?signature=invalid")
        ->assertStatus(403);
});

it('generates a valid signed download URL', function () {
    $voucher = makeActiveVoucher(['pdf_path' => 'vouchers/test.pdf']);
    $pdfService = app(PdfVoucherService::class);

    $url = $pdfService->getDownloadUrl($voucher);

    expect($url)->toContain($voucher->code);
    expect($url)->toContain('signature=');

    // Verify the signed URL is valid
    expect(URL::hasValidSignature(request()->create($url)))->toBeTrue();
});

// ── PdfVoucherService ─────────────────────────────────────────────────────────

it('generates a PDF file and updates voucher record', function () {
    Storage::fake('local');
    Mail::fake();

    $voucher = makeActiveVoucher();
    $voucher->load(['product', 'order']);

    $pdfService = app(PdfVoucherService::class);
    $path = $pdfService->generate($voucher);

    expect($path)->toContain($voucher->id);
    expect(Storage::disk('local')->exists("private/{$path}"))->toBeTrue();
    expect(Voucher::find($voucher->id)->pdf_generated_at)->not->toBeNull();
    expect(Voucher::find($voucher->id)->pdf_path)->toBe($path);
});
