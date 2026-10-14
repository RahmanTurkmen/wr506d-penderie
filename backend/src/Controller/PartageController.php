<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Blocage;
use App\Entity\Commentaire;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\ValidationType;
use App\Entity\Partage;
use App\Entity\User;
use App\Entity\Validation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Uid\Uuid;

class PartageController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Partage $partage): array
    {
        return [
            'id' => (string) $partage->getId(),
            'token' => (string) $partage->getToken(),
            'createdAt' => $partage->getCreatedAt()->format('c'),
            'revoque' => $partage->isRevoque(),
        ];
    }

    /** @return array<string, mixed> */
    private function serializeCommentaire(Commentaire $commentaire): array
    {
        return [
            'id' => (string) $commentaire->getId(),
            'auteur' => $commentaire->getAuteur()->getEmail(),
            'contenu' => $commentaire->getContenu(),
            'createdAt' => $commentaire->getCreatedAt()->format('c'),
        ];
    }

    #[Route('/api/partages', name: 'api_partages_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $profil->getPartages()->toArray()));
    }

    #[Route('/api/partages', name: 'api_partages_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        // §7 invariant : un profil "gere" ne crée pas de partage sans
        // validation du compte principal.
        if (ProfilType::Gere === $profil->getType()) {
            $validation = new Validation($profil, ValidationType::Partage);
            $this->em->persist($validation);
            $this->em->flush();

            return new JsonResponse([
                'enAttenteDeValidation' => true,
                'validationId' => (string) $validation->getId(),
                'message' => 'Création du partage soumise au compte principal pour validation.',
            ], 202);
        }

        $partage = new Partage($profil);
        $this->em->persist($partage);
        $this->em->flush();

        return new JsonResponse($this->serialize($partage), 201);
    }

    #[Route('/api/partages/{id}/revoquer', name: 'api_partages_revoquer', methods: ['PATCH'])]
    public function revoquer(string $id, #[CurrentUser] User $user): JsonResponse
    {
        $partage = $this->em->getRepository(Partage::class)->find($id);
        if (null === $partage || $partage->getProfil()->getUser() !== $user) {
            return new JsonResponse(['error' => 'Partage introuvable.'], 404);
        }

        $partage->revoquer();
        $this->em->flush();

        return new JsonResponse($this->serialize($partage));
    }

    /**
     * Lecture seule par lien, sans compte (§8). Public à dessein : la
     * sécurité vient de la possession du token, pas d'une authentification.
     */
    #[Route('/api/partages/by-token/{token}', name: 'api_partages_by_token', methods: ['GET'])]
    public function viewByToken(string $token, #[CurrentUser] ?User $user = null): JsonResponse
    {
        try {
            $uuid = Uuid::fromString($token);
        } catch (\InvalidArgumentException) {
            return new JsonResponse(['error' => 'Lien invalide.'], 404);
        }

        $partage = $this->em->getRepository(Partage::class)->findOneBy(['token' => $uuid]);
        if (null === $partage || $partage->isRevoque()) {
            return new JsonResponse(['error' => 'Lien invalide ou révoqué.'], 404);
        }

        $profil = $partage->getProfil();

        // §8 : une personne bloquée n'a aucun accès, même avec un lien valide.
        // Seul un visiteur authentifié peut être identifié comme "bloqué" —
        // un visiteur totalement anonyme n'a pas d'identité à vérifier.
        if (null !== $user) {
            $blocage = $this->em->getRepository(Blocage::class)->findOneBy(['profil' => $profil, 'user' => $user]);
            if (null !== $blocage) {
                return new JsonResponse(['error' => 'Accès refusé.'], 403);
            }
        }

        return new JsonResponse([
            'profil' => ['nom' => $profil->getNom()],
            'logements' => array_map(
                fn ($l) => [
                    'nom' => $l->getNom(),
                    'pieces' => array_map(fn ($p) => ['nom' => $p->getNom()], $l->getPieces()->toArray()),
                ],
                $profil->getLogements()->toArray(),
            ),
            'objets' => array_map(
                fn ($o) => ['nom' => $o->getNom(), 'type' => $o->getType()->value, 'statut' => $o->getStatut()->value],
                $profil->getObjets()->toArray(),
            ),
        ]);
    }

    #[Route('/api/partages/{id}/commentaires', name: 'api_commentaires_list', methods: ['GET'])]
    public function listCommentaires(string $id): JsonResponse
    {
        $partage = $this->em->getRepository(Partage::class)->find($id);
        if (null === $partage) {
            return new JsonResponse(['error' => 'Partage introuvable.'], 404);
        }

        return new JsonResponse(array_map($this->serializeCommentaire(...), $partage->getCommentaires()->toArray()));
    }

    /**
     * Commenter nécessite un compte authentifié (§8 : "personne autorisée"),
     * contrairement à la simple consultation par lien.
     */
    #[Route('/api/partages/{id}/commentaires', name: 'api_commentaires_create', methods: ['POST'])]
    public function createCommentaire(string $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $partage = $this->em->getRepository(Partage::class)->find($id);
        if (null === $partage || $partage->isRevoque()) {
            return new JsonResponse(['error' => 'Partage introuvable.'], 404);
        }

        $blocage = $this->em->getRepository(Blocage::class)->findOneBy(['profil' => $partage->getProfil(), 'user' => $user]);
        if (null !== $blocage) {
            return new JsonResponse(['error' => 'Accès refusé.'], 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $contenu = $data['contenu'] ?? null;
        if (!\is_string($contenu) || '' === $contenu) {
            return new JsonResponse(['error' => 'contenu est requis.'], 400);
        }

        $commentaire = new Commentaire($partage, $user, $contenu);
        $this->em->persist($commentaire);
        $this->em->flush();

        return new JsonResponse($this->serializeCommentaire($commentaire), 201);
    }
}
