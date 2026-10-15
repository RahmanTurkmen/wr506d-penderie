<?php

namespace App\Tests\Integration;

use App\Repository\BlocageRepository;
use App\Repository\ProfilRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * §8 : un profil peut bloquer un utilisateur (ex. pour l'empêcher de
 * commenter un partage). On vérifie que la relation profil <-> user
 * bloqué est bien persistée et retrouvable dans les deux sens.
 */
final class BlocageRepositoryTest extends KernelTestCase
{
    public function testCamilleABloqueLilou(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        $lilou = $container->get(UserRepository::class)->findOneBy(['email' => 'lilou@lumen.local']);
        self::assertNotNull($camille);
        self::assertNotNull($lilou);

        $blocage = $container->get(BlocageRepository::class)->findOneBy(['profil' => $camille, 'user' => $lilou]);

        self::assertNotNull($blocage);
        self::assertSame($camille, $blocage->getProfil());
        self::assertSame($lilou, $blocage->getUser());
    }
}
