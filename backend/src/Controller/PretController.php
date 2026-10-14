<?php

namespace App\Controller;

use App\Entity\Enum\StatutObjet;
use App\Entity\Objet;
use App\Entity\Pret;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class PretController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Pret $pret): array
    {
        return [
            'id' => (string) $pret->getId(),
            'emprunteurNom' => $pret->getEmprunteurNom(),
            'dateDebut' => $pret->getDateDebut()->format('c'),
            'dateFinPrevue' => $pret->getDateFinPrevue()?->format('c'),
            'dateRetour' => $pret->getDateRetour()?->format('c'),
            'actif' => $pret->isActif(),
        ];
    }

    private function findOwnedObjet(string $objetId, User $user): ?Objet
    {
        $objet = $this->em->getRepository(Objet::class)->find($objetId);
        if (null === $objet || $objet->getProfil()->getUser() !== $user) {
            return null;
        }

        return $objet;
    }

    #[Route('/api/objets/{objetId}/prets', name: 'api_prets_list', methods: ['GET'])]
    public function list(string $objetId, #[CurrentUser] User $user): JsonResponse
    {
        $objet = $this->findOwnedObjet($objetId, $user);
        if (null === $objet) {
            return new JsonResponse(['error' => 'Objet introuvable.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $objet->getPrets()->toArray()));
    }

    #[Route('/api/objets/{objetId}/prets', name: 'api_prets_create', methods: ['POST'])]
    public function create(string $objetId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $objet = $this->findOwnedObjet($objetId, $user);
        if (null === $objet) {
            return new JsonResponse(['error' => 'Objet introuvable.'], 404);
        }

        // Invariant §7 : un seul prêt actif par objet.
        foreach ($objet->getPrets() as $existing) {
            if ($existing->isActif()) {
                return new JsonResponse(['error' => 'Cet objet a déjà un prêt actif.'], 409);
            }
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $emprunteurNom = $data['emprunteurNom'] ?? null;
        if (!\is_string($emprunteurNom) || '' === $emprunteurNom) {
            return new JsonResponse(['error' => 'emprunteurNom est requis.'], 400);
        }

        $pret = new Pret($objet, $emprunteurNom);
        if (isset($data['dateFinPrevue']) && \is_string($data['dateFinPrevue'])) {
            try {
                $pret->setDateFinPrevue(new \DateTimeImmutable($data['dateFinPrevue']));
            } catch (\Exception) {
                return new JsonResponse(['error' => 'dateFinPrevue invalide.'], 400);
            }
        }

        $objet->setStatut(StatutObjet::Prete);
        $this->em->persist($pret);
        $this->em->flush();

        return new JsonResponse($this->serialize($pret), 201);
    }

    #[Route('/api/prets/{id}/cloturer', name: 'api_prets_cloturer', methods: ['PATCH'])]
    public function cloturer(string $id, #[CurrentUser] User $user): JsonResponse
    {
        $pret = $this->em->getRepository(Pret::class)->find($id);
        if (null === $pret || $pret->getObjet()->getProfil()->getUser() !== $user) {
            return new JsonResponse(['error' => 'Prêt introuvable.'], 404);
        }

        $pret->cloturer();
        $pret->getObjet()->setStatut(StatutObjet::Disponible);
        $this->em->flush();

        return new JsonResponse($this->serialize($pret));
    }
}
