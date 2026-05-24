<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Domains\Orders\Services\OrderService;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    public function bySession(string $sessionId): JsonResponse
    {
        $order = $this->orderService->getBySessionId($sessionId);

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => new OrderResource($order)]);
    }
}
