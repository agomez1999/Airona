<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'status'           => $this->status,
            'customer_email'   => $this->customer_email,
            'customer_name'    => $this->customer_name,
            'locale'           => $this->locale,
            'expires_at'       => $this->expires_at?->toIso8601String(),
            'activated_at'     => $this->activated_at?->toIso8601String(),
            'redeemed_at'      => $this->redeemed_at?->toIso8601String(),
            'pdf_ready'        => $this->pdf_generated_at !== null,
            'pdf_generated_at' => $this->pdf_generated_at?->toIso8601String(),
            'email_sent_at'    => $this->email_sent_at?->toIso8601String(),
            'notes'            => $this->notes,
            'order'            => $this->whenLoaded('order', fn () => [
                'id'           => $this->order->id,
                'order_number' => $this->order->order_number,
                'total_cents'  => $this->order->total_cents,
                'currency'     => $this->order->currency,
                'paid_at'      => $this->order->paid_at?->toIso8601String(),
            ]),
            'product'          => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'sku'  => $this->product->sku,
            ]),
            'audit_logs'       => $this->whenLoaded('auditLogs', fn () =>
                $this->auditLogs->map(fn ($log) => [
                    'action'     => $log->action,
                    'actor_type' => $log->actor_type,
                    'actor_id'   => $log->actor_id,
                    'metadata'   => $log->metadata,
                    'created_at' => $log->created_at->toIso8601String(),
                ])
            ),
        ];
    }
}
