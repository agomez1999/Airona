<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Production admin seeder — run once during initial server setup.
 * After first run, create additional admins via the admin panel (superadmin only).
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_SEED_EMAIL', 'admin@airona.com');
        $password = env('ADMIN_SEED_PASSWORD');

        if (! $password) {
            $this->command->error('ADMIN_SEED_PASSWORD env variable is required.');
            $this->command->error('Example: php artisan db:seed --class=AdminSeeder with ADMIN_SEED_PASSWORD=... in .env');

            return;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Airona Admin',
                'password' => Hash::make($password),
                'role' => 'superadmin',
                'email_verified_at' => now(),
            ]
        );

        $action = $user->wasRecentlyCreated ? 'Created' : 'Updated';
        $this->command->info("{$action} superadmin: {$email}");
        $this->command->warn('Remove ADMIN_SEED_PASSWORD from .env after first run.');
    }
}
