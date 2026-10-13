<?php

namespace App\Controller;

use App\Entity\Tag;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Les tags sont un vocabulaire partagé (comme les catégories), pas rattachés
 * à un profil.
 */
class TagController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    private function serialize(Tag $tag): array
    {
        return ['id' => (string) $tag->getId(), 'nom' => $tag->getNom()];
    }

    #[Route('/api/tags', name: 'api_tags_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $tags = $this->em->getRepository(Tag::class)->findAll();

        return new JsonResponse(array_map($this->serialize(...), $tags));
    }

    #[Route('/api/tags', name: 'api_tags_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $existing = $this->em->getRepository(Tag::class)->findOneBy(['nom' => $nom]);
        if (null !== $existing) {
            return new JsonResponse(['error' => 'Ce tag existe déjà.'], 409);
        }

        $tag = new Tag($nom);
        $this->em->persist($tag);
        $this->em->flush();

        return new JsonResponse($this->serialize($tag), 201);
    }
}
