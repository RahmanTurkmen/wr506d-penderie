<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Categorie;
use App\Entity\Objet;
use App\Entity\RefusTenue;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class RefusTenueController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(RefusTenue $refus): array
    {
        return [
            'id' => (string) $refus->getId(),
            'objet' => $refus->getObjet() ? ['id' => (string) $refus->getObjet()->getId(), 'nom' => $refus->getObjet()->getNom()] : null,
            'categorie' => $refus->getCategorie() ? ['id' => (string) $refus->getCategorie()->getId(), 'nom' => $refus->getCategorie()->getNom()] : null,
        ];
    }

    #[Route('/api/refus-tenues', name: 'api_refus_tenues_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $profil->getRefusTenues()->toArray()));
    }

    #[Route('/api/refus-tenues', name: 'api_refus_tenues_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $objetId = $data['objetId'] ?? null;
        $categorieId = $data['categorieId'] ?? null;

        if ((null === $objetId) === (null === $categorieId)) {
            return new JsonResponse(['error' => 'Il faut fournir exactement un objetId OU un categorieId, jamais les deux.'], 400);
        }

        if (null !== $objetId) {
            $objet = $this->em->getRepository(Objet::class)->find($objetId);
            if (null === $objet || $objet->getProfil() !== $profil) {
                return new JsonResponse(['error' => 'objetId introuvable.'], 404);
            }
            $cible = $objet;
        } else {
            $categorie = $this->em->getRepository(Categorie::class)->find($categorieId);
            if (null === $categorie) {
                return new JsonResponse(['error' => 'categorieId introuvable.'], 404);
            }
            $cible = $categorie;
        }

        $refus = new RefusTenue($profil, $cible);
        $this->em->persist($refus);
        $this->em->flush();

        return new JsonResponse($this->serialize($refus), 201);
    }
}
