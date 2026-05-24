<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Domains\Products\Services\ProductService;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        $locale = $request->header('Accept-Language', $request->query('lang', 'es'));
        $locale = in_array($locale, ['es', 'ca', 'fr', 'en']) ? $locale : 'es';

        $products = $this->productService->getVisible($locale);

        return response()->json([
            'data' => $products->map(fn ($p) => new ProductResource($p, $locale)),
            'meta' => ['locale' => $locale, 'total' => $products->count()],
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = $request->header('Accept-Language', $request->query('lang', 'es'));
        $locale = in_array($locale, ['es', 'ca', 'fr', 'en']) ? $locale : 'es';

        $product = $this->productService->getBySlug($slug, $locale);

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json([
            'data' => new ProductResource($product, $locale),
            'meta' => ['locale' => $locale],
        ]);
    }
}
