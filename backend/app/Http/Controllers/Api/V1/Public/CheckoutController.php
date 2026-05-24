<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Domains\Orders\Actions\CreateCheckoutSessionAction;
use App\Domains\Orders\DTOs\CreateOrderDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateCheckoutSessionRequest;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CreateCheckoutSessionAction $action,
    ) {}

    public function store(CreateCheckoutSessionRequest $request): JsonResponse
    {
        try {
            $dto = CreateOrderDTO::fromRequest(
                $request->validated(),
                $request->ip() ?? '127.0.0.1'
            );

            $result = $this->action->execute($dto);

            return response()->json(['data' => $result], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => 'Failed to create checkout session. Please try again.'], 500);
        }
    }
}
