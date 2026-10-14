# Synthèse CI — Lumen

> Attestation du fonctionnement de la campagne de tests (séance 16-21) et de l'analyse statique (séance 15), avec sorties réelles et captures d'écran. Généré le 14/10/2026, branche `feature/test`. Choix et justifications détaillés : [`coverage.md`](coverage.md) pour les tests, [`audit.md`](audit.md) pour la qualité de code.
>
> Note sur les "captures d'écran" : cette session tourne en ligne de commande (pas d'environnement graphique pour PHPStan/PHPUnit/les linters) — les preuves pour ces outils sont donc des transcriptions fidèles de la sortie terminal, copiées-collées sans modification. Les captures Cypress, elles, sont de vraies images PNG générées par le navigateur piloté (`cypress/screenshots`, copiées dans `docs/ci-screenshots/`).

---

## 1. Analyse statique (séance 15 — rappel, détails dans `audit.md`)

### PHPStan niveau 6

```
docker compose exec php vendor/bin/phpstan analyse src --level 6 --no-progress

 [OK] No errors
```

### Linter Symfony

```
$ docker compose exec php php bin/console lint:yaml config
 [OK] All 17 YAML files contain valid syntax.

$ docker compose exec php php bin/console lint:twig templates
 [OK] All 1 Twig files contain valid syntax.

$ docker compose exec php php bin/console lint:container
 [OK] The container was linted successfully: all services are injected with
      values that are compatible with their type declarations.
```

### Composer audit

```
$ docker compose exec php composer audit
No security vulnerability advisories found.
```

### oxlint (frontend)

```
$ docker compose exec frontend npx oxlint src
Found 5 warnings and 0 errors.
Finished in 169ms on 45 files with 104 rules using 16 threads.
```

(5 avertissements connus et acceptés, détaillés dans `audit.md` — fichiers générés par shadcn et un pattern `setState` volontaire.)

---

## 2. Campagne PHPUnit (unitaire + intégration + fonctionnel)

Base de test dédiée préparée au préalable :

```
$ make test-db-fixtures
[notice] Migrating up to DoctrineMigrations\Version20261013122545
 [OK] Successfully migrated to version: DoctrineMigrations\Version20261013122545
   > purging database
   > loading App\DataFixtures\AppFixtures
```

Campagne complète :

```
$ docker compose exec -e APP_ENV=test php vendor/bin/phpunit --testdox

Objet (App\Tests\Unit\Entity\Objet)
 ✔ Objet rattache a une piece est valide
 ✔ Objet rattache a un conteneur est valide
 ✔ Deplacer vers piece libere le conteneur
 ✔ Deplacer vers conteneur libere la piece
 ✔ Statut par defaut est disponible
 ✔ Emplacement avec les deux est invalide
 ✔ Emplacement sans aucun est invalide

Pret (App\Tests\Unit\Entity\Pret)
 ✔ Pret est actif a la creation
 ✔ Cloturer rend le pret inactif
 ✔ Cloturer est idempotent sur la date

Validation (App\Tests\Unit\Entity\Validation)
 ✔ Payload null par defaut
 ✔ Payload fait un aller retour fidele
 ✔ Payload vide est traite comme absent
 ✔ Statut et decision par defaut
 ✔ Decider met a jour statut et date

Objet Repository (App\Tests\Integration\ObjetRepository)
 ✔ Objets de camille sont tous rattaches au bon profil
 ✔ Perceuse makita existe et est rangee dans l etabli
 ✔ Velo enfant a une validation en attente liee

Pret Repository (App\Tests\Integration\PretRepository)
 ✔ Pret de la perceuse est actif et en retard

User Repository (App\Tests\Integration\UserRepository)
 ✔ Find user by email
 ✔ User inconnu renvoie null

Authentification Controller (App\Tests\Functional\AuthentificationController)
 ✔ Connexion reussie renvoie un token
 ✔ Mot de passe incorrect est refuse
 ✔ Route protegee sans token renvoie 401
 ✔ Route protegee avec token valide fonctionne

Objet Controller (App\Tests\Functional\ObjetController)
 ✔ Creation avec piece et conteneur est refusee
 ✔ Creation sans emplacement est refusee
 ✔ Creation valide renvoie 201
 ✔ Type invalide est refuse

Registration Controller (App\Tests\Functional\RegistrationController)
 ✔ Inscription reussie
 ✔ Champs manquants renvoie 400
 ✔ Mot de passe trop court renvoie 400
 ✔ Email deja utilise renvoie 409

OK (33 tests, 107 assertions)
```

**33/33 tests, 0 échec.** Justification du choix de chaque test et de la couverture obtenue : `coverage.md`.

---

## 3. Campagne e2e Cypress (locale)

Pile applicative démarrée (`make up`), exécution headless contre le vrai front (Vite, port 5173) et le vrai backend (nginx, port 8080) :

```
$ cd frontend && npx cypress run

Running:  login.cy.js
  Connexion
    ✔ refuse un mauvais mot de passe avec un message explicite (4812ms)
    ✔ connecte avec les identifiants de démo et affiche l'accueil (3771ms)
  2 passing

Running:  navigation.cy.js
  Navigation principale
    ✔ mène à l'inventaire et affiche la liste d'objets (7653ms)
    ✔ mène aux logements (5361ms)
    ✔ revient à l'accueil (3411ms)
  3 passing

✔ All specs passed!                        00:25        5        5        -        -        -
```

**5/5 tests e2e, 0 échec.**

### Captures

**Connexion refusée (mauvais mot de passe)** — le formulaire reste affiché avec un message d'erreur explicite, pas de redirection silencieuse :

![Erreur de connexion](docs/ci-screenshots/02-login-erreur.png)

**Connexion réussie → accueil** (gabarit mobile, barre de navigation basse visible) :

![Accueil après connexion](docs/ci-screenshots/01-accueil.png)

**Navigation vers l'inventaire** (objets des fixtures affichés, filtres par catégorie) :

![Écran Inventaire](docs/ci-screenshots/03-inventaire.png)

---

## Résumé

| Campagne | Résultat |
|---|---|
| PHPStan niveau 6 | 0 erreur |
| Linter Symfony (yaml/twig/container) | OK |
| Composer audit | 0 vulnérabilité |
| oxlint (frontend) | 0 erreur, 5 avertissements connus |
| PHPUnit (unitaire + intégration + fonctionnel) | 33/33 |
| Cypress (e2e, local) | 5/5 |

Tout est vert. Intégration de la campagne Cypress en CI/CD : prévue pour une prochaine séance (avec Thomas), cf. `coverage.md`.
