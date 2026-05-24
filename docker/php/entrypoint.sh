#!/bin/sh
set -e

# Cache Laravel configuration/routes/views after .env is mounted.
# This runs at container start so the caches reflect the actual environment.
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
