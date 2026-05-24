<?php

use App\Http\Controllers\Api\V1\Admin\AdminBlogPostController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminPromotionController;
use App\Http\Controllers\Api\V1\Admin\AdminStatsController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminVoucherController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Public\CheckoutController;
use App\Http\Controllers\Api\V1\Public\OrderController;
use App\Http\Controllers\Api\V1\Public\ProductController;
use App\Http\Controllers\Api\V1\Public\PromotionController;
use App\Http\Controllers\Api\V1\Public\VoucherController;
use App\Http\Controllers\Api\V1\Webhooks\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// ── Stripe webhook (no CSRF, no rate limiting — Stripe sends from known IPs) ──
Route::post('v1/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class]);

// ── Public API v1 ─────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    Route::get('promotions/validate', [PromotionController::class, 'validate']);
    Route::post('checkout/sessions', [CheckoutController::class, 'store']);
    Route::get('orders/by-session/{sessionId}', [OrderController::class, 'bySession']);

    // Voucher PDF download — requires valid temporary signed URL
    Route::get('vouchers/{code}/download', [VoucherController::class, 'download'])
        ->name('vouchers.download');
});

// ── Admin API v1 ──────────────────────────────────────────────────────────────
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('products', AdminProductController::class);
    Route::post('products/{product}/images', [AdminProductController::class, 'uploadImage']);
    Route::delete('products/{product}/images/{image}', [AdminProductController::class, 'deleteImage']);
    Route::patch('products/{product}/images/{image}/reorder', [AdminProductController::class, 'reorderImage']);

    // Stats
    Route::get('stats/overview', [AdminStatsController::class, 'overview']);

    // Orders (read + refund)
    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::get('orders/{order}', [AdminOrderController::class, 'show']);
    Route::post('orders/{order}/refund', [AdminOrderController::class, 'refund']);

    // Promotions
    Route::apiResource('promotions', AdminPromotionController::class)->except(['show']);

    // Blog posts
    Route::get('blog/posts', [AdminBlogPostController::class, 'index']);
    Route::get('blog/posts/{id}', [AdminBlogPostController::class, 'show']);
    Route::post('blog/posts', [AdminBlogPostController::class, 'store']);
    Route::put('blog/posts/{id}', [AdminBlogPostController::class, 'update']);
    Route::delete('blog/posts/{id}', [AdminBlogPostController::class, 'destroy']);

    // Users (superadmin guard is inside the controller)
    Route::apiResource('users', AdminUserController::class)->except(['show']);

    // Vouchers
    Route::get('vouchers', [AdminVoucherController::class, 'index']);
    Route::get('vouchers/{code}', [AdminVoucherController::class, 'show']);
    Route::post('vouchers/validate', [AdminVoucherController::class, 'validate']);
    Route::patch('vouchers/{code}/redeem', [AdminVoucherController::class, 'redeem']);
    Route::patch('vouchers/{code}/cancel', [AdminVoucherController::class, 'cancel']);
    Route::post('vouchers/{code}/resend-email', [AdminVoucherController::class, 'resendEmail']);
    Route::get('vouchers/{code}/audit-log', [AdminVoucherController::class, 'auditLog']);
});
