<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Orders\Models\Order;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items'])
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('customer_email', 'like', "%{$search}%")
                      ->orWhere('order_number', 'like', "%{$search}%");
                });
            })
            ->when($request->input('from'), fn ($q, $from) => $q->where('created_at', '>=', $from))
            ->when($request->input('to'), fn ($q, $to) => $q->where('created_at', '<=', $to))
            ->latest();

        $perPage = min((int) $request->input('per_page', 20), 100);
        $orders = $query->paginate($perPage);

        return response()->json([
            'data' => collect($orders->items())->map(fn ($o) => $this->formatOrder($o)),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'vouchers']);

        return response()->json(['data' => $this->formatOrder($order)]);
    }

    public function refund(Order $order): JsonResponse
    {
        abort_if($order->status !== 'paid', 422, 'Only paid orders can be refunded.');

        $order->update([
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);

        return response()->json(['data' => $this->formatOrder($order)]);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_email' => $order->customer_email,
            'customer_name' => $order->customer_name,
            'status' => $order->status,
            'total_cents' => $order->total_cents,
            'locale' => $order->locale,
            'created_at' => $order->created_at?->toISOString(),
            'paid_at' => $order->paid_at?->toISOString(),
            'items' => $order->relationLoaded('items')
                ? $order->items->map(fn ($i) => [
                    'id' => $i->id,
                    'product_name' => $i->product_name,
                    'product_sku' => $i->product_sku,
                    'unit_price_cents' => $i->unit_price_cents,
                    'quantity' => $i->quantity,
                    'subtotal_cents' => $i->subtotal_cents,
                ])->all()
                : null,
        ];
    }
}
