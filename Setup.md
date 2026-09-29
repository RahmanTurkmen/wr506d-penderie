# LUMEN (Penderie) — Contexte projet (WR506D)

## 1. Produit en 5 lignes
App d'inventaire personnel : ranger tout ce qu'on possède (dressing d'abord), retrouver, partager en privé avec des proches, prêter/emprunter, outfit builder, vente entre proches de confiance. Client : homme 34 ans, non technophile. Cible : femmes 25-40. Contraintes : ultra simple, zéro pub, mobile d'abord, dressing privé par défaut, **consultation d'un dressing partagé par lien sans compte** (mais compte obligatoire pour voir/acheter les ventes).

## 2. Stack
| Élément | Choix |
|---|---|
| PHP | 8.4 (php-fpm) |
| Framework | Symfony 7.4 LTS (API) |
| BDD | MariaDB 11.4 (Docker) |
| ORM | Doctrine (migrations + fixtures Faker, graine fixe) |
| API | API Platform ou contrôleurs JSON — contrat OpenAPI **avant** implémentation |
| Auth | à trancher (JWT `lexik/jwt-authentication-bundle` conseillé pour API) |
| Front | React + Vite (découplé, consomme l'API) — vit dans `frontend/`, séparé du backend Symfony |
| Outils | Docker, Postman, Git + Gitflow, PHPStan, PHP-CS-Fixer, PHPUnit, GitHub Actions, Snyk + `composer audit` |

## 3. Structure du repo (monorepo, backend/frontend séparés)
Choix tranché : **front découplé** (option 2 du sujet) — le frontend consomme l'API Symfony, il ne vit pas dans le projet Symfony (donc pas de Twig/Stimulus/Turbo).
```
/backend/                    # Symfony 7.4 (API pure) — racine du skeleton Symfony ici, pas à la racine du repo
  docker/php/Dockerfile
  docker/nginx/default.conf
  src/ config/ public/ bin/ ...
  composer.json composer.lock
/frontend/                   # appli front (framework au choix), consomme l'API du backend
  package.json ...
docker-compose.yml           # à la racine du repo, orchestre backend + frontend + db
docs/                        # journal de décisions, comptes rendus client
```
`docker-compose.yml` (racine du repo, essentiel) :
```yaml
services:
  php:
    build: ./backend/docker/php
    volumes: ["./backend:/var/www/html"]
    depends_on: [database]
  nginx:
    image: nginx:1.27-alpine
    ports: ["8080:80"]
    volumes: ["./backend:/var/www/html", "./backend/docker/nginx/default.conf:/etc/nginx/conf.d/default.conf"]
    depends_on: [php]
  database:
    image: mariadb:11.4
    environment:
      MARIADB_DATABASE: lumen
      MARIADB_USER: app
      MARIADB_PASSWORD: ${DB_PASSWORD:-app_dev}
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root_dev}
    volumes: ["db_data:/var/lib/mysql"]
    ports: ["3306:3306"]
  frontend:
    build: ./frontend
    command: npm run dev -- --host 0.0.0.0
    volumes: ["./frontend:/app", "/app/node_modules"]
    environment:
      VITE_API_URL: "http://localhost:8080"
    ports: ["5173:5173"]
    depends_on: [nginx]
volumes:
  db_data:
```
`backend/.env` (versionné, **sans secret réel**) :
```
DATABASE_URL="mysql://app:app_dev@database:3306/lumen?serverVersion=mariadb-11.4.0&charset=utf8mb4"
```
Secrets réels uniquement dans `backend/.env.local` (ignoré par Git). Le frontend appelle l'API via une variable d'env type `VITE_API_URL=http://localhost:8080` (ou équivalent selon le framework front choisi).

⚠️ Toutes les commandes `docker compose exec php ...` de la section 4 tournent désormais dans `backend/` — le service `php` a son volume monté sur `./backend`, donc les chemins générés (composer.json, src/, etc.) atterrissent bien dans `backend/`, pas à la racine.

## 4. Commandes utiles
```bash
docker compose up -d --build
docker compose exec php composer create-project symfony/skeleton:"7.4.*" tmp && mv tmp/* tmp/.[!.]* . ; rmdir tmp   # init
docker compose exec php composer require symfony/orm-pack api symfony/security-bundle
docker compose exec php composer require --dev symfony/maker-bundle orm-fixtures fakerphp/faker phpstan/phpstan phpunit/phpunit
docker compose exec php bin/console doctrine:migrations:migrate
docker compose exec php bin/console doctrine:fixtures:load
docker compose exec php composer audit
```
Init frontend (une fois, en local, avant `docker compose up`) :
```bash
npm create vite@latest frontend -- --template react
cd frontend && npm install
```

## 4bis. Setup initial — DEUX features séparées, pas une seule

Toujours partir de `develop` à jour (`git checkout develop && git pull`) avant de créer une branche.

**Feature 1 — `feature/backend-setup`** (depuis `develop`)
Contenu attendu :
- `docker-compose.yml` (racine) + `backend/docker/php/Dockerfile` + `backend/docker/nginx/default.conf`
- squelette Symfony 7.4 dans `backend/` (`bin/`, `config/`, `public/`, `src/`), `backend/composer.json` + **`backend/composer.lock`** — pas de `vendor/`
- `backend/.env` sans secret réel
- `.gitignore` racine (backend/vendor/, backend/var/, backend/.env.local, frontend/node_modules/, .idea/)
- `README.md` racine (section installation backend)
Commits conventionnels séparés, ex. `chore: add docker environment (php 8.4, nginx, mariadb 11.4)` · `chore: init symfony 7.4 skeleton in backend/`.
→ MR `feature/backend-setup` → `develop`, description rédigée, **j'attends ta validation avant de merger — ne merge jamais toi-même.**

**Feature 2 — `feature/frontend-setup`** (depuis `develop`, **une fois la Feature 1 mergée et `develop` mis à jour**)
Contenu attendu :
- squelette `frontend/` (`npm create vite@latest frontend -- --template react`), `frontend/package.json` + lock — pas de `node_modules/`
- `frontend/.env.example` (`VITE_API_URL=...`)
- ajout du service `frontend` dans `docker-compose.yml`
- complément du `README.md` (section installation frontend)
Commits conventionnels séparés, ex. `chore: init frontend app (react + vite)` · `chore: wire frontend service in docker-compose`.
→ MR `feature/frontend-setup` → `develop`, même règle : **j'attends ta validation avant de merger.**

⚠️ Étape par étape : ne pas enchaîner Feature 1 puis Feature 2 sans pause — s'arrêter après chaque commit/étape significative pour que je valide avant de continuer. Ne jamais committer directement sur `main` ou `develop`, et ne jamais merger une MR sans mon accord explicite.

## 5. Gitflow & conventions (obligatoire, noté)
- `main` déployable, `develop` intègre, `feature/…`, `hotfix/…`. **Aucun commit direct sur main/develop.**
- Merge Request obligatoire, petite, description rédigée, CI verte avant merge.
- Commits conventionnels (`feat: fix: docs: refactor: test: chore:`), présent de l'impératif, 1 commit = 1 intention. Pas de "wip".
- Rien de superflu dans le dépôt : pas de vendor/, node_modules/, .env.local, secrets.
- Journal de décisions versionné (`docs/decisions.md`) : chaque choix + justification + refus argumentés.
- Comptes rendus client à jour dans `docs/`.

## 6. Règles du module (à ne pas violer)
- ⚠️ **Aucun code applicatif avant validation du pitch 1** (dépôt = documentation seulement). Le setup Docker/Symfony est à faire seulement si validé avec l'enseignant ou après le pitch 1.
- Tout ce qui est livré doit pouvoir être défendu ; code généré OK, code non compris interdit.
- À partir séance 17 (bloquant) : CI GitHub Actions, PHPStan (niveau annoncé), tests fonctionnels API (nominal/erreur/autorisation) + unitaires sur invariants, fixtures Faker ~1000 objets rechargeables en 1 commande, Snyk + `composer audit` (0 critique/haute non traitée).
- Sécurité à vérifier : IDOR (changer l'id dans l'URL), champs non modifiables en écriture, champs internes exposés dans les relations, validation serveur.

## 7. Modèle de données (résumé — détail dans Notion "Modèles de données (champs)")
`User 1-N Profil` (principal|gere) · `Profil 1-N Logement 1-N Piece 1-N Conteneur` · `Profil 1-N Objet` (rattaché à Piece OU Conteneur, jamais les deux) · `Categorie 1-N Objet` · `Objet N-N Tag` (ObjetTag) · `Objet 1-N Pret` (1 seul actif) · `Objet 1-N Transaction` (1 active) · `Profil 1-N Partage 1-N Commentaire` (lien token, révocable) · `Profil 1-N Tenue N-N Objet` (TenueObjet) · `RefusTenue` (objet/catégorie) · bonus `Valise N-N Objet`.
Objet : `type` = vetement|livre|vinyle|autre ; `statut` = disponible|prete|en_vente ; `qrCodeInterne` ; UUID partout.
**Invariants** : objet non prêté ET en vente à la fois · 1 seul prêt actif/objet · profil géré n'initie pas partage/vente sans validation du compte principal · transaction = utilisateur authentifié.

## 8. Autorisation (résumé)
| Rôle | Accès |
|---|---|
| Visiteur avec lien de partage (sans compte) | Lecture seule sur la cible partagée |
| Visiteur sans lien | Rien |
| Propriétaire | Total sur ses données |
| Personne autorisée (compte) | Lecture + commentaires sur le partagé |
| Profil géré | Via compte principal (mineurs : ventes soumises à validation) |
| Acheteur | Authentifié ; voit d'abord les ventes de son réseau |
| Personne bloquée | Aucun accès, même avec lien (révocation immédiate) |

## 9. Périmètre V1 (résumé)
Inclus : comptes/profils familiaux, logements→pièces→conteneurs, objets (saisie + scan livres/vinyles + QR interne pour tous), souvenirs, partage lien sans compte + commentaires + blocage, outfit builder (météo/préférences/refus), prêts, vente entre proches (paiement via prestataire tiers type Stripe Connect, remise en main propre).
Exclu (raisons documentées) : scan code-barres textile (pas de base fiable), gestion envois/liquide/litiges, publication auto Instagram (API), bonus hors V1 : valise, studio photo détourage, wear count, badges.
Questions ouvertes : prestataire de paiement, vente par mineur, expiration des liens, quotas stockage, Instagram export image.

## 10. Design (résumé)
Bordeaux `#7D2E46` (accent), clair `#F3E1E7`, médium `#C98BA0`, texte `#5C1F35`/`#2C2C2A`/`#6B6B68`, bordure `#E6CDD6`. Sans-serif (Inter), boutons pilule 24px, cartes rayon 14-18px, pas de rouge/vert saturés, texte ≥ 11px, mobile d'abord. Maquettes Figma : https://www.figma.com/design/0PiCZB2ztDMUOpuvOEMR6k

## 11. Consignes à l'assistant de code
- Réponds court, montre le diff/commande, explique le *pourquoi* en 1-2 lignes (je dois pouvoir défendre).
- Respecte Gitflow + commits conventionnels ; ne committe/merge jamais sur `main` ou `develop`.
- Une branche = une feature du plan ci-dessus (§4bis) ; ne pas enchaîner plusieurs features sans validation.
- Ouvre la MR avec une description rédigée, puis **attends mon accord explicite avant tout merge** — je suis le seul à merger, ou à donner le go pour merger.
- Avance étape par étape : après chaque commit/étape significative, s'arrêter et me laisser valider avant de continuer.
- Ne génère rien hors périmètre V1 sans me le signaler.
- Signale tout choix non trivial pour que je le consigne dans `docs/decisions.md`.