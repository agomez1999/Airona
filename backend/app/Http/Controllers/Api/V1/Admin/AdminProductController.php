<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Products\Models\Product;
use App\Domains\Products\Models\ProductImage;
use App\Domains\Products\Services\ProductService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(): JsonResponse
    {
        $products = $this->productService->getAll();

        return response()->json([
            'data' => AdminProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(CreateProductRequest $request): JsonResponse
    {
        $product = $this->productService->create(
            $request->only(['sku', 'type', 'price_cents', 'sale_price_cents', 'capacity', 'duration_minutes', 'is_visible', 'sort_order']),
            $request->input('translations', [])
        );

        return response()->json(['data' => new AdminProductResource($product)], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('translations', 'images');

        return response()->json(['data' => new AdminProductResource($product)]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->productService->update(
            $product,
            $request->only(['sku', 'type', 'price_cents', 'sale_price_cents', 'capacity', 'duration_minutes', 'is_visible', 'sort_order']),
            $request->input('translations', [])
        );

        return response()->json(['data' => new AdminProductResource($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return response()->json(['message' => 'Product archived.']);
    }

    public function uploadImage(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120', 'mimes:jpeg,jpg,png,webp'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $path = $request->file('image')->store('products', 'public');
        $image = $this->productService->storeImage($product, $path, $request->input('alt_text'));

        return response()->json([
            'data' => [
                'id' => $image->id,
                'url' => $image->url,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
                'is_hero' => $image->is_hero,
            ],
        ], 201);
    }

    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_if($image->product_id !== $product->id, 404);

        $this->productService->deleteImage($image);

        return response()->json(['message' => 'Image deleted.']);
    }

    public function reorderImage(Request $request, Product $product, ProductImage $image): JsonResponse
    {
        abort_if($image->product_id !== $product->id, 404);

        $request->validate(['sort_order' => ['required', 'integer', 'min:0']]);

        $this->productService->reorderImage($image, $request->integer('sort_order'));

        return response()->json(['message' => 'Image reordered.']);
    }
}
