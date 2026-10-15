# Campagne de tests — Lumen

> Séance 16-21 (Tests PHP). Développé sur la branche `feature/test` (**non mergée dans `develop`**, conformément à la consigne). Couvre : fixtures dédiées à la campagne de test, tests unitaires (100 % des règles métier identifiées), tests d'intégration (100 % des entités métier, via Doctrine), au moins un test fonctionnel pertinent par flux HTTP critique, et une campagne e2e Cypress couvrant les parcours métiers principaux. `coverage.md` (ce fichier) justifie les choix ; [`ci.md`](ci.md) atteste du fonctionnement avec les sorties/captures.

---

## Stratégie : "100 % métier", pas "100 % des lignes"

La consigne demande 100 % de couverture sur "la partie métier du projet", en prévenant dans le même temps qu'"écrire un test ne garantit pas qu'il couvre tous les cas... il convient d'identifier les cas problématiques, pertinents, fonctionnels". Le backend de Lumen compte 18 entités ; beaucoup de leurs méthodes sont de simples getters/setters générés, sans règle à vérifier. **"100 % métier" est donc interprété ici comme : 100 % des méthodes qui portent une vraie règle (invariant, calcul, transition d'état) sont testées — pas 100 % des lignes du projet**, ce qui inclurait des centaines de lignes de mapping JSON et d'accesseurs sans branche logique.

### Inventaire des règles métier (entités) — toutes couvertes en unitaire

| Règle | Entité / méthode | Test | Pourquoi c'est "métier" |
|---|---|---|---|
| Un objet est rattaché à exactement une `Piece` OU un `Conteneur`, jamais les deux, jamais aucun | `Objet::validateEmplacement()`, `deplacerVersPiece()`, `deplacerVersConteneur()` | `ObjetTest` (7 tests) | Invariant central de tout le rangement/inventaire (§3). |
| Un prêt est actif tant qu'il n'a pas de date de retour ; `cloturer()` est irréversible et idempotent | `Pret::isActif()`, `cloturer()` | `PretTest` (3 tests) | §7. Base du badge "en retard" côté front. |
| `Validation::$payload` : encodage/décodage JSON fidèle (y compris `null`, `[]`), transition de statut | `Validation::getPayload()`, `decider()` | `ValidationTest` (5 tests) | Corrigé au passage PHPStan niveau 6 (`json_encode()` peut renvoyer `false`) — un test dessus évite une régression silencieuse. |
| Un partage peut être révoqué, irrévocablement ; token unique à la création | `Partage::isRevoque()`, `revoquer()` | `PartageTest` (3 tests) | §8 : un lien révoqué ne doit plus jamais redonner accès. |
| Un refus (outfit builder) cible exactement une `Categorie` OU un `Objet`, jamais les deux | `RefusTenue::validateCible()` | `RefusTenueTest` (3 tests) | Même famille d'invariant que `Objet`, vérifiée séparément (classe différente, règle dupliquée par construction du modèle). |
| Un profil n'est mineur que si explicitement marqué comme tel (jamais un profil "principal") | `Profil::isEstMineur()` | `ProfilTest` (2 tests) | Conditionne deux règles ailleurs : passage par `Validation` (§7) et prix masqué sur une vente (§8). |

**23/23 tests unitaires**, 0 base de données (`TestCase`, pas de `KernelTestCase`).

### Inventaire des entités métier — toutes couvertes en intégration

| Entité | Ce qui est vérifié avec une vraie base | Test |
|---|---|---|
| `User` | Recherche par email (login), email inconnu → `null` | `UserRepositoryTest` |
| `Objet` | Rattachement au bon profil, emplacement (pièce/conteneur), lien vers une `Validation` en attente | `ObjetRepositoryTest` |
| `Pret` | Prêt actif + en retard, prêt clôturé + inactif | `PretRepositoryTest` |
| `Partage` + `Commentaire` | Token non vide, non révoqué par défaut, commentaire lié et son auteur | `PartageRepositoryTest` |
| `RefusTenue` | Cible bien une `Categorie` (pas un `Objet`) après un aller-retour Doctrine | `RefusTenueRepositoryTest` |
| `Blocage` | Relation profil ↔ utilisateur bloqué, dans les deux sens | `BlocageRepositoryTest` |
| `Transaction` | Montant, acheteur, statut initial "en_cours" | `TransactionRepositoryTest` |
| `Tenue` / `Valise` | Relation many-to-many vers `Objet` bien peuplée après persistance | `TenueValiseRepositoryTest` |

**14/14 tests d'intégration** — chaque entité qui porte une relation ou un état métier (pas seulement `Categorie`/`Tag`, qui sont de purs référentiels sans règle) est couverte.

### Tests fonctionnels — au moins un test pertinent par flux HTTP critique

Pas une couverture à 100 % de chaque contrôleur (il y en a 17, avec ~80 branches d'erreur au total — hors de portée réaliste pour une campagne initiale), mais **un test pertinent et représentatif par flux réellement sensible** :

| Flux | Test | Pourquoi c'est le test "pertinent" à avoir sur ce flux |
|---|---|---|
| Connexion JWT (succès, échec, accès protégé) | `AuthentificationControllerTest` (4 tests) | Porte d'entrée de toute donnée privée de l'app — si ça casse, tout casse. |
| Inscription (validation, doublon, mot de passe faible) | `RegistrationControllerTest` (4 tests) | Seul rempart contre un compte invalide (pas de contrainte unique en base sur `email`). |
| Création d'objet (invariant d'emplacement vérifié côté HTTP) | `ObjetControllerTest` (4 tests) | Le contrôleur revalide la même règle que `Objet::validateEmplacement()` *avant* de construire l'entité (`ObjetController.php:142`) — sans ce test, rien ne garantit que les deux vérifications restent cohérentes entre elles dans le temps. |

**12/12 tests fonctionnels.**

Ce qui n'est **pas** testé, volontairement : les `serialize()` des contrôleurs (mapping entité → tableau, aucune branche logique), les routes CRUD sans règle particulière (renommer un logement, lister des catégories). Les tester n'aurait vérifié que "PHP sait assigner une variable".

## Les trois niveaux, et où ils vivent

| Niveau | Dossier | Classe de base | Besoin d'une base de données |
|---|---|---|---|
| Unitaire | `backend/tests/Unit/Entity/` | `TestCase` | Non |
| Intégration | `backend/tests/Integration/` | `KernelTestCase` | Oui (base dédiée `lumen_test`) |
| Fonctionnel | `backend/tests/Functional/` | `WebTestCase` | Oui (même base) |

### Fixtures dédiées à la campagne de test

`backend/src/DataFixtures/TestFixtures.php` — **distinctes de `AppFixtures`** (données de démo/dev, déjà mergées dans `develop`). La consigne est explicite : la branche `feature/test` doit avoir "ses" fixtures, non mergées dans `develop`. `TestFixtures` est donc une classe séparée, avec son propre groupe Doctrine (`getGroups(): ['test']`), chargée **uniquement** via `--group=test` — elle n'a aucune chance d'être chargée par erreur en dev (`doctrine:fixtures:load` sans `--group` ne charge que `AppFixtures`).

Contenu minimal mais complet : 2 utilisateurs, 2 profils (dont un mineur), 3 catégories, 2 logements/pièces/un conteneur, 4 objets (dont un en vente, un prêté), 2 prêts (actif+en retard, clôturé), 1 validation en attente, 1 partage + commentaire, 1 refus de catégorie, 1 blocage, 1 transaction, 1 tenue, 1 valise, 1 tag — un cas de chaque entité métier, pour que les tests d'intégration aient quelque chose de précis à interroger.

```bash
make test-db-fixtures   # crée/migre lumen_test puis y charge TestFixtures (--group=test)
```

Les tests fonctionnels qui créent des données (ex. `RegistrationControllerTest::testInscriptionReussie`) utilisent des emails uniques (`uniqid()`) pour rester indépendants d'un rechargement précédent — pas de rollback transactionnel automatique entre deux tests (pas de `dama/doctrine-test-bundle`), donc chaque test qui écrit en base doit être responsable de ne pas entrer en collision avec les autres.

## Résultat de la campagne PHPUnit

```
OK (49 tests, 133 assertions)
```

49/49 tests passent : 23 unitaires + 14 d'intégration + 12 fonctionnels. Détail complet et sortie brute : [`ci.md`](ci.md).

### Couverture de code (texte, `--coverage-text`)

Sur les classes directement ciblées par la campagne : `RegistrationController` et toutes les classes entité listées plus haut (`Objet`, `Pret`, `Validation`, `Partage`, `RefusTenue`, `Profil`) ont 100 % de leurs méthodes porteuses de règle couvertes. Les `Repository` utilisés (`ObjetRepository`, `UserRepository`, `PretRepository`, `PartageRepository`, `RefusTenueRepository`, `BlocageRepository`, `TransactionRepository`, `TenueRepository`, `ValiseRepository`) sont à 100 % (classes sans code propre, héritent tout de `ServiceEntityRepository`). Le reste du projet (contrôleurs hors des 3 flux ci-dessus, entités purement référentielles comme `Categorie`/`Tag`) n'est pas mesuré — hors scope assumé, voir "Stratégie".

## Campagne e2e (Cypress, locale)

```bash
make cypress-run   # headless, contre la pile docker-compose déjà démarrée (make up)
# ou : make cypress-open (mode interactif, pour déboguer un scénario)
```

**7 specs, 14 tests**, exécutés en local au gabarit mobile (390×844 — l'app est mobile-first, deux en-têtes distincts existent dans le DOM selon le breakpoint Tailwind `md`, donc les sélecteurs et le viewport visent l'usage principal), contre la base de **dev** réelle (`AppFixtures`, pas `TestFixtures` — Cypress pilote le vrai serveur Vite + la vraie API, qui tournent sur la base de dev) :

| Spec | Parcours métier couvert |
|---|---|
| `login.cy.js` | Connexion : mauvais mot de passe → erreur visible, pas de redirection ; identifiants valides → accueil affiché. |
| `register.cy.js` | Inscription : compte créé → renvoi vers connexion ; email déjà utilisé → erreur visible. |
| `navigation.cy.js` | Accès à l'inventaire, aux logements, retour à l'accueil (barre de navigation principale). |
| `add-objet.cy.js` | Ajout manuel d'un objet (sans photo) : nom, catégorie existante, emplacement (logement + pièce existants) → l'objet créé est bien affiché. |
| `dressing.cy.js` | Vue Dressing (filtrée sur les vêtements) : sans filtre, filtre par catégorie, filtre par tag, retour à "Tout". |
| `pret.cy.js` | Cycle de vie complet d'un prêt : création sur un objet disponible → apparaît "en cours" → clôturé ("Rendu") → apparaît "Terminé". |
| `logout.cy.js` | Déconnexion depuis le menu de profil → retour à l'écran de connexion. |

Ces 7 parcours correspondent aux fonctionnalités "cœur" de l'app telles que décrites dans le cahier des charges (§3 Authentification, §3 Inventaire, §4 Logements, §5 Dressing, §7 Prêts) : c'est la définition retenue de "100 % des parcours métiers" — chaque fonctionnalité listée a au moins un parcours e2e bout-en-bout, pas une interprétation littérale de 100 % des combinaisons d'actions possibles dans l'UI.

### Un vrai bug UX trouvé en écrivant ces tests

En voulant tester la déconnexion, j'ai découvert qu'il n'y avait **aucun moyen de se déconnecter depuis le mobile** : le bouton "Se déconnecter" n'existait que dans la `Sidebar` desktop (`hidden md:flex`), jamais dans le `ProfilMenu` mobile. Sur une app explicitement mobile-first, c'était un vrai trou fonctionnel, pas juste un manque de test. Corrigé (`ProfilMenu.jsx` + câblage `onLogout` depuis `App.jsx` → `HomePage` → les deux instances de `ProfilMenu`), puis couvert par `logout.cy.js`.

### Fiabilité de la campagne combinée

Lancer les 7 specs à la suite (`make cypress-run` sans `--spec`) sature le pool de workers `php-fpm` par défaut (`pm.max_children = 5`, suffisant en usage normal mais pas pour plusieurs scénarios Cypress enchaînés, chacun tirant 5 à 8 requêtes API en parallèle). Corrigé en portant `pm.max_children` à 20 pour l'environnement de dev (`backend/docker/php/www.conf`) — la campagne complète passe alors de façon stable (14/14, vérifié sur plusieurs lancements consécutifs).

Un deuxième défaut trouvé en testant : le premier jet de `pret.cy.js` ciblait un objet par son nom ("Veste en jean"). Si un run précédent échouait en cours de route, l'objet restait "prêté" côté base de dev, et le test suivant ne le trouvait plus dans la liste des objets disponibles. Corrigé en sélectionnant le premier objet disponible, quel qu'il soit, plutôt qu'un nom fixe — le test ne dépend plus d'un état précis de la base partagée.

Résultat et captures : [`ci.md`](ci.md).

## Limites connues / pistes pour la suite

- Pas de rollback transactionnel automatique entre deux tests PHPUnit (pas de `dama/doctrine-test-bundle`) : une base de test qui grossit indéfiniment finira par devoir être rechargée (`make test-db-fixtures`).
- Les tests fonctionnels couvrent 3 flux (auth, inscription, création d'objet) sur 17 contrôleurs : volontairement un échantillon pertinent, pas une couverture exhaustive de chaque route.
- Cypress n'est pas encore branché en CI (explicitement annoncé comme la suite, avec Thomas, cf. consigne).
