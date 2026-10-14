########################################
# Lumen — commandes de développement & qualité
# Usage : make <cible>  (ex. make quality)
########################################

.PHONY: help up down restart logs sh-php sh-frontend \
        phpstan phpstan6 phpstan8 lint-yaml lint-twig lint-container composer-audit snyk-backend snyk-frontend \
        oxlint build frontend-quality \
        fixtures quality

help:
	@echo "Lumen — cibles disponibles :"
	@echo "  up / down / restart   Docker Compose"
	@echo "  sh-php / sh-frontend  Shell dans un conteneur"
	@echo "  fixtures              Recharge les fixtures (⚠ vide la base)"
	@echo ""
	@echo "  phpstan / phpstan6 / phpstan8   Analyse statique backend"
	@echo "  lint-yaml / lint-twig / lint-container   Linters Symfony"
	@echo "  composer-audit        Vulnérabilités des dépendances PHP"
	@echo "  snyk-backend / snyk-frontend    Audit de sécurité Snyk"
	@echo "  oxlint / build         Lint + build frontend"
	@echo "  frontend-quality       oxlint + build"
	@echo "  quality                Tout l'audit qualité (ce que fait séance 15)"

########################################
# Docker
########################################

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

sh-php:
	docker compose exec php sh

sh-frontend:
	docker compose exec frontend sh

fixtures:
	docker compose exec php php bin/console doctrine:fixtures:load

########################################
# Qualité backend
########################################

phpstan: phpstan6

phpstan6:
	docker compose exec php vendor/bin/phpstan analyse src --level 6 --no-progress

phpstan8:
	docker compose exec php vendor/bin/phpstan analyse src --level 8 --no-progress

lint-yaml:
	docker compose exec php php bin/console lint:yaml config

lint-twig:
	docker compose exec php php bin/console lint:twig templates

lint-container:
	docker compose exec php php bin/console lint:container

composer-audit:
	docker compose exec php composer audit

snyk-backend:
	cd backend && npx snyk test --file=composer.lock --package-manager=composer

########################################
# Qualité frontend
########################################

oxlint:
	docker compose exec frontend npx oxlint src

build:
	docker compose exec frontend npm run build

frontend-quality: oxlint build

snyk-frontend:
	cd frontend && npx snyk test --file=package.json

########################################
# Tout l'audit qualité (séance 15)
########################################

quality: phpstan6 lint-yaml lint-twig lint-container composer-audit frontend-quality snyk-backend snyk-frontend
	@echo ""
	@echo "✔ Audit qualité terminé — voir audit.md pour le rapport complet."
