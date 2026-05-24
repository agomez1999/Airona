<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Domains\Promotions\Services\PromotionValidationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function __construct(
        private readonly PromotionValidationService $service,
    ) {}

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal_cents' => ['required', 'integer', 'min:0'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer'],
        ]);

        $result = $this->service->validate(
            $request->string('code')->value(),
            $request->integer('subtotal_cents'),
            $request->input('product_ids', [])
        );

        if (! $result->valid) {
            return response()->json([
                'valid' => false,
                'message' => $result->errorMessage,
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $result->promotion->discount_type,
            'discount_value' => $result->promotion->discount_value,
            'discount_cents' => $result->discountCents,
            'code' => $result->promotion->code,
        ]);
    }
}
