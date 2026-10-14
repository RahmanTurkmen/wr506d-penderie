<?php

namespace App\Controller;

use App\Entity\Categorie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Les catégories sont une taxonomie partagée (pas rattachées à un profil),
 * cf. choix documenté dans le modèle de données.
 */
class CategorieController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** @return array<string, mixed> */
    private function serialize(Categorie $categorie): array
    {
        return ['id' => (string) $categorie->getId(), 'nom' => $categorie->getNom()];
    }

    #[Route('/api/categories', name: 'api_categories_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $categories = $this->em->getRepository(Categorie::class)->findAll();

        return new JsonResponse(array_map($this->serialize(...), $categories));
    }

    #[Route('/api/categories', name: 'api_categories_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $existing = $this->em->getRepository(Categorie::class)->findOneBy(['nom' => $nom]);
        if (null !== $existing) {
            return new JsonResponse(['error' => 'Cette catégorie existe déjà.'], 409);
        }

        $categorie = new Categorie($nom);
        $this->em->persist($categorie);
        $this->em->flush();

        return new JsonResponse($this->serialize($categorie), 201);
    }
}
