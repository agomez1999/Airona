<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Promotions\Models\Promotion;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 50), 200);
        $promotions = Promotion::latest()->paginate($perPage);

        return response()->json([
            'data' => collect($promotions->items())->map(fn ($p) => $this->format($p)),
            'meta' => [
                'current_page' => $promotions->currentPage(),
                'last_page' => $promotions->lastPage(),
                'per_page' => $promotions->perPage(),
                'total' => $promotions->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promotions,code'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'min_order_cents' => ['nullable', 'integer', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $promotion = Promotion::create([
            'code' => strtoupper($data['code']),
            'discount_type' => $data['discount_type'] === 'fixed' ? 'fixed_amount' : 'percentage',
            'discount_value' => $data['discount_value'],
            'min_order_cents' => $data['min_order_cents'] ?? 0,
            'starts_at' => $data['valid_from'] ?? null,
            'expires_at' => $data['valid_until'] ?? null,
            'max_uses' => $data['max_uses'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json(['data' => $this->format($promotion)], 201);
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', "unique:promotions,code,{$promotion->id}"],
            'discount_type' => ['sometimes', 'in:percentage,fixed'],
            'discount_value' => ['sometimes', 'integer', 'min:1'],
            'min_order_cents' => ['nullable', 'integer', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        $mapped = [];
        if (isset($data['code'])) $mapped['code'] = strtoupper($data['code']);
        if (isset($data['discount_type'])) $mapped['discount_type'] = $data['discount_type'] === 'fixed' ? 'fixed_amount' : 'percentage';
        if (isset($data['discount_value'])) $mapped['discount_value'] = $data['discount_value'];
        if (array_key_exists('min_order_cents', $data)) $mapped['min_order_cents'] = $data['min_order_cents'] ?? 0;
        if (array_key_exists('valid_from', $data)) $mapped['starts_at'] = $data['valid_from'];
        if (array_key_exists('valid_until', $data)) $mapped['expires_at'] = $data['valid_until'];
        if (array_key_exists('max_uses', $data)) $mapped['max_uses'] = $data['max_uses'];
        if (isset($data['is_active'])) $mapped['is_active'] = $data['is_active'];

        $promotion->update($mapped);

        return response()->json(['data' => $this->format($promotion->fresh())]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json(['message' => 'Promotion deleted.']);
    }

    private function format(Promotion $p): array
    {
        return [
            'id' => $p->id,
            'code' => $p->code,
            'discount_type' => $p->discount_type === 'fixed_amount' ? 'fixed' : $p->discount_type,
            'discount_value' => $p->discount_value,
            'min_order_cents' => $p->min_order_cents,
            'valid_from' => $p->starts_at?->toISOString(),
            'valid_until' => $p->expires_at?->toISOString(),
            'max_uses' => $p->max_uses,
            'used_count' => $p->used_count,
            'is_active' => $p->is_active,
            'created_at' => $p->created_at?->toISOString(),
        ];
    }
}
