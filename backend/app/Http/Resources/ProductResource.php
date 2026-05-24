<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function __construct($resource, private readonly string $locale = 'es')
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $translation = $this->translation($this->locale);

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'type' => $this->type,
            'price_cents' => $this->price_cents,
            'sale_price_cents' => $this->sale_price_cents,
            'capacity' => $this->capacity,
            'duration_minutes' => $this->duration_minutes,
            'name' => $translation?->name,
            'slug' => $translation?->slug,
            'description' => $translation?->description,
            'short_description' => $translation?->short_description,
            'meta_title' => $translation?->meta_title,
            'meta_description' => $translation?->meta_description,
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
