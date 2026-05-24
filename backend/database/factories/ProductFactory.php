<?php

namespace Database\Factories;

use App\Domains\Products\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->unique()->bothify('FLT-###??')),
            'type' => $this->faker->randomElement(['shared', 'private', 'gift', 'special']),
            'price_cents' => $this->faker->randomElement([14900, 19900, 29900, 39900]),
            'sale_price_cents' => null,
            'capacity' => $this->faker->optional()->randomElement([8, 12, 16]),
            'duration_minutes' => $this->faker->optional()->randomElement([90, 120, 150]),
            'is_visible' => true,
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }

    public function invisible(): static
    {
        return $this->state(['is_visible' => false]);
    }

    public function withTranslation(string $locale = 'es', array $overrides = []): static
    {
        return $this->afterCreating(function (Product $product) use ($locale, $overrides) {
            $name = $this->faker->words(3, true);
            $product->translations()->create(array_merge([
                'locale' => $locale,
                'name' => ucwords($name),
                'slug' => \Illuminate\Support\Str::slug($name) . '-' . $this->faker->unique()->numberBetween(100, 999),
                'description' => $this->faker->paragraph(),
                'short_description' => $this->faker->sentence(),
                'meta_title' => ucwords($name) . ' | Airona Globus',
                'meta_description' => $this->faker->text(155),
            ], $overrides));
        });
    }
}
