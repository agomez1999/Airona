##############################################
# Stage: base — PHP 8.3 FPM + extensions
##############################################
FROM php:8.4-fpm-alpine AS base

# Install system dependencies (autoconf + make needed for PECL builds)
RUN apk add --no-cache \
    git \
    curl \
    unzip \
    autoconf \
    make \
    g++ \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    postgresql-dev \
    linux-headers

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        xml \
        zip \
        bcmath \
        intl \
        gd \
        opcache \
        pcntl

# Install Redis extension via PECL
RUN pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear \
    && apk del autoconf make g++

# Install Composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

##############################################
# Stage: dev — development environment
##############################################
FROM base AS dev

# Re-install build tools for Xdebug PECL (removed from base to keep image lean)
RUN apk add --no-cache autoconf make g++ \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && rm -rf /tmp/pear \
    && apk del autoconf make g++

# Keep PHP-FPM running as www-data
USER www-data

EXPOSE 9000
CMD ["php-fpm"]

##############################################
# Stage: deps — install Composer dependencies
##############################################
FROM base AS deps

COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader

COPY backend/ .
RUN composer dump-autoload --optimize

##############################################
# Stage: prod — production image
##############################################
FROM base AS prod

WORKDIR /var/www/html

COPY --from=deps /var/www/html .

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copy entrypoint (config:cache runs after .env is mounted at container start)
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
