<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Orders\Models\Order;
use App\Domains\Products\Models\Product;
use App\Domains\Promotions\Models\Promotion;
use App\Domains\Vouchers\Models\Voucher;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear = $now->copy()->startOfYear();
        $in30Days = $now->copy()->addDays(30);

        // Voucher stats
        $vouchersSoldMonth = Voucher::whereIn('status', ['active', 'redeemed', 'expired'])
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $vouchersSoldYear = Voucher::whereIn('status', ['active', 'redeemed', 'expired'])
            ->where('created_at', '>=', $startOfYear)
            ->count();

        $activeVouchers = Voucher::where('status', 'active')->count();

        $expiring30Days = Voucher::where('status', 'active')
            ->where('expires_at', '<=', $in30Days)
            ->where('expires_at', '>=', $now)
            ->count();

        // Revenue stats (from paid orders)
        $revenueMonth = Order::where('status', 'paid')
            ->where('paid_at', '>=', $startOfMonth)
            ->sum('total_cents');

        $revenueYear = Order::where('status', 'paid')
            ->where('paid_at', '>=', $startOfYear)
            ->sum('total_cents');

        // Pending refunds (paid orders with refund requests - approximated as refunded status)
        $pendingRefunds = Order::where('status', 'refunded')
            ->whereNull('refunded_at')
            ->count();

        // Monthly revenue (last 12 months)
        $monthlyRevenue = Order::where('status', 'paid')
            ->where('paid_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->selectRaw("TO_CHAR(paid_at, 'YYYY-MM') as month, SUM(total_cents) as revenue_cents")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'revenue_cents' => (int) $r->revenue_cents])
            ->all();

        // Voucher status distribution
        $voucherStatusDist = Voucher::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => ['status' => $r->status, 'count' => (int) $r->count])
            ->all();

        // Recent orders (last 10)
        $recentOrders = Order::latest()
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer_email' => $o->customer_email,
                'customer_name' => $o->customer_name,
                'status' => $o->status,
                'total_cents' => $o->total_cents,
                'locale' => $o->locale,
                'created_at' => $o->created_at?->toISOString(),
                'paid_at' => $o->paid_at?->toISOString(),
            ])
            ->all();

        // New KPIs
        $totalProducts = Product::where('is_visible', true)->count();
        $totalOrders = Order::count();
        $activePromotions = Promotion::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', $now))
            ->count();
        $ordersThisMonth = Order::where('created_at', '>=', $startOfMonth)->count();

        return response()->json([
            'data' => [
                'vouchers_sold_month' => $vouchersSoldMonth,
                'revenue_month_cents' => (int) $revenueMonth,
                'vouchers_sold_year' => $vouchersSoldYear,
                'revenue_year_cents' => (int) $revenueYear,
                'active_vouchers' => $activeVouchers,
                'expiring_30_days' => $expiring30Days,
                'pending_refunds' => $pendingRefunds,
                'monthly_revenue' => $monthlyRevenue,
                'voucher_status_distribution' => $voucherStatusDist,
                'recent_orders' => $recentOrders,
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'active_promotions' => $activePromotions,
                'orders_this_month' => $ordersThisMonth,
            ],
        ]);
    }
}
