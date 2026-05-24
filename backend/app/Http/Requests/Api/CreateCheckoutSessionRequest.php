<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateCheckoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:10'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'billing_address' => ['nullable', 'array'],
            'billing_address.line1' => ['nullable', 'string', 'max:255'],
            'billing_address.city' => ['nullable', 'string', 'max:100'],
            'billing_address.country' => ['nullable', 'string', 'size:2'],
            'locale' => ['nullable', 'in:es,ca,fr,en'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'success_url' => ['required', 'string', 'starts_with:http', 'max:2048'],
            'cancel_url' => ['required', 'string', 'starts_with:http', 'max:2048'],
        ];
    }
}
