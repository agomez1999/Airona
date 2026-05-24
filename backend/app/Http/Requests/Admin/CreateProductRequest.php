<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'type' => ['required', 'in:shared,private,gift,special'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'sale_price_cents' => ['nullable', 'integer', 'min:0'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'is_visible' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'translations' => ['required', 'array', 'min:1'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.slug' => ['required', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
            'translations.*.short_description' => ['nullable', 'string', 'max:500'],
            'translations.*.meta_title' => ['nullable', 'string', 'max:70'],
            'translations.*.meta_description' => ['nullable', 'string', 'max:160'],
            'translations.*.og_title' => ['nullable', 'string', 'max:95'],
            'translations.*.og_description' => ['nullable', 'string', 'max:200'],
        ];
    }
}
