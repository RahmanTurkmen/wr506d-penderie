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

## Résumé

| | Backend (PHPStan) | Frontend (oxlint) |
|---|---|---|
| Erreurs bloquantes | 0 | 0 |
| À corriger si on a le temps | 2 (`file_get_contents`/`json_encode` pouvant renvoyer `false`) | 0 |
| Cosmétique / documentation | ~32 (types de tableaux manquants, champs jamais lus) | 5 (patterns connus et acceptés) |

Le code est propre dans l'ensemble — rien ne bloque ni ne représente un vrai risque en l'état. Les deux points PHPStan à corriger un jour sont des cas limites (`false` en cas d'échec improbable d'une fonction PHP), pas des bugs déclenchés en usage normal.
