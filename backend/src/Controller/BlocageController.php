<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Blocage;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

class BlocageController
{
    use ResolvesActiveProfilTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
    ) {
    }

    /** @return array<string, mixed> */
    private function serialize(Blocage $blocage): array
    {
        return [
            'id' => (string) $blocage->getId(),
            'userEmail' => $blocage->getUser()->getEmail(),
            'createdAt' => $blocage->getCreatedAt()->format('c'),
        ];
    }

    #[Route('/api/blocages', name: 'api_blocages_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => $this->translator->trans('profil.not_found')], 404);
        }

        $blocages = $this->em->getRepository(Blocage::class)->findBy(['profil' => $profil]);

        return new JsonResponse(array_map($this->serialize(...), $blocages));
    }

    #[Route('/api/blocages', name: 'api_blocages_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => $this->translator->trans('profil.not_found')], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['userEmail'] ?? null;
        if (!\is_string($email) || '' === $email) {
            return new JsonResponse(['error' => $this->translator->trans('blocage.user_email_requis')], 400);
        }

        $cible = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (null === $cible) {
            return new JsonResponse(['error' => $this->translator->trans('blocage.utilisateur_introuvable')], 404);
        }

        if ($cible === $user) {
            return new JsonResponse(['error' => $this->translator->trans('blocage.self_block')], 400);
        }

        $existing = $this->em->getRepository(Blocage::class)->findOneBy(['profil' => $profil, 'user' => $cible]);
        if (null !== $existing) {
            return new JsonResponse(['error' => $this->translator->trans('blocage.deja_bloque')], 409);
        }

        $blocage = new Blocage($profil, $cible);
        $this->em->persist($blocage);
        $this->em->flush();

        return new JsonResponse($this->serialize($blocage), 201);
    }

    #[Route('/api/blocages/{id}', name: 'api_blocages_delete', methods: ['DELETE'])]
    public function delete(string $id, #[CurrentUser] User $user): JsonResponse
    {
        $blocage = $this->em->getRepository(Blocage::class)->find($id);
        if (null === $blocage || $blocage->getProfil()->getUser() !== $user) {
            return new JsonResponse(['error' => $this->translator->trans('blocage.not_found')], 404);
        }

        $this->em->remove($blocage);
        $this->em->flush();

        return new JsonResponse(null, 204);
    }
}
