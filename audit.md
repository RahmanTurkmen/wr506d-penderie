# Audit qualité — Lumen

> Audit complet du code (séance 15 : linter, PHPStan, qualité de code). Backend (PHPStan, Symfony Linter, Composer Audit), frontend (oxlint), dépendances (Snyk), accessibilité (A11Y), écoconception et UX. Mis à jour le 14/10/2026. Toutes les commandes ci-dessous sont aussi disponibles via le [`Makefile`](Makefile) à la racine (`make help` pour la liste, `make quality` pour tout lancer).

---

## Backend — PHPStan

PHPStan est une dépendance du projet (`phpstan/phpstan` dans `composer.json`), lancée via :

```bash
make phpstan6      # ou: docker compose exec php vendor/bin/phpstan analyse src --level 6 --no-progress
```

### Niveau 6 — 0 erreur (objectif de la séance)

Parti de **31 erreurs** au niveau 6, toutes corrigées :

| Catégorie | Nombre | Correctif |
|---|---|---|
| `missingType.iterableValue` — `serialize()` des contrôleurs sans type de tableau | ~22 | Ajout de `/** @return array<string, mixed> */` sur chaque `serialize()` (14 contrôleurs : Blocage, Categorie, Conteneur, Logement, Objet, Partage ×2, Piece, Pret, Profil, RefusTenue, Tag, Tenue, Transaction, Validation, Valise) |
| `User::$roles` / `getRoles()` / `setRoles()` | 3 | Typage précis `/** @var list<string> */` / `@return list<string>` / `@param list<string> $roles` |
| `ScanController.php` — annotations des méthodes de race de modèles IA | 3 | `@param list<string>` / `@return array{nom: string, marque: string, ...}` sur `race()`, `orderByReliability()`, `loadStats()` |
| `ScanController.php:283` — `?->value` à gauche d'un `??` redondant | 1 | Remplacé par `(TypeObjet::tryFrom(...) ?? TypeObjet::Autre)->value` (le `?->` ne pouvait jamais être `null` à cet endroit — code mort nettoyé) |
| `Entity/Validation.php` — `json_encode()` peut renvoyer `false` | 1 | `$this->payload = null !== $payload ? (json_encode($payload) ?: null) : null;` — gère explicitement l'échec d'encodage au lieu de l'ignorer |
| `Entity/Tenue.php` / `Valise.php` — `$createdAt` jamais lu (`property.onlyWritten`) | 2 | **Vrai bug mineur, pas cosmétique** : le champ existait mais aucun getter ne l'exposait. Ajout de `getCreatedAt()` + exposition dans les `serialize()` des contrôleurs correspondants — vérifié en live que `/api/tenues` et `/api/valises` renvoient bien `createdAt` |

### Suppression justifiée (1 cas)

`Entity/Piece.php:33` — `$objets` (côté inverse de la relation Doctrine `Objet::$piece`) reste signalé `property.onlyWritten` même après correction des autres cas : c'est voulu, Doctrine a besoin de cette collection pour gérer le cascade/`orphanRemoval`, mais l'application ne la lit jamais (le front dérive "objets par pièce" depuis `/api/objets`). Suppression explicite et commentée plutôt que silencieuse :

```php
// Côté inverse de la relation Objet::$piece, nécessaire pour que Doctrine
// gère correctement le cascade/orphanRemoval, mais jamais lu côté appli
// (le front dérive "objets par pièce" depuis la liste plate /api/objets).
/** @var Collection<int, Objet> */
#[ORM\OneToMany(targetEntity: Objet::class, mappedBy: 'piece')]
// @phpstan-ignore-next-line property.onlyWritten
private Collection $objets;
```

### Niveau 8 (non ciblé par la séance, laissé pour référence)

En plus strict, deux trouvailles restent : `ScanController.php` (`file_get_contents()` peut renvoyer `false`, cas limite peu probable ici car le fichier vient d'être validé par Symfony) et `User::getUserIdentifier()` qui pourrait renvoyer `non-empty-string` plutôt que `string`. Non bloquant, laissé pour une montée de niveau future.

---

## Qualité technique Symfony

```bash
make lint-yaml        # php bin/console lint:yaml config
make lint-twig        # php bin/console lint:twig templates
make lint-container   # php bin/console lint:container
make composer-audit   # composer audit
```

| Vérification | Résultat |
|---|---|
| Lint YAML (`config/`, 17 fichiers) | ✔ Tous valides |
| Lint Twig (`templates/`, 1 fichier) | ✔ Valide |
| Lint du conteneur de services (injection de types) | ✔ Tous les services compatibles |
| `composer audit` (vulnérabilités connues des dépendances PHP) | ✔ Aucune advisory trouvée |

Rien à corriger côté configuration/conteneur Symfony.

---

## Frontend — oxlint

```bash
make oxlint   # ou: docker compose exec frontend npx oxlint src
```

**0 erreur, 5 avertissements** — tous déjà identifiés et laissés tels quels en connaissance de cause pendant le développement :

| Fichier | Règle | Détail |
|---|---|---|
| `components/ui/badge.jsx`, `button.jsx`, `tabs.jsx` | `react/only-export-components` | Fichiers générés par shadcn (jamais modifiés à la main) : ils exportent un composant **et** une fonction de variants (`badgeVariants`, `buttonVariants`...), ce qui casse le Fast Refresh de Vite en dev. Sans impact en prod. |
| `App.jsx`, `pages/home/HomePage.jsx` | `react/set-state-in-effect` | Pattern volontaire : `setXxx(null)` / `setError('')` en tout début de `useEffect`, avant un appel API, pour réinitialiser l'état avant de recharger. Le linter préférerait dériver cet état plutôt que le réinitialiser, mais vu la taille du projet ce n'est pas un vrai problème — juste un style que je n'ai pas cherché à satisfaire partout. |

Rien à corriger dans l'immédiat côté frontend.

---

## Dépendances — Snyk

Scan des vulnérabilités connues dans les dépendances, backend (Composer) et frontend (npm). Ajouté le 14/10/2026.

```bash
make snyk-backend    # npx snyk test --file=composer.lock --package-manager=composer (depuis backend/)
make snyk-frontend   # npx snyk test --file=package.json (depuis frontend/)
```

### Backend — 0 vulnérabilité

```
Tested 130 dependencies for known issues, no vulnerable paths found.
```

### Frontend — 3 vulnérabilités trouvées, toutes dans `shadcn` (outil CLI, pas du code applicatif)

| Faille | Sévérité | Paquet | Correctif amont |
|---|---|---|---|
| Uncontrolled Recursion ([SNYK-JS-BRACES-19963945](https://security.snyk.io/vuln/SNYK-JS-BRACES-19963945)) | Haute | `braces@3.0.3` | Aucun disponible |
| Prototype Pollution ([SNYK-JS-DEEPMERGE-19964053](https://security.snyk.io/vuln/SNYK-JS-DEEPMERGE-19964053)) | Moyenne | `deepmerge@4.3.1` | Aucun disponible |
| Allocation de ressources sans limite ([SNYK-JS-ZOD-20510278](https://security.snyk.io/vuln/SNYK-JS-ZOD-20510278)) | Haute | `zod@3.25.76` | Corrigé en `4.6.6`, mais `shadcn` dépend encore de `zod@3.x` en interne |

Les trois viennent de `shadcn` (`shadcn@4.21.0 > fast-glob > micromatch > braces`, `shadcn > deepmerge`, `shadcn > zod`) : c'est l'outil CLI de scaffolding (`npx shadcn add ...`), jamais importé par le code de l'app — seul `shadcn/tailwind.css` est consommé au build via `index.css`. Ces failles ne sont donc jamais atteignables en production.

**Correctif appliqué** : `shadcn` était classé dans `dependencies` (donc compté comme risque de prod par Snyk) alors que c'est un outil de développement — déplacé vers `devDependencies`, qui reflète son usage réel. Vérifié que `npm install` (utilisé tel quel dans `frontend/Dockerfile`, sans `--omit=dev`) l'installe toujours, et que `vite build` fonctionne sans changement.

```
# avant (dependencies) :
✗ 3 issues, 5 vulnerable paths — scannées par défaut

# après (devDependencies), scan par défaut (= prod) :
✔ Tested 37 dependencies for known issues, no vulnerable paths found.

# toujours présentes en forçant --dev (normal, aucun correctif amont) :
✗ 3 issues, 5 vulnerable paths
```

Rien d'autre à corriger : `braces` et `deepmerge` n'ont aucun correctif publié par leurs mainteneurs pour l'instant, et le correctif de `zod` dépend d'une mise à jour majeure de `shadcn` lui-même (pas encore sortie). À surveiller (`snyk monitor` enverrait une alerte si un correctif sort), mais rien à faire de plus côté Lumen aujourd'hui.

### Images Docker — correctif appliqué le 15/10/2026

Snyk scanne aussi les `Dockerfile` du dépôt (vulnérabilités du système d'exploitation de l'image de base). Avant correctif : `backend/docker/php/Dockerfile` (base `php:8.4-fpm`, Debian) remontait **3 Critiques / 23 Hautes / 8 Moyennes / 254 Basses** ; `frontend/Dockerfile` (déjà en Alpine) **0 / 1 / 0 / 10**.

**Correctifs** :

- **Backend** : passage de `php:8.4-fpm` (Debian) à `php:8.4-fpm-alpine` — beaucoup moins de paquets système embarqués (musl/apk plutôt que glibc/apt, image Debian "complète"). Les paquets de compilation (`icu-dev`, `libzip-dev`, `autoconf`, `g++`, `make`, nécessaires pour compiler `pcov` et les extensions PHP) sont installés dans un groupe `apk` virtuel et **désinstallés juste après la compilation**, pour ne pas rester dans l'image finale — seules les bibliothèques runtime (`icu-libs`, `libzip`) sont réinstallées ensuite. Revérifié après coup : extensions PHP chargées (`pdo_mysql`, `intl`, `zip`, `opcache`, `pcov`), `composer` fonctionnel, PHPStan niveau 6 et les 33 tests PHPUnit toujours au vert.
- **Frontend** : ajout de `apk update && apk upgrade --no-cache` (rattrape les correctifs de sécurité Alpine publiés depuis l'image de base figée) ; mise à jour du `npm` global (`npm install -g npm@latest`, lui-même embarque ses propres dépendances, parfois en retard) ; et `CYPRESS_INSTALL_BINARY=0` pour que le script d'installation de Cypress ne télécharge pas son binaire navigateur dans l'image — il ne tourne jamais dans ce conteneur (toujours lancé depuis l'hôte via `make cypress-run`), donc ce téléchargement n'était qu'une source de poids et de vulnérabilités inutile.

**Résultat** (`snyk container test`, image reconstruite) :

```
# backend (lumen-php:latest)
Tested 5 projects, no vulnerable paths were found.

# frontend (lumen-frontend:latest)
Tested 3 projects, 1 contained vulnerable paths.
```

Backend : 0 vulnérabilité. Frontend : les vulnérabilités restantes sont toutes **à l'intérieur de `npm` lui-même** (`/usr/local/lib/node_modules`, le CLI npm embarqué par l'image Node officielle — `brace-expansion`, `http-cache-semantics`, `ip-address`, `postcss-selector-parser`, `undici`), pas dans le code de l'app ni ses dépendances de prod. Même catégorie que `shadcn` plus haut : un outil de tooling, jamais exécuté contre une entrée utilisateur, dont certains correctifs n'existent simplement pas encore en amont (`http-cache-semantics` : "No upgrade or patch available"). Passer à `npm@latest` a déjà changé le jeu de CVE une fois (confirmé en re-scannant) ; ça continuera de bouger au gré des publications npm, sans action supplémentaire possible côté Lumen.

---

## Accessibilité numérique (A11Y)

Inspection manuelle du code frontend (pas d'outil automatisé Lighthouse/W3C lancé dans ce contexte Docker — inspection visuelle et revue de code à la place).

### Navigation clavier

Tous les éléments interactifs utilisent de vrais `<button>` (pas de `<div onClick>` piégeant la navigation clavier) — vérifié par recherche exhaustive sur `frontend/src` : aucune occurrence de `<div onClick` trouvée. Chaque bouton déclaratif a un `type="button"` ou `type="submit"` explicite (évite le piège du type par défaut dans un `<form>`).

### Focus visible

Les champs texte utilisent `outline-none` combiné à `focus:border-primary` (ex. `InlineCreate.jsx`, formulaires d'auth) : le focus reste visible (changement de couleur de bordure), ce n'est pas un `outline-none` sec qui supprimerait l'indicateur sans remplacement.

### Alternatives textuelles

Les 5 `<img>` du projet (photos d'objets, avatars de profils) ont toutes un `alt` renseigné (nom de l'objet ou du profil) — aucune image décorative sans alternative.

### Labels des formulaires — 1 trouvaille corrigée

`components/lumen/InlineCreate.jsx` (champ de création rapide d'un logement/pièce/rangement) n'avait qu'un `placeholder`, pas de label réel — un lecteur d'écran n'annonce pas le placeholder comme nom accessible une fois le champ en cours de saisie. **Corrigé** : ajout de `aria-label={label}` sur le `<input>` et `aria-label="Confirmer"` sur le bouton de validation (icône seule, sans texte).

### Structure des titres — 1 trouvaille corrigée

`components/auth/AuthHeader.jsx` utilisait un `<h2>` comme titre des écrans de connexion/inscription, sans aucun `<h1>` parent sur ces écrans (le reste de l'app a cette hiérarchie correcte : `ScreenHeader.jsx` pose un `<h1>` par page, les sections internes utilisent `<h2>` via `SectionHeader`). **Corrigé** : `<h2>` → `<h1>`, puisque c'est bien le titre de plus haut niveau sur ces écrans.

### Contrastes (WCAG)

Calcul du ratio de contraste (luminance relative) pour les combinaisons de couleurs de la charte Lumen :

| Paire | Ratio | Seuil AA (texte normal : 4.5, grand texte : 3) |
|---|---|---|
| Bordeaux `#7D2E46` sur blanc | 8.93 | ✔ |
| Texte principal `#2C2C2A` sur fond `#FAF9F9` | 13.31 | ✔ |
| Texte secondaire `#6B6B68` sur fond `#FAF9F9` | 5.09 | ✔ |
| Bordeaux `#7D2E46` sur rose `#F3E1E7` | 7.12 | ✔ |
| Texte secondaire `#6B6B68` sur carte blanche | 5.35 | ✔ |

Toutes les combinaisons dépassent largement le seuil AA — aucun correctif nécessaire sur les couleurs.

### Messages d'erreur

Les erreurs de formulaire (ex. connexion échouée, champ requis) s'affichent en texte visible (pas uniquement par une couleur de bordure), donc perceptibles sans distinction de couleur seule.

---

## Écoconception

```bash
make build   # vite build — rapport de taille des bundles
```

### Poids des pages

```
dist/index.html                   0.47 kB │ gzip:   0.30 kB
dist/assets/index-*.css          60.94 kB │ gzip:  10.80 kB
dist/assets/index-*.js          339.91 kB │ gzip: 103.43 kB
```

Un seul bundle JS (pas de code-splitting par route) — raisonnable pour la taille actuelle de l'app (~103 Ko gzippés de JS), mais si l'app grossit, un découpage par écran (`React.lazy`) limiterait le JS chargé au premier écran (connexion) plutôt que tout l'inventaire/dressing/prêts d'un coup.

### Images non optimisées — trouvaille réelle

`ObjetController::storePhoto()` enregistre la photo uploadée **telle quelle** sur disque (`public/uploads/objets/`), sans redimensionnement ni recompression côté serveur. Taille max acceptée : 8 Mo (`MAX_PHOTO_SIZE`), types acceptés JPEG/PNG/WebP. Une photo prise avec un smartphone moderne (souvent 3-8 Mo, résolution 4000px+) est donc servie telle quelle à un `<img>` affiché en carte de quelques centimètres — gaspillage de bande passante et de stockage. Amélioration possible (hors scope immédiat) : redimensionner côté serveur (ex. Imagick/GD, max 1200px de large) et recompresser en WebP à la réception.

### Requêtes réseau

`PretsSection.jsx` effectue un `listObjets()` puis un `listPrets()` **par objet** en parallèle (pas d'endpoint global `/api/prets`) — acceptable pour le volume de données actuel (fixtures : quelques objets), mais ce pattern en N+1 requêtes grossirait linéairement avec le nombre d'objets d'un profil. À surveiller si l'inventaire grossit significativement.

### Scripts chargés

Pas de dépendance de tracking/analytics tierce chargée. Les seules librairies externes sont React/Vite/Tailwind/lucide-react/Base UI, toutes nécessaires à l'app elle-même — pas de script superflu.

---

## Expérience utilisateur (UX)

### Navigation

Shell mobile-first cohérent : barre de navigation basse sur mobile, sidebar sur desktop (même structure de routes, juste la présentation qui change selon la largeur d'écran) — pas de double logique de navigation à maintenir.

### Cohérence visuelle

Charte unique appliquée partout via les tokens Tailwind (bordeaux `#7D2E46`, boutons pill, cartes à coins arrondis 18-24px) — aucun écran ne déroge au design system Figma.

### Feedback utilisateur

Les actions asynchrones (scan IA, création d'objet, clôture de prêt) affichent un état de chargement (`Loader2` animé) et désactivent le bouton pendant l'opération (`disabled={saving}`), évitant les double-soumissions. Les erreurs réseau (scan, login) affichent un message explicite plutôt qu'un échec silencieux.

### Compréhension des formulaires et prévention des erreurs

Les champs obligatoires (nom d'un objet, email/mot de passe de connexion) bloquent la soumission côté client avant même l'appel réseau (ex. `if (!draft.trim()) return`). Le scan IA pré-remplit les champs détectés (nom, marque, couleur) tout en laissant l'utilisateur corriger avant validation — évite de lui imposer une donnée automatique erronée sans recours.

### Lisibilité

Hiérarchie typographique cohérente (titres en gras, texte secondaire en gris plus clair `#6B6B68`), confirmée conforme AA par les ratios de contraste ci-dessus.

---

## Testabilité et fiabilité

Hors scope de cette séance (explicitement renvoyé aux séances suivantes par le sujet) — aucun test automatisé (unitaire/fonctionnel) n'est encore en place côté backend ou frontend. À couvrir ultérieurement : tests PHPUnit sur les contrôleurs/entités critiques (Objet, Pret, Validation), tests de composants React sur les flux clés (scan photo, création de prêt).

---

## Résumé

| | Backend (PHPStan niv. 6) | Symfony (lint/audit) | Frontend (oxlint) | Dépendances (Snyk) | A11Y | Écoconception |
|---|---|---|---|---|---|---|
| Erreurs/vulnérabilités bloquantes | 0 (corrigé de 31 → 0) | 0 | 0 | 0 (après reclassement `shadcn` en devDependencies) | 0 (2 trouvailles corrigées : label, hiérarchie des titres) | 0 bloquant |
| À corriger si on a le temps | 0 (niveau 8 : 2 cas limites non ciblés) | — | 0 | 0 (aucun correctif amont dispo pour les 3 restantes, non atteignables en prod) | — | Redimensionnement des photos uploadées côté serveur |
| Cosmétique / documentation | — | — | 5 (patterns connus et acceptés) | — | — | Pas de code-splitting par route (non nécessaire à cette taille) |

Le code est propre dans l'ensemble. Le seul vrai chantier technique restant est le redimensionnement/compression des photos d'objets côté serveur (écoconception) ; le reste (A11Y, qualité PHP, dépendances) est désormais à 0 trouvaille bloquante. Testabilité et fiabilité : volontairement hors scope, prochaines séances.
