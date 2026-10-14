<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Objet;
use App\Entity\User;
use App\Entity\Valise;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class ValiseController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Valise $valise): array
    {
        return [
            'id' => (string) $valise->getId(),
            'nom' => $valise->getNom(),
            'createdAt' => $valise->getCreatedAt()->format('c'),
            'objets' => array_map(
                fn ($o) => ['id' => (string) $o->getId(), 'nom' => $o->getNom()],
                $valise->getObjets()->toArray(),
            ),
        ];
    }

    #[Route('/api/valises', name: 'api_valises_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $profil->getValises()->toArray()));
    }

    #[Route('/api/valises', name: 'api_valises_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;
        $objetIds = $data['objetIds'] ?? [];

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $valise = new Valise($profil, $nom);

        foreach ((array) $objetIds as $objetId) {
            $objet = $this->em->getRepository(Objet::class)->find($objetId);
            if (null !== $objet && $objet->getProfil() === $profil) {
                $valise->addObjet($objet);
            }
        }

        $this->em->persist($valise);
        $this->em->flush();

        return new JsonResponse($this->serialize($valise), 201);
    }
}
