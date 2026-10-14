<?php

namespace App\Controller;

use App\Entity\Enum\ProfilType;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\ValidationStatut;
use App\Entity\Enum\ValidationType;
use App\Entity\Objet;
use App\Entity\Partage;
use App\Entity\User;
use App\Entity\Validation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Le compte principal (même User que le profil "gere" concerné) approuve ou
 * refuse une Validation en attente. Approuver déclenche l'action réelle
 * (créer le Partage, ou passer l'Objet en vente).
 */
class ValidationController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Validation $validation): array
    {
        return [
            'id' => (string) $validation->getId(),
            'type' => $validation->getType()->value,
            'statut' => $validation->getStatut()->value,
            'profil' => ['id' => (string) $validation->getProfil()->getId(), 'nom' => $validation->getProfil()->getNom()],
            'payload' => $validation->getPayload(),
            'createdAt' => $validation->getCreatedAt()->format('c'),
        ];
    }

    #[Route('/api/validations', name: 'api_validations_list', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $validations = array_filter(
            $this->em->getRepository(Validation::class)->findBy(['statut' => ValidationStatut::EnAttente]),
            fn (Validation $v) => $v->getProfil()->getUser() === $user,
        );

        return new JsonResponse(array_map($this->serialize(...), array_values($validations)));
    }

    #[Route('/api/validations/{id}', name: 'api_validations_decide', methods: ['PATCH'])]
    public function decide(string $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $validation = $this->em->getRepository(Validation::class)->find($id);
        // Seul le compte principal (même User que le profil géré demandeur) décide.
        if (null === $validation || $validation->getProfil()->getUser() !== $user) {
            return new JsonResponse(['error' => 'Validation introuvable.'], 404);
        }

        if (ValidationStatut::EnAttente !== $validation->getStatut()) {
            return new JsonResponse(['error' => 'Cette validation a déjà été traitée.'], 409);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $decision = ValidationStatut::tryFrom((string) ($data['statut'] ?? ''));
        if (!\in_array($decision, [ValidationStatut::Validee, ValidationStatut::Refusee], true)) {
            return new JsonResponse(['error' => 'statut doit être "validee" ou "refusee".'], 400);
        }

        $validation->decider($decision);

        if (ValidationStatut::Validee === $decision) {
            $this->appliquer($validation);
        }

        $this->em->flush();

        return new JsonResponse($this->serialize($validation));
    }

    private function appliquer(Validation $validation): void
    {
        $profil = $validation->getProfil();

        match ($validation->getType()) {
            ValidationType::Partage => $this->em->persist(new Partage($profil)),
            ValidationType::ObjetEnVente => $this->appliquerVente($validation),
        };
    }

    private function appliquerVente(Validation $validation): void
    {
        $objetId = $validation->getPayload()['objetId'] ?? null;
        $objet = null !== $objetId ? $this->em->getRepository(Objet::class)->find($objetId) : null;

        // Le profil est toujours "gere" ici (seul cas qui crée une Validation).
        if (null !== $objet && ProfilType::Gere === $objet->getProfil()->getType()) {
            $objet->setStatut(StatutObjet::EnVente);
        }
    }
}
