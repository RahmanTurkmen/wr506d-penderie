<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Objet;
use App\Entity\Tenue;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class TenueController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    private function serialize(Tenue $tenue): array
    {
        return [
            'id' => (string) $tenue->getId(),
            'nom' => $tenue->getNom(),
            'objets' => array_map(
                fn ($o) => ['id' => (string) $o->getId(), 'nom' => $o->getNom()],
                $tenue->getObjets()->toArray(),
            ),
        ];
    }

    #[Route('/api/tenues', name: 'api_tenues_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $profil->getTenues()->toArray()));
    }

    #[Route('/api/tenues', name: 'api_tenues_create', methods: ['POST'])]
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

        $tenue = new Tenue($profil, $nom);

        foreach ((array) $objetIds as $objetId) {
            $objet = $this->em->getRepository(Objet::class)->find($objetId);
            if (null !== $objet && $objet->getProfil() === $profil) {
                $tenue->addObjet($objet);
            }
        }

        $this->em->persist($tenue);
        $this->em->flush();

        return new JsonResponse($this->serialize($tenue), 201);
    }
}
