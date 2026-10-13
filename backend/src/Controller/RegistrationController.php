<?php

namespace App\Controller;

use App\Entity\Enum\ProfilType;
use App\Entity\Profil;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $nom = $data['nom'] ?? null;

        if (!\is_string($email) || !\is_string($password) || !\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'email, password et nom sont requis.'], 400);
        }

        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (null !== $existing) {
            return new JsonResponse(['error' => 'Un compte existe déjà avec cet email.'], 409);
        }

        $user = new User($email);
        if (\strlen($password) < 8) {
            return new JsonResponse(['error' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $profil = new Profil($user, $nom, ProfilType::Principal);

        $this->em->persist($user);
        $this->em->persist($profil);
        $this->em->flush();

        return new JsonResponse([
            'id' => (string) $user->getId(),
            'email' => $user->getEmail(),
            'profil' => [
                'id' => (string) $profil->getId(),
                'nom' => $profil->getNom(),
                'type' => $profil->getType()->value,
            ],
        ], 201);
    }
}
