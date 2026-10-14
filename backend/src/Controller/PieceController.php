<?php

namespace App\Controller;

use App\Entity\Logement;
use App\Entity\Piece;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class PieceController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Piece $piece): array
    {
        return [
            'id' => (string) $piece->getId(),
            'nom' => $piece->getNom(),
            'conteneurs' => array_map(
                fn ($c) => ['id' => (string) $c->getId(), 'nom' => $c->getNom()],
                $piece->getConteneurs()->toArray(),
            ),
        ];
    }

    private function findOwnedLogement(string $logementId, User $user): ?Logement
    {
        $logement = $this->em->getRepository(Logement::class)->find($logementId);
        if (null === $logement || $logement->getProfil()->getUser() !== $user) {
            return null;
        }

        return $logement;
    }

    #[Route('/api/logements/{logementId}/pieces', name: 'api_pieces_list', methods: ['GET'])]
    public function list(string $logementId, #[CurrentUser] User $user): JsonResponse
    {
        $logement = $this->findOwnedLogement($logementId, $user);
        if (null === $logement) {
            return new JsonResponse(['error' => 'Logement introuvable.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $logement->getPieces()->toArray()));
    }

    #[Route('/api/logements/{logementId}/pieces', name: 'api_pieces_create', methods: ['POST'])]
    public function create(string $logementId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $logement = $this->findOwnedLogement($logementId, $user);
        if (null === $logement) {
            return new JsonResponse(['error' => 'Logement introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $piece = new Piece($logement, $nom);
        $this->em->persist($piece);
        $this->em->flush();

        return new JsonResponse($this->serialize($piece), 201);
    }
}
