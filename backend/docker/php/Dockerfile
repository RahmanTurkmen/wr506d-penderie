FROM composer:latest AS composer

FROM php:8.4-fpm-alpine AS base

# Image Alpine (musl, apk) au lieu de la Debian par défaut : beaucoup moins
# de paquets système embarqués -> beaucoup moins de CVE remontées par un
# scan d'image (ex. Snyk container test). Les paquets de compilation
# (icu-dev, libzip-dev, autoconf/gcc/make pour pecl) sont installés dans un
# groupe "virtuel" .build-deps et désinstallés juste après la compilation
# des extensions, pour qu'ils ne restent pas dans l'image finale.
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache --virtual .build-deps \
        git \
        unzip \
        icu-dev \
        libzip-dev \
        autoconf \
        g++ \
        make \
    && docker-php-ext-install pdo_mysql intl zip opcache \
    && pecl install pcov && docker-php-ext-enable pcov \
    && apk del .build-deps \
    && apk add --no-cache icu-libs libzip git unzip

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

# vendor/ est baké dans l'image (volume anonyme en docker-compose.yml) :
# un bind mount Windows pour des milliers de petits fichiers est très lent.
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --optimize-autoloader

COPY . .
