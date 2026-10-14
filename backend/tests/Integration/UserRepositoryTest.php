<?php

namespace App\Tests\Integration;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Vérifie l'intégration Doctrine <-> fixtures : le compte de test principal
 * (test@lumen.local, utilisé pour toutes les démos manuelles de l'app) doit
 * exister et avoir un mot de passe hashé exploitable.
 */
final class UserRepositoryTest extends KernelTestCase
{
    public function testFindUserByEmail(): void
    {
        self::bootKernel();

        $repository = static::getContainer()->get(UserRepository::class);

        $user = $repository->findOneBy(['email' => 'test@lumen.local']);

        self::assertNotNull($user);
        self::assertInstanceOf(User::class, $user);
        self::assertSame('test@lumen.local', $user->getEmail());
        self::assertNotSame('', $user->getPassword());
    }

    public function testUserInconnuRenvoieNull(): void
    {
        self::bootKernel();

        $repository = static::getContainer()->get(UserRepository::class);

        $user = $repository->findOneBy(['email' => 'inconnu@lumen.local']);

        self::assertNull($user);
    }
}
