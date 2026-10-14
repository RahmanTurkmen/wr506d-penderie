<?php

namespace App\Controller;

use App\Entity\Conteneur;
use App\Entity\Piece;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class ConteneurController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Conteneur $conteneur): array
    {
        return [
            'id' => (string) $conteneur->getId(),
            'nom' => $conteneur->getNom(),
        ];
    }

    private function findOwnedPiece(string $pieceId, User $user): ?Piece
    {
        $piece = $this->em->getRepository(Piece::class)->find($pieceId);
        if (null === $piece || $piece->getLogement()->getProfil()->getUser() !== $user) {
            return null;
        }

        return $piece;
    }

    #[Route('/api/pieces/{pieceId}/conteneurs', name: 'api_conteneurs_list', methods: ['GET'])]
    public function list(string $pieceId, #[CurrentUser] User $user): JsonResponse
    {
        $piece = $this->findOwnedPiece($pieceId, $user);
        if (null === $piece) {
            return new JsonResponse(['error' => 'Piece introuvable.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $piece->getConteneurs()->toArray()));
    }

    #[Route('/api/pieces/{pieceId}/conteneurs', name: 'api_conteneurs_create', methods: ['POST'])]
    public function create(string $pieceId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $piece = $this->findOwnedPiece($pieceId, $user);
        if (null === $piece) {
            return new JsonResponse(['error' => 'Piece introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $conteneur = new Conteneur($piece, $nom);
        $this->em->persist($conteneur);
        $this->em->flush();

        return new JsonResponse($this->serialize($conteneur), 201);
    }
}
