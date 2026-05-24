<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * CI / E2E test data seeder.
 * Referenced in ci.yml: php artisan db:seed --class=TestAdminSeeder
 * Creates predictable test credentials used by Playwright E2E tests.
 * NEVER run against production.
 */
class TestAdminSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('TestAdminSeeder must not run in production.');

            return;
        }

        User::updateOrCreate(
            ['email' => env('E2E_ADMIN_EMAIL', 'admin@airona.com')],
            [
                'name' => 'E2E Test Admin',
                'password' => Hash::make(env('E2E_ADMIN_PASSWORD', 'secret123')),
                'role' => 'superadmin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('E2E test admin created: ' . env('E2E_ADMIN_EMAIL', 'admin@airona.com'));
    }
}
