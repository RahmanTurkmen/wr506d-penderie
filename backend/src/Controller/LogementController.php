<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Logement;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class LogementController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Logement $logement): array
    {
        return [
            'id' => (string) $logement->getId(),
            'nom' => $logement->getNom(),
            'pieces' => array_map(
                fn ($p) => ['id' => (string) $p->getId(), 'nom' => $p->getNom()],
                $logement->getPieces()->toArray(),
            ),
        ];
    }

    #[Route('/api/logements', name: 'api_logements_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => "Aucun profil pour cet utilisateur."], 404);
        }

        $logements = array_map($this->serialize(...), $profil->getLogements()->toArray());

        return new JsonResponse($logements);
    }

    #[Route('/api/logements', name: 'api_logements_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => "Aucun profil pour cet utilisateur."], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $logement = new Logement($profil, $nom);
        $this->em->persist($logement);
        $this->em->flush();

        return new JsonResponse($this->serialize($logement), 201);
    }
}
