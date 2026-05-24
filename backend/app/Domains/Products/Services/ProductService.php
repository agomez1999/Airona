<?php

namespace App\Domains\Products\Services;

use App\Domains\Products\Models\Product;
use App\Domains\Products\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function getVisible(string $locale): Collection
    {
        return Product::with(['translations', 'images'])
            ->visible()
            ->forLocale($locale)
            ->ordered()
            ->get();
    }

    public function getBySlug(string $slug, string $locale): ?Product
    {
        return Product::with(['translations', 'images'])
            ->visible()
            ->bySlug($slug, $locale)
            ->first();
    }

    public function getAll(): LengthAwarePaginator
    {
        return Product::with(['translations', 'images'])
            ->ordered()
            ->paginate(25);
    }

    public function findById(int $id): Product
    {
        return Product::with(['translations', 'images'])->findOrFail($id);
    }

    public function create(array $data, array $translations): Product
    {
        return DB::transaction(function () use ($data, $translations) {
            $product = Product::create($data);

            foreach ($translations as $locale => $translationData) {
                $product->translations()->create(array_merge(
                    $translationData,
                    ['locale' => $locale]
                ));
            }

            return $product->load('translations', 'images');
        });
    }

    public function update(Product $product, array $data, array $translations): Product
    {
        return DB::transaction(function () use ($product, $data, $translations) {
            $product->update($data);

            foreach ($translations as $locale => $translationData) {
                $product->translations()->updateOrCreate(
                    ['locale' => $locale],
                    $translationData
                );
            }

            return $product->load('translations', 'images');
        });
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function storeImage(Product $product, string $path, ?string $altText = null): ProductImage
    {
        $maxOrder = $product->images()->max('sort_order') ?? -1;

        return $product->images()->create([
            'path' => $path,
            'alt_text' => $altText,
            'sort_order' => $maxOrder + 1,
            'is_hero' => $product->images()->count() === 0,
        ]);
    }

    public function deleteImage(ProductImage $image): void
    {
        Storage::delete($image->path);
        $image->delete();
    }

    public function reorderImage(ProductImage $image, int $sortOrder): void
    {
        $image->update(['sort_order' => $sortOrder]);
    }
}
