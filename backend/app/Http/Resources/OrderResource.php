<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_email' => $this->customer_email,
            'customer_name' => $this->customer_name,
            'locale' => $this->locale,
            'subtotal_cents' => $this->subtotal_cents,
            'discount_cents' => $this->discount_cents,
            'total_cents' => $this->total_cents,
            'currency' => $this->currency,
            'status' => $this->status,
            'promo_code_applied' => $this->promo_code_applied,
            'paid_at' => $this->paid_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'vouchers' => $this->whenLoaded('vouchers', fn () =>
                $this->vouchers->map(fn ($v) => [
                    'id' => $v->id,
                    'code' => $v->code,
                    'status' => $v->status,
                    'expires_at' => $v->expires_at?->toISOString(),
                    'pdf_ready' => $v->pdf_path !== null,
                ])
            ),
        ];
    }
}
