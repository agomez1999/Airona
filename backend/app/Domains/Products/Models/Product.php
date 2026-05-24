<?php

namespace App\Domains\Products\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }

    protected $fillable = [
        'sku',
        'type',
        'price_cents',
        'sale_price_cents',
        'capacity',
        'duration_minutes',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
            'price_cents' => 'integer',
            'sale_price_cents' => 'integer',
            'capacity' => 'integer',
            'duration_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function translation(string $locale): ?ProductTranslation
    {
        return $this->translations->firstWhere('locale', $locale);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    public function scopeForLocale(Builder $query, string $locale): Builder
    {
        return $query->whereHas('translations', fn (Builder $q) => $q->where('locale', $locale));
    }

    public function scopeBySlug(Builder $query, string $slug, string $locale): Builder
    {
        return $query->whereHas(
            'translations',
            fn (Builder $q) => $q->where('locale', $locale)->where('slug', $slug)
        );
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
