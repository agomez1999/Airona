<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'type' => ['sometimes', 'in:shared,private,gift,special'],
            'price_cents' => ['sometimes', 'integer', 'min:0'],
            'sale_price_cents' => ['nullable', 'integer', 'min:0'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'is_visible' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'translations' => ['sometimes', 'array'],
            'translations.*.name' => ['required_with:translations', 'string', 'max:255'],
            'translations.*.slug' => ['required_with:translations', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
            'translations.*.short_description' => ['nullable', 'string', 'max:500'],
            'translations.*.meta_title' => ['nullable', 'string', 'max:70'],
            'translations.*.meta_description' => ['nullable', 'string', 'max:160'],
            'translations.*.og_title' => ['nullable', 'string', 'max:95'],
            'translations.*.og_description' => ['nullable', 'string', 'max:200'],
        ];
    }
}
