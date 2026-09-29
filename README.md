# Lumen

App d'inventaire personnel (dressing, prêts, ventes entre proches). Détails produit/architecture : `Setup.md`.

## Installation — Backend

```bash
docker compose up -d --build
```

L'API est disponible sur http://localhost:8080/api.

### Commandes utiles

```bash
# Charger le schéma / migrations
docker compose exec php bin/console doctrine:migrations:migrate

# Charger les fixtures (données de démo, graine fixe)
docker compose exec php bin/console doctrine:fixtures:load

# Qualité
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit
docker compose exec php composer audit
```

## Installation — Frontend

Le service `frontend` démarre automatiquement avec `docker compose up -d --build` (voir plus haut).

L'appli est disponible sur http://localhost:5173.

Pour lancer le frontend en local sans Docker (optionnel) :

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Stack

PHP 8.4 · Symfony 7.4 · MariaDB 11.4 · Doctrine · API Platform. Front : React + Vite (découplé, dans `frontend/`). Voir `Setup.md` pour le détail complet (modèle de données, autorisations, conventions Git).
