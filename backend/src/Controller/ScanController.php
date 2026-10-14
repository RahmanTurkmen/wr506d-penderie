<?php

namespace App\Controller;

use App\Entity\Enum\TypeObjet;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface as HttpClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;

/**
 * §3 : à l'ajout d'un objet, on peut prendre une photo et laisser une IA
 * (modèles de vision gratuits via OpenRouter) suggérer le nom/type/catégorie.
 * Reste toujours modifiable par l'utilisateur à l'étape suivante — c'est une
 * suggestion, pas une création automatique.
 *
 * Les modèles gratuits d'OpenRouter partagent un pool très sollicité (429
 * fréquents, ou des temps de réponse très variables). Plutôt que de les
 * essayer un par un (lent : la latence s'additionne), on les lance tous en
 * parallèle et on garde le premier qui répond correctement — ça donne un
 * scan nettement plus réactif tout en gardant plusieurs filets de sécurité.
 */
class ScanController
{
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
    private const MAX_SIZE = 6 * 1024 * 1024; // 6 Mo
    private const PER_MODEL_MAX_DURATION = 35; // secondes, durée totale par requête
    private const RACE_TIMEOUT = 40.0; // secondes, budget total de la course (toutes en parallèle)
    // Ordre de base (avant pondération par l'historique de fiabilité, cf.
    // orderByReliability) : classement observé le 13/10, à jour tant que
    // l'historique est vide ou que des modèles sont à égalité.
    private const RACE_MODELS = [
        'dots-studio/dots-3-note-preview:free',
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    ];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        #[Autowire(env: 'OPENROUTER_API_KEY')] private readonly string $apiKey,
        #[Autowire(env: 'OPENROUTER_MODEL')] private readonly string $preferredModel,
        #[Autowire('%kernel.project_dir%')] private readonly string $projectDir,
    ) {
    }

    #[Route('/api/objets/scan', name: 'api_objets_scan', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        if ('' === $this->apiKey) {
            return new JsonResponse(['error' => "La reconnaissance photo n'est pas configurée (clé OpenRouter manquante)."], 503);
        }

        $photo = $request->files->get('photo');
        if (null === $photo) {
            return new JsonResponse(['error' => 'Aucune photo reçue.'], 400);
        }

        if ($photo->getSize() > self::MAX_SIZE) {
            return new JsonResponse(['error' => 'Photo trop lourde (6 Mo maximum).'], 400);
        }

        $mime = $photo->getMimeType() ?? $photo->getClientMimeType();
        if (!\in_array($mime, self::ALLOWED_MIME, true)) {
            return new JsonResponse(['error' => 'Format de photo non supporté (JPEG, PNG ou WebP uniquement).'], 400);
        }

        $dataUri = sprintf('data:%s;base64,%s', $mime, base64_encode(file_get_contents($photo->getPathname())));

        $models = array_values(array_unique(array_filter([$this->preferredModel, ...self::RACE_MODELS])));
        $models = $this->orderByReliability($models);
        $suggestion = $this->race($models, $dataUri);

        if (null === $suggestion) {
            return new JsonResponse([
                'error' => "Les modèles gratuits de reconnaissance sont saturés pour le moment. Réessaie dans une minute, ou remplis le formulaire manuellement.",
            ], 502);
        }

        return new JsonResponse($suggestion);
    }

    /**
     * Classe les modèles du plus fiable (le moins souvent saturé pour nous,
     * d'après l'historique des scans précédents) au moins fiable, pour que
     * la course tente en priorité celui qui a le plus de chances d'aboutir.
     * Un modèle jamais essayé est traité comme neutre (ni privilégié ni
     * pénalisé) pour continuer à lui laisser sa chance.
     *
     * @param list<string> $models
     *
     * @return list<string>
     */
    private function orderByReliability(array $models): array
    {
        $stats = $this->loadStats();
        $score = fn (string $m) => isset($stats[$m])
            ? $stats[$m]['success'] / max(1, $stats[$m]['success'] + $stats[$m]['failure'])
            : 0.5;

        usort($models, fn ($a, $b) => $score($b) <=> $score($a));

        return $models;
    }

    private function statsFile(): string
    {
        // var/cache est déjà accessible en écriture par le process PHP (créé
        // par Symfony au démarrage) ; var/ lui-même ne l'est pas forcément
        // selon l'utilisateur sous lequel tourne php-fpm.
        return $this->projectDir.'/var/cache/scan_model_stats.json';
    }

    /** @return array<string, array{success: int, failure: int}> */
    private function loadStats(): array
    {
        $file = $this->statsFile();
        if (!is_file($file)) {
            return [];
        }
        $data = json_decode((string) file_get_contents($file), true);

        return \is_array($data) ? $data : [];
    }

    private function recordOutcome(string $model, bool $success): void
    {
        $stats = $this->loadStats();
        $stats[$model]['success'] = ($stats[$model]['success'] ?? 0) + ($success ? 1 : 0);
        $stats[$model]['failure'] = ($stats[$model]['failure'] ?? 0) + ($success ? 0 : 1);

        $dir = \dirname($this->statsFile());
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        file_put_contents($this->statsFile(), json_encode($stats, JSON_PRETTY_PRINT));
    }

    /**
     * Lance tous les modèles en parallèle (dans l'ordre de fiabilité calculé
     * par orderByReliability) et renvoie le premier résultat exploitable.
     * Consigne au passage, par modèle, ce qui a réussi ou échoué, pour que
     * les prochains scans priorisent le moins saturé.
     *
     * Piège de l'API HttpClient de Symfony : dès qu'une réponse du lot a un
     * statut HTTP d'erreur (ex. 429), `stream()` lève une exception au
     * prochain `next()` de l'itérateur — ce qui arrête tout le streaming,
     * pas seulement ce candidat. On rattrape l'exception, on identifie la
     * réponse fautive via `$e->getResponse()`, on la retire du lot, et on
     * relance `stream()` sur les candidats restants jusqu'à trouver un
     * gagnant ou épuiser le budget de temps.
     *
     * @param list<string> $models
     *
     * @return array{nom: string, marque: string, couleur: string, type: string, categorie: string, confidence: int}|null
     */
    private function race(array $models, string $dataUri): ?array
    {
        $pending = [];
        $modelOf = [];
        foreach ($models as $model) {
            $response = $this->startRequest($model, $dataUri);
            $pending[spl_object_id($response)] = $response;
            $modelOf[spl_object_id($response)] = $model;
        }

        $deadline = microtime(true) + self::RACE_TIMEOUT;
        $suggestion = null;
        // `stream()` peut re-signaler une réponse déjà traitée quand on le
        // rappelle sur le reste du lot après une exception : on ne note son
        // résultat qu'une seule fois par modèle, même si on le "revoit".
        $recorded = [];

        try {
            while ([] !== $pending) {
                $remaining = $deadline - microtime(true);
                if ($remaining <= 0) {
                    break;
                }

                try {
                    foreach ($this->httpClient->stream($pending, $remaining) as $response => $chunk) {
                        if (!$chunk->isLast()) {
                            continue;
                        }
                        $id = spl_object_id($response);
                        unset($pending[$id]);

                        $found = $this->extractSuggestion($response);
                        if (!isset($recorded[$id])) {
                            $recorded[$id] = true;
                            $this->recordOutcome($modelOf[$id], null !== $found);
                        }
                        if (null !== $found) {
                            $suggestion = $found;
                            break 2;
                        }
                    }
                    break; // tout le lot restant a été traité sans lever d'exception
                } catch (HttpExceptionInterface $e) {
                    $id = spl_object_id($e->getResponse());
                    unset($pending[$id]);
                    if (!isset($recorded[$id]) && isset($modelOf[$id])) {
                        $recorded[$id] = true;
                        $this->recordOutcome($modelOf[$id], false);
                    }
                } catch (HttpClientExceptionInterface) {
                    break; // erreur réseau/timeout non rattachable à une réponse précise : on s'arrête là
                }
            }
        } finally {
            foreach ($pending as $response) {
                $response->cancel();
            }
        }

        return $suggestion;
    }

    private function startRequest(string $model, string $dataUri): ResponseInterface
    {
        return $this->httpClient->request('POST', 'https://openrouter.ai/api/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://lumen.local',
                'X-Title' => 'Lumen',
            ],
            'json' => [
                'model' => $model,
                'temperature' => 0.2,
                'max_tokens' => 600,
                'messages' => [[
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $this->prompt()],
                        ['type' => 'image_url', 'image_url' => ['url' => $dataUri]],
                    ],
                ]],
            ],
            'max_duration' => self::PER_MODEL_MAX_DURATION,
        ]);
    }

    /** @return array{nom: string, marque: string, couleur: string, type: string, categorie: string, confidence: int}|null */
    private function extractSuggestion(ResponseInterface $response): ?array
    {
        try {
            $payload = $response->toArray(false);
        } catch (HttpClientExceptionInterface) {
            return null;
        }

        if (isset($payload['error'])) {
            return null;
        }

        $content = $payload['choices'][0]['message']['content'] ?? null;

        return \is_string($content) ? $this->parseSuggestion($content) : null;
    }

    private function prompt(): string
    {
        $types = implode('|', array_column(TypeObjet::cases(), 'value'));

        return <<<PROMPT
            Tu identifies un objet du quotidien à partir d'une photo, pour un inventaire personnel (vêtement, logement, loisirs). Réponds vite et directement, sans réfléchir longuement, UNIQUEMENT avec un objet JSON strict, sans texte ni balise autour, au format exact :
            {"nom": "nom court et concret SANS la marque ni la couleur, ex: Veste en jean", "marque": "marque si visible sur un logo/étiquette, sinon chaîne vide (ne l'invente jamais)", "couleur": "couleur principale si visible, sinon chaîne vide", "type": "{$types}", "categorie": "catégorie courte suggérée, ex: Hauts", "confidence": entier de 0 à 100}
            En cas de doute sur la marque, laisse-la vide plutôt que de te tromper. L'utilisateur pourra toujours corriger ou compléter ensuite.
            Si tu n'es pas sûr du reste, choisis quand même ta meilleure estimation et baisse confidence.
            PROMPT;
    }

    /** @return array{nom: string, marque: string, couleur: string, type: string, categorie: string, confidence: int}|null */
    private function parseSuggestion(string $content): ?array
    {
        $cleaned = trim($content);
        $cleaned = preg_replace('/^```(?:json)?|```$/m', '', $cleaned) ?? $cleaned;

        if (!preg_match('/\{.*\}/s', $cleaned, $matches)) {
            return null;
        }

        $data = json_decode($matches[0], true);
        if (!\is_array($data) || !\is_string($data['nom'] ?? null) || '' === trim($data['nom'])) {
            return null;
        }

        $type = (TypeObjet::tryFrom((string) ($data['type'] ?? '')) ?? TypeObjet::Autre)->value;
        $confidence = (int) ($data['confidence'] ?? 0);

        return [
            'nom' => trim($data['nom']),
            'marque' => \is_string($data['marque'] ?? null) ? trim($data['marque']) : '',
            'couleur' => \is_string($data['couleur'] ?? null) ? trim($data['couleur']) : '',
            'type' => $type,
            'categorie' => \is_string($data['categorie'] ?? null) ? trim($data['categorie']) : '',
            'confidence' => max(0, min(100, $confidence)),
        ];
    }
}
