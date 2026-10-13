<?php

namespace App\Controller;

use App\Entity\Enum\ProfilType;
use App\Entity\Profil;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class ProfilController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    private function serialize(Profil $profil): array
    {
        return [
            'id' => (string) $profil->getId(),
            'nom' => $profil->getNom(),
            'type' => $profil->getType()->value,
            'estMineur' => $profil->isEstMineur(),
        ];
    }

    #[Route('/api/profils', name: 'api_profils_list', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        return new JsonResponse(array_map($this->serialize(...), $user->getProfils()->toArray()));
    }

    /**
     * Crée un sous-compte (toujours de type "gere") rattaché au même User —
     * c'est ainsi qu'un compte principal gère ses enfants/proches (§1, §7).
     */
    #[Route('/api/profils', name: 'api_profils_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;
        $estMineur = (bool) ($data['estMineur'] ?? false);

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $profil = new Profil($user, $nom, ProfilType::Gere);
        $profil->setEstMineur($estMineur);

        $this->em->persist($profil);
        $this->em->flush();

        return new JsonResponse($this->serialize($profil), 201);
    }
}
