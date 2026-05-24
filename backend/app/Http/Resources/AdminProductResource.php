<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'type' => $this->type,
            'price_cents' => $this->price_cents,
            'sale_price_cents' => $this->sale_price_cents,
            'capacity' => $this->capacity,
            'duration_minutes' => $this->duration_minutes,
            'is_visible' => $this->is_visible,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'translations' => $this->translations->keyBy('locale')->map(fn ($t) => [
                'name' => $t->name,
                'slug' => $t->slug,
                'description' => $t->description,
                'short_description' => $t->short_description,
                'meta_title' => $t->meta_title,
                'meta_description' => $t->meta_description,
                'og_title' => $t->og_title,
                'og_description' => $t->og_description,
            ]),
            'images' => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'alt_text' => $img->alt_text,
                'sort_order' => $img->sort_order,
                'is_hero' => $img->is_hero,
            ]),
        ];
    }
}
