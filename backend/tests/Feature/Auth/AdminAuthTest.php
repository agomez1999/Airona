<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows admin to login with valid credentials', function () {
    $admin = User::factory()->create([
        'email' => 'admin@airona.com',
        'password' => bcrypt('secret123'),
        'role' => 'admin',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'admin@airona.com',
        'password' => 'secret123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role']]);
});

it('rejects invalid credentials', function () {
    User::factory()->create(['email' => 'admin@airona.com', 'password' => bcrypt('correct')]);

    $this->postJson('/api/auth/login', [
        'email' => 'admin@airona.com',
        'password' => 'wrong',
    ])->assertUnauthorized();
});

it('allows superadmin to login', function () {
    $superAdmin = User::factory()->superAdmin()->create([
        'email' => 'super@airona.com',
        'password' => bcrypt('secret123'),
    ]);

    $this->postJson('/api/auth/login', [
        'email' => 'super@airona.com',
        'password' => 'secret123',
    ])
        ->assertOk()
        ->assertJsonPath('data.role', 'superadmin');
});

it('returns 401 for missing fields', function () {
    $this->postJson('/api/auth/login', [])->assertUnprocessable();
});

it('returns authenticated user from /me', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $admin->email)
        ->assertJsonPath('data.role', $admin->role);
});

it('returns 401 for unauthenticated /me', function () {
    $this->getJson('/api/auth/me')->assertUnauthorized();
});

it('logs out the authenticated user', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->postJson('/api/auth/logout')
        ->assertOk();
});
