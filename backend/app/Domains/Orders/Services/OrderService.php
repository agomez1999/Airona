<?php

namespace App\Domains\Orders\Services;

use App\Domains\Orders\DTOs\CreateOrderDTO;
use App\Domains\Orders\Models\Order;
use App\Domains\Orders\Models\OrderItem;
use App\Domains\Products\Models\Product;
use App\Domains\Promotions\Models\Promotion;
use App\Domains\Promotions\Services\PromotionValidationService;
use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Models\VoucherAuditLog;
use App\Domains\Vouchers\Services\VoucherCodeGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly PromotionValidationService $promoService,
        private readonly VoucherCodeGenerator $codeGenerator,
    ) {}

    /**
     * @throws \InvalidArgumentException when price validation fails or promo is invalid
     */
    public function createFromCart(CreateOrderDTO $dto): array
    {
        // ── 1. Validate prices against live DB ───────────────────────────────
        $products = Product::with('translations')
            ->whereIn('id', array_map(fn ($i) => $i->productId, $dto->items))
            ->visible()
            ->get()
            ->keyBy('id');

        $subtotalCents = 0;
        $validatedItems = [];

        foreach ($dto->items as $item) {
            $product = $products->get($item->productId);

            if (! $product) {
                throw new \InvalidArgumentException("Product {$item->productId} is not available.");
            }

            $unitPrice = $product->sale_price_cents ?? $product->price_cents;
            $translation = $product->translation($dto->locale)
                ?? $product->translation('es');

            $itemSubtotal = $unitPrice * $item->quantity;
            $subtotalCents += $itemSubtotal;

            $validatedItems[] = [
                'product' => $product,
                'translation' => $translation,
                'quantity' => $item->quantity,
                'unit_price_cents' => $unitPrice,
                'subtotal_cents' => $itemSubtotal,
            ];
        }

        // ── 2. Validate promo code (outside transaction — no DB writes yet) ──
        $discountCents = 0;
        $promotion = null;

        if ($dto->promoCode) {
            $result = $this->promoService->validate(
                $dto->promoCode,
                $subtotalCents,
                array_map(fn ($i) => $i->productId, $dto->items)
            );

            if (! $result->valid) {
                throw new \InvalidArgumentException($result->errorMessage);
            }

            $promotion = $result->promotion;
            $discountCents = $result->discountCents;
        }

        $totalCents = max(0, $subtotalCents - $discountCents);

        // ── 3. DB transaction: Order + OrderItems + Vouchers ─────────────────
        return DB::transaction(function () use ($dto, $validatedItems, $subtotalCents, $discountCents, $totalCents, $promotion) {
            // Lock promo row for update to prevent race condition on max_uses
            if ($promotion) {
                $promotion = Promotion::lockForUpdate()->find($promotion->id);
                if (! $promotion->isCurrentlyValid()) {
                    throw new \InvalidArgumentException('Promotion is no longer valid.');
                }
                $promotion->increment('used_count');
            }

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_email' => $dto->customerEmail,
                'customer_name' => $dto->customerName,
                'customer_phone' => $dto->customerPhone,
                'billing_address' => $dto->billingAddress,
                'locale' => $dto->locale,
                'subtotal_cents' => $subtotalCents,
                'discount_cents' => $discountCents,
                'total_cents' => $totalCents,
                'currency' => 'EUR',
                'status' => 'pending_payment',
                'promotion_id' => $promotion?->id,
                'promo_code_applied' => $promotion?->code,
                'idempotency_key' => Str::uuid()->toString(),
                'ip_address' => $dto->ipAddress,
            ]);

            $vouchers = [];

            foreach ($validatedItems as $item) {
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['translation']?->name ?? $item['product']->sku,
                    'product_sku' => $item['product']->sku,
                    'unit_price_cents' => $item['unit_price_cents'],
                    'quantity' => $item['quantity'],
                    'subtotal_cents' => $item['subtotal_cents'],
                    'locale' => $dto->locale,
                ]);

                // One voucher per quantity unit
                for ($q = 0; $q < $item['quantity']; $q++) {
                    $code = $this->codeGenerator->generate();
                    $voucher = Voucher::create([
                        'order_id' => $order->id,
                        'order_item_id' => $orderItem->id,
                        'product_id' => $item['product']->id,
                        'code' => $code,
                        'qr_payload' => config('app.url') . '/admin/validate?code=' . $code,
                        'status' => 'pending_payment',
                        'customer_email' => $dto->customerEmail,
                        'customer_name' => $dto->customerName,
                        'locale' => $dto->locale,
                    ]);

                    VoucherAuditLog::create([
                        'voucher_id' => $voucher->id,
                        'actor_type' => 'system',
                        'action' => 'created',
                        'metadata' => ['order_id' => $order->id],
                    ]);

                    $vouchers[] = $voucher;
                }
            }

            return ['order' => $order, 'vouchers' => $vouchers];
        });
    }

    public function markPaid(Order $order, string $paymentIntentId, string $sessionId): void
    {
        DB::transaction(function () use ($order, $paymentIntentId, $sessionId) {
            $order->update([
                'status' => 'paid',
                'stripe_payment_intent_id' => $paymentIntentId,
                'stripe_checkout_session_id' => $sessionId,
                'paid_at' => now(),
            ]);

            $expiresAt = now()->addDays(config('voucher.validity_days', 365));

            foreach ($order->vouchers as $voucher) {
                $voucher->update([
                    'status' => 'active',
                    'activated_at' => now(),
                    'expires_at' => $expiresAt,
                ]);

                VoucherAuditLog::create([
                    'voucher_id' => $voucher->id,
                    'actor_type' => 'system',
                    'action' => 'activated',
                    'metadata' => ['payment_intent_id' => $paymentIntentId],
                ]);
            }
        });
    }

    public function markFailed(Order $order): void
    {
        $order->update([
            'status' => 'failed',
            'failed_at' => now(),
        ]);

        foreach ($order->vouchers as $voucher) {
            $voucher->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            VoucherAuditLog::create([
                'voucher_id' => $voucher->id,
                'actor_type' => 'system',
                'action' => 'cancelled',
                'metadata' => ['reason' => 'payment_failed'],
            ]);
        }
    }

    public function getBySessionId(string $sessionId): ?Order
    {
        return Order::with('vouchers')->where('stripe_checkout_session_id', $sessionId)->first();
    }

    private function generateOrderNumber(): string
    {
        $year = now()->year;
        $count = Order::whereYear('created_at', $year)->count() + 1;

        return sprintf('AIR-%d-%05d', $year, $count);
    }
}
