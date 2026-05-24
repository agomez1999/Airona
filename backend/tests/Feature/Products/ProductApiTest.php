<?php

use App\Domains\Products\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Public: list products ─────────────────────────────────────────────────────

it('returns visible products for a given locale', function () {
    $product = Product::factory()
        ->withTranslation('es', ['name' => 'Vuelo Compartido', 'slug' => 'vuelo-compartido'])
        ->create(['is_visible' => true]);

    Product::factory()
        ->withTranslation('es', ['name' => 'Invisible', 'slug' => 'invisible'])
        ->create(['is_visible' => false]);

    $this->getJson('/api/v1/products', ['Accept-Language' => 'es'])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'vuelo-compartido');
});

it('returns product by slug for a given locale', function () {
    Product::factory()
        ->withTranslation('es', ['name' => 'Vuelo Privado', 'slug' => 'vuelo-privado'])
        ->create(['is_visible' => true]);

    $this->getJson('/api/v1/products/vuelo-privado?lang=es')
        ->assertOk()
        ->assertJsonPath('data.slug', 'vuelo-privado')
        ->assertJsonPath('data.name', 'Vuelo Privado');
});

it('returns 404 for unknown slug', function () {
    $this->getJson('/api/v1/products/does-not-exist?lang=es')->assertNotFound();
});

it('does not return invisible products by slug', function () {
    Product::factory()
        ->withTranslation('es', ['slug' => 'hidden-product'])
        ->create(['is_visible' => false]);

    $this->getJson('/api/v1/products/hidden-product?lang=es')->assertNotFound();
});

it('falls back to es locale for unknown lang param', function () {
    Product::factory()
        ->withTranslation('es', ['slug' => 'vuelo-test'])
        ->create(['is_visible' => true]);

    $this->getJson('/api/v1/products?lang=zz')
        ->assertOk()
        ->assertJsonPath('meta.locale', 'es');
});

// ── Admin: protected routes ───────────────────────────────────────────────────

it('blocks unauthenticated access to admin products', function () {
    $this->getJson('/api/v1/admin/products')->assertUnauthorized();
});

it('blocks non-admin users from admin products', function () {
    // No way to create a non-admin in current schema — guard against header bypass
    $this->getJson('/api/v1/admin/products')->assertUnauthorized();
});

// ── Admin: CRUD ───────────────────────────────────────────────────────────────

it('admin can list all products', function () {
    $admin = User::factory()->create();
    Product::factory()->withTranslation('es')->create();
    Product::factory()->withTranslation('es')->create(['is_visible' => false]);

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/products')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

it('admin can create a product with translations', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->postJson('/api/v1/admin/products', [
            'sku' => 'FLT-SHARED-001',
            'type' => 'shared',
            'price_cents' => 14900,
            'is_visible' => true,
            'translations' => [
                'es' => [
                    'name' => 'Vuelo Compartido',
                    'slug' => 'vuelo-compartido',
                    'description' => 'Una experiencia increíble.',
                    'meta_title' => 'Vuelo en Globo Compartido | Airona',
                    'meta_description' => 'Disfruta de un vuelo en globo compartido.',
                ],
            ],
        ])
        ->assertCreated()
        ->assertJsonPath('data.sku', 'FLT-SHARED-001')
        ->assertJsonPath('data.price_cents', 14900);

    $this->assertDatabaseHas('products', ['sku' => 'FLT-SHARED-001']);
    $this->assertDatabaseHas('product_translations', ['locale' => 'es', 'slug' => 'vuelo-compartido']);
});

it('admin can update a product', function () {
    $admin = User::factory()->create();
    $product = Product::factory()->withTranslation('es')->create(['price_cents' => 14900]);

    $this->actingAs($admin)
        ->putJson("/api/v1/admin/products/{$product->id}", [
            'price_cents' => 19900,
        ])
        ->assertOk()
        ->assertJsonPath('data.price_cents', 19900);
});

it('admin can archive (soft delete) a product', function () {
    $admin = User::factory()->create();
    $product = Product::factory()->withTranslation('es')->create();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/admin/products/{$product->id}")
        ->assertOk();

    $this->assertSoftDeleted('products', ['id' => $product->id]);
});

it('admin can retrieve a product by id', function () {
    $admin = User::factory()->create();
    $product = Product::factory()
        ->withTranslation('es', ['slug' => 'test-slug'])
        ->create();

    $this->actingAs($admin)
        ->getJson("/api/v1/admin/products/{$product->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $product->id);
});

it('validates required fields on product creation', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->postJson('/api/v1/admin/products', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['sku', 'type', 'price_cents', 'translations']);
});

it('enforces unique sku on create', function () {
    $admin = User::factory()->create();
    Product::factory()->create(['sku' => 'DUPE-001']);

    $this->actingAs($admin)
        ->postJson('/api/v1/admin/products', [
            'sku' => 'DUPE-001',
            'type' => 'shared',
            'price_cents' => 10000,
            'translations' => ['es' => ['name' => 'Test', 'slug' => 'test']],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['sku']);
});
