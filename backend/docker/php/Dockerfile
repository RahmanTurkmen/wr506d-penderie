FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql intl zip opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# vendor/ est baké dans l'image (volume anonyme en docker-compose.yml) :
# un bind mount Windows pour des milliers de petits fichiers est très lent.
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --optimize-autoloader

COPY . .
