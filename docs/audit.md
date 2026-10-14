# Audit statique — Lumen

> Analyse statique du code, backend (PHPStan) et frontend (oxlint, l'équivalent ESLint utilisé par ce projet). Généré le 13/10/2026. Aucun des outils n'est configuré de façon permanente dans le repo (pas de `phpstan.neon` commité) — les commandes ci-dessous sont celles utilisées pour produire ce rapport, à relancer à la main si besoin.

---

## Backend — PHPStan

PHPStan est déjà une dépendance du projet (`phpstan/phpstan` dans `composer.json`) mais n'a pas de fichier de config ni de script `composer run`. Commande utilisée :

```bash
docker compose exec php vendor/bin/phpstan analyse src --level 8 --no-progress
```

### Niveau 5 (bugs probables) — 4 trouvailles

| Fichier | Ligne | Problème |
|---|---|---|
| `ScanController.php` | 283 | `?->value` à gauche d'un `??` : le `?->` ne peut jamais être `null` à cet endroit, le `??` est inutile (pas un bug, juste du code mort à nettoyer) |
| `Entity/Piece.php` | 29 | `$objets` n'est jamais lu, seulement écrit (collection inverse jamais utilisée côté lecture) |
| `Entity/Tenue.php` | 29 | `$createdAt` jamais lu |
| `Entity/Valise.php` | 32 | `$createdAt` jamais lu |

Les trois dernières ne sont pas des bugs : ce sont des champs d'audit (date de création) qu'on a ajoutés par convention mais qu'aucun endpoint n'expose encore. Pas urgent, mais si le modèle de données venait à être revu, soit on les enlève, soit on les expose dans les `serialize()`.

### Niveau 8 (plus strict) — 34 trouvailles, à trier

**Deux vraies trouvailles valent le coup d'œil :**

1. **`ScanController.php:72`** — `base64_encode(file_get_contents(...))` : `file_get_contents()` peut renvoyer `false` en cas d'échec de lecture du fichier temporaire, et PHPStan le signale correctement. En pratique peu probable ici (le fichier vient d'être validé par Symfony juste avant), mais un `file_get_contents() ?: ''` ou une vérification explicite serait plus propre.
2. **`Entity/Validation.php:48`** — même famille de problème : `json_encode()` peut renvoyer `false`, assigné à une propriété typée `string|null` sans ce cas. Risque réel si jamais `json_encode()` échoue (payload non sérialisable) — actuellement non géré.

**Le reste (environ 30 occurrences) est cosmétique** : `missingType.iterableValue`, c'est-à-dire des méthodes qui renvoient ou prennent `array` sans préciser le type des éléments (ex. `@return array<string, mixed>` en PHPDoc). C'est la quasi-totalité des `serialize()` des contrôleurs (Objet, Partage, Piece, Pret, Profil, RefusTenue, Tag, Tenue, Transaction, Validation, Valise...). Rien de cassé, juste de la documentation de type à ajouter si on veut un jour monter le niveau PHPStan en CI.

Deux autres détails mineurs :
- `User::getUserIdentifier()` devrait renvoyer `non-empty-string` plutôt que `string` (l'email ne peut pas être vide en pratique, mais le type ne le garantit pas).
- `User::$roles` / `setRoles()` : même famille `missingType.iterableValue` (devrait être `array<string>`).

---

## Frontend — oxlint

```bash
docker compose exec frontend npx oxlint src
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
npx snyk test --file=composer.lock --package-manager=composer   # depuis backend/
npx snyk test --file=package.json                                # depuis frontend/
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

---

## Résumé

| | Backend (PHPStan) | Frontend (oxlint) | Dépendances (Snyk) |
|---|---|---|---|
| Erreurs/vulnérabilités bloquantes | 0 | 0 | 0 (après reclassement `shadcn` en devDependencies) |
| À corriger si on a le temps | 2 (`file_get_contents`/`json_encode` pouvant renvoyer `false`) | 0 | 0 (aucun correctif amont disponible pour les 3 restantes, non atteignables en prod) |
| Cosmétique / documentation | ~32 (types de tableaux manquants, champs jamais lus) | 5 (patterns connus et acceptés) | — |

Le code est propre dans l'ensemble — rien ne bloque ni ne représente un vrai risque en l'état. Les deux points PHPStan à corriger un jour sont des cas limites (`false` en cas d'échec improbable d'une fonction PHP), pas des bugs déclenchés en usage normal.
