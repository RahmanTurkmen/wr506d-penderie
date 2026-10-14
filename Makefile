########################################
# Lumen — commandes de développement & qualité
# Usage : make <cible>  (ex. make quality)
########################################

.PHONY: help up down restart logs sh-php sh-frontend \
        phpstan phpstan6 phpstan8 lint-yaml lint-twig lint-container composer-audit snyk-backend snyk-frontend \
        oxlint build frontend-quality \
        fixtures quality \
        test-db test-db-fixtures phpunit phpunit-unit phpunit-integration phpunit-functional phpunit-coverage \
        cypress-install cypress-open cypress-run test-e2e \
        test

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
	@echo "  quality                Tout l'audit qualité (séance 15)"
	@echo ""
	@echo "  test-db / test-db-fixtures   Prépare la base de test (migrations + fixtures)"
	@echo "  phpunit                      Toute la campagne PHPUnit (unit + intégration + fonctionnel)"
	@echo "  phpunit-unit / phpunit-integration / phpunit-functional   Un seul niveau de test"
	@echo "  phpunit-coverage              Campagne PHPUnit + rapport de couverture (texte)"
	@echo "  cypress-install / cypress-open / cypress-run   Tests e2e Cypress (frontend, en local)"
	@echo "  test-e2e                      Lance le serveur de dev puis la campagne Cypress headless"
	@echo "  test                          phpunit-coverage + rappel pour lancer Cypress (séance 16-21)"

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

########################################
# Campagne de tests (séance 16-21) — branche feature/test, non mergée dans develop
########################################

# Base dédiée aux tests (lumen_test, cf. backend/.env.test.local) : à lancer
# une première fois, puis après chaque modification du schéma/des fixtures.
test-db:
	docker compose exec -e APP_ENV=test php php bin/console doctrine:database:create --if-not-exists
	docker compose exec -e APP_ENV=test php php bin/console doctrine:migrations:migrate --no-interaction

test-db-fixtures: test-db
	docker compose exec -e APP_ENV=test php php bin/console doctrine:fixtures:load --no-interaction

phpunit:
	docker compose exec -e APP_ENV=test php vendor/bin/phpunit --testdox

phpunit-unit:
	docker compose exec -e APP_ENV=test php vendor/bin/phpunit tests/Unit --testdox

phpunit-integration:
	docker compose exec -e APP_ENV=test php vendor/bin/phpunit tests/Integration --testdox

phpunit-functional:
	docker compose exec -e APP_ENV=test php vendor/bin/phpunit tests/Functional --testdox

phpunit-coverage:
	docker compose exec -e APP_ENV=test php vendor/bin/phpunit --coverage-text

# Cypress tourne sur l'hôte (pas dans Docker) : il a besoin d'un vrai
# navigateur, ce que le conteneur frontend n'a pas.
cypress-install:
	cd frontend && npm install

cypress-open:
	cd frontend && npx cypress open

cypress-run:
	cd frontend && npx cypress run

# Lance le serveur de dev Vite en tâche de fond, attend qu'il réponde, lance
# la campagne Cypress headless, puis coupe le serveur.
test-e2e:
	cd frontend && npx start-server-and-test dev http://localhost:5173 "cypress run"

test: phpunit-coverage
	@echo ""
	@echo "✔ Campagne PHPUnit terminée (unit + intégration + fonctionnel, avec couverture)."
	@echo "  Pour la campagne e2e : make test-e2e (ou cypress-open en mode interactif)."
	@echo "  Détails et justification des choix de test : coverage.md"
