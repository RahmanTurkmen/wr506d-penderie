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
    private const RACE_MODELS = [
        'dots-studio/dots-3-note-preview:free',
        'google/gemma-4-26b-a4b-it:free',
        'google/gemma-4-31b-it:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    ];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        #[Autowire(env: 'OPENROUTER_API_KEY')] private readonly string $apiKey,
        #[Autowire(env: 'OPENROUTER_MODEL')] private readonly string $preferredModel,
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
        $suggestion = $this->race($models, $dataUri);

        if (null === $suggestion) {
            return new JsonResponse([
                'error' => "Les modèles gratuits de reconnaissance sont saturés pour le moment. Réessaie dans une minute, ou remplis le formulaire manuellement.",
            ], 502);
        }

        return new JsonResponse($suggestion);
    }

    /**
     * Lance tous les modèles en parallèle et renvoie le premier résultat
     * exploitable.
     *
     * Piège de l'API HttpClient de Symfony : dès qu'une réponse du lot a un
     * statut HTTP d'erreur (ex. 429), `stream()` lève une exception au
     * prochain `next()` de l'itérateur — ce qui arrête tout le streaming,
     * pas seulement ce candidat. On rattrape l'exception, on identifie la
     * réponse fautive via `$e->getResponse()`, on la retire du lot, et on
     * relance `stream()` sur les candidats restants jusqu'à trouver un
     * gagnant ou épuiser le budget de temps.
     */
    private function race(array $models, string $dataUri): ?array
    {
        $pending = [];
        foreach ($models as $model) {
            $response = $this->startRequest($model, $dataUri);
            $pending[spl_object_id($response)] = $response;
        }

        $deadline = microtime(true) + self::RACE_TIMEOUT;
        $suggestion = null;

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
                        unset($pending[spl_object_id($response)]);

                        $found = $this->extractSuggestion($response);
                        if (null !== $found) {
                            $suggestion = $found;
                            break 2;
                        }
                    }
                    break; // tout le lot restant a été traité sans lever d'exception
                } catch (HttpExceptionInterface $e) {
                    unset($pending[spl_object_id($e->getResponse())]);
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
            {"nom": "nom court et concret incluant la marque si elle est visible sur un logo/étiquette (sinon ne l'invente pas) et la couleur principale si elle est visible, ex: Veste Levi's bleue", "type": "{$types}", "categorie": "catégorie courte suggérée, ex: Hauts", "confidence": entier de 0 à 100}
            L'utilisateur pourra toujours corriger ou compléter le nom ensuite : en cas de doute sur la marque, ne la mentionne pas plutôt que de te tromper.
            Si tu n'es pas sûr du reste, choisis quand même ta meilleure estimation et baisse confidence.
            PROMPT;
    }

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

        $type = TypeObjet::tryFrom((string) ($data['type'] ?? ''))?->value ?? TypeObjet::Autre->value;
        $confidence = (int) ($data['confidence'] ?? 0);

        return [
            'nom' => trim($data['nom']),
            'type' => $type,
            'categorie' => \is_string($data['categorie'] ?? null) ? trim($data['categorie']) : '',
            'confidence' => max(0, min(100, $confidence)),
        ];
    }
}
