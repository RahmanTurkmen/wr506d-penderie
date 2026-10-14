# Campagne de tests — Lumen

> Séance 16-21 (Tests PHP). Développé sur la branche `feature/test` (**non mergée dans `develop`**, conformément à la consigne). Couvre : fixtures de test dédiées, tests unitaires, tests d'intégration (Doctrine), tests fonctionnels (HTTP), campagne e2e Cypress locale. `coverage.md` (ce fichier) justifie les choix ; [`ci.md`](ci.md) atteste du fonctionnement avec les sorties/captures.

---

## Stratégie : pourquoi ces tests-là, pas "tout"

La consigne demande une "campagne de test efficace et pertinente sur la partie métier du projet (test-coverage 100%)", en prévenant dans le même temps qu'"écrire un test ne garantit pas qu'il couvre tous les cas... il convient d'identifier les cas problématiques, pertinents, fonctionnels". Le backend de Lumen compte 18 entités, la plupart de simples porteurs de données (getters/setters générés, aucune règle à vérifier). Plutôt que viser 100 % des lignes du projet — ce qui reviendrait surtout à tester que Doctrine sait appeler un setter — j'ai visé 100 % des **règles métier identifiables** : chaque invariant explicitement documenté dans le code (`@`-commentaires "§X", `Assert\Callback`, logique de statut) a au moins un test qui le met en défaut ET un qui le satisfait.

Règles métier couvertes, et pourquoi chacune compte :

| Règle | Où | Pourquoi c'est "métier" et pas du boilerplate |
|---|---|---|
| Un objet est rattaché à exactement une `Piece` OU un `Conteneur`, jamais les deux, jamais aucun | `Objet::validateEmplacement()` + vérification dupliquée côté `ObjetController::create()` | C'est l'invariant central de tout le rangement/inventaire (§3). Une violation silencieuse casserait l'affichage "objets par pièce" partout dans l'app. |
| Un prêt est actif tant qu'il n'a pas de date de retour ; `cloturer()` doit être irréversible et idempotent | `Pret::isActif()` / `cloturer()` | §7. Sert de base au badge "en retard" côté front — si cette règle se trompe, un objet prêté reste invisible comme "disponible". |
| Un profil géré (enfant) ne met jamais un objet en vente directement : ça crée une `Validation` en attente | `ObjetRepositoryTest::testVeloEnfantAUneValidationEnAttenteLiee` (intégration, via les fixtures) | §7, invariant de sécurité/parentalité — le plus sensible de l'app si on le casse (un enfant pourrait vendre un objet sans accord). |
| `Validation::$payload` : encodage/décodage JSON fidèle, y compris les cas limites (`null`, `[]`) | `ValidationTest` | Corrigé lors du passage PHPStan niveau 6 (`json_encode()` peut renvoyer `false`) — avoir un test dessus évite une régression silencieuse si quelqu'un retouche ce code plus tard. |
| Connexion (JWT) : succès, mot de passe faux, route protégée sans/avec token | `AuthentificationControllerTest` | C'est littéralement la porte d'entrée de toute donnée privée de l'app. |
| Inscription : validation des champs, email déjà utilisé, mot de passe trop court | `RegistrationControllerTest` | Seul rempart contre un compte invalide ou en double (pas de contrainte unique en base sur `email`, la règle est 100 % applicative). |
| Création d'objet via l'API : mêmes règles qu'`Objet::validateEmplacement()`, vérifiées côté HTTP | `ObjetControllerTest` | Le contrôleur fait sa propre vérification AVANT de construire l'entité (`ObjetController.php:142`) — sans ce test, rien ne garantit que les deux vérifications (contrôleur + entité) restent cohérentes entre elles. |

Ce qui n'est **pas** testé, volontairement : les `serialize()` des contrôleurs (mapping entité → tableau, aucune branche logique), les simples CRUD sans règle (ex. renommer un logement), les getters/setters sans effet de bord. Les tester n'aurait vérifié que "PHP sait assigner une variable".

## Les trois niveaux, et où ils vivent

| Niveau | Dossier | Classe de base | Ce qu'il vérifie | Besoin d'une base de données |
|---|---|---|---|---|
| Unitaire | `backend/tests/Unit/Entity/` | `TestCase` | Une règle métier isolée, sans Symfony ni Doctrine | Non |
| Intégration | `backend/tests/Integration/` | `KernelTestCase` | Qu'une règle métier survit à un vrai aller-retour Doctrine, avec les fixtures réelles de l'app | Oui (base dédiée `lumen_test`) |
| Fonctionnel | `backend/tests/Functional/` | `WebTestCase` | Le comportement HTTP (codes de statut, JSON renvoyé), y compris l'authentification JWT | Oui (même base) |

### Fixtures de test

Les tests d'intégration et fonctionnels réutilisent `App\DataFixtures\AppFixtures` (celles de l'app, déjà alignées sur le Figma) plutôt que d'en écrire des séparées : elles couvrent déjà tous les cas intéressants (profil enfant avec validation en attente, prêt en retard, objet rangé dans un conteneur vs une pièce...), et dupliquer un jeu de fixtures "juste pour les tests" aurait été une source de divergence silencieuse avec les vraies données de l'app. Elles sont chargées dans une base **séparée** (`lumen_test`, suffixe automatique Symfony — voir `config/packages/doctrine.yaml`), jamais dans `lumen` (la base de dev) :

```bash
make test-db-fixtures   # crée/migre lumen_test puis y charge AppFixtures
```

À relancer si le schéma ou les fixtures changent. Les tests fonctionnels qui créent des données (ex. `RegistrationControllerTest::testInscriptionReussie`) utilisent des emails `uniqid()` pour rester indépendants d'un rechargement précédent.

## Résultat de la campagne

```
OK (33 tests, 107 assertions)
```

33/33 tests passent (7 unitaires sur `Pret`/`Validation`, 7 unitaires sur `Objet`, 6 d'intégration, 9 fonctionnels). Détail complet et sortie brute : [`ci.md`](ci.md).

### Couverture de code (texte, `--coverage-text`)

| Classe | Couverture | Commentaire |
|---|---|---|
| `RegistrationController` | 100 % méthodes/lignes | Entièrement testé (4 scénarios) |
| `ObjetController` | 37,5 % méthodes / 50 % lignes | Seule la création (`create()`) est couverte ; `list()`/`update()`/changement de statut ne le sont pas encore |
| `Objet` | 58,6 % méthodes / 61,7 % lignes | Toute la logique de rattachement + déplacement couverte ; les getters/setters simples (marque, taille, couleur...) ne le sont pas |
| `Pret` | 66,7 % méthodes / 71,4 % lignes | `isActif()`/`cloturer()` couverts, `getDateDebut()` etc. non (triviaux) |
| `Validation` | 62,5 % méthodes / 80 % lignes | Payload + cycle de décision couverts |
| Repositories (`ObjetRepository`, `UserRepository`, etc.) | 100 % | Classes vides (héritent tout de `ServiceEntityRepository`), 100 % atteint "gratuitement" en les utilisant dans les tests d'intégration |
| Reste du projet (autres entités/contrôleurs) | Non mesuré | Hors scope de cette campagne — voir "Stratégie" ci-dessus |

Pas de couverture globale à 100 % des lignes du projet, par choix assumé (voir la section Stratégie) : la couverture est concentrée sur les règles métier identifiées, pas diluée sur du code sans branche logique.

## Campagne e2e (Cypress, locale)

```bash
make cypress-run   # headless, contre la pile docker-compose déjà démarrée (make up)
# ou : make cypress-open (mode interactif, pour déboguer un scénario)
```

2 specs, 5 tests, exécutés en local au gabarit mobile (390×844 — l'app est mobile-first, deux en-têtes distincts existent dans le DOM selon le breakpoint Tailwind `md`, donc les sélecteurs et le viewport visent l'usage principal) :

- `login.cy.js` : mauvais mot de passe → message d'erreur visible, pas de redirection ; identifiants de démo (`test@lumen.local` / `password123`) → accueil affiché.
- `navigation.cy.js` : accès à l'inventaire (objet des fixtures visible), accès aux logements, retour à l'accueil.

Résultat et captures : [`ci.md`](ci.md). Cette campagne est prévue pour être intégrée en CI/CD (avec Thomas, cf. consigne) — elle tourne pour l'instant uniquement en local, contre la base de dev réelle (pas de reset automatique entre deux lancements, contrairement à PHPUnit qui a sa propre base).

## Limites connues / pistes pour la suite

- Pas de rollback transactionnel automatique entre deux tests PHPUnit (pas de `dama/doctrine-test-bundle`) : chaque test d'intégration/fonctionnel qui écrit en base (ex. inscription) doit générer ses propres données uniques plutôt que supposer une base vierge. Fonctionne, mais une base de test qui grossit indéfiniment finira par devoir être rechargée (`make test-db-fixtures`).
- Les tests fonctionnels ne couvrent que `register`/`login`/`objets` (création) : les autres contrôleurs (Logements, Prêts, Partages...) n'ont pas encore de test fonctionnel dédié.
- Cypress n'est pas encore branché en CI (explicitement annoncé comme la suite, avec Thomas).
