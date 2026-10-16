<?php

namespace App\Tests\Integration;

use App\Repository\ObjetRepository;
use App\Repository\PretRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * §7 : la fixture charge un prêt en retard (Perceuse -> Tom, dateFinPrevue
 * dans le passé, jamais clôturé) et un prêt clôturé (Veste -> Lilou). On
 * vérifie que ces deux états arrivent intacts depuis la base, pas
 * seulement calculés côté front.
 */
final class PretRepositoryTest extends KernelTestCase
{
    public function testPretDeLaPerceuseEstActifEtEnRetard(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $perceuse = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Perceuse']);
        self::assertNotNull($perceuse);

        $pret = $container->get(PretRepository::class)->findOneBy(['objet' => $perceuse]);

        self::assertNotNull($pret);
        self::assertSame('Tom', $pret->getEmprunteurNom());
        self::assertTrue($pret->isActif());
        self::assertNotNull($pret->getDateFinPrevue());
        self::assertLessThan(new \DateTimeImmutable(), $pret->getDateFinPrevue());
    }

    public function testPretDeLaVesteEstClotureEtInactif(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $veste = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Veste en jean']);
        self::assertNotNull($veste);

        $pret = $container->get(PretRepository::class)->findOneBy(['objet' => $veste]);

        self::assertNotNull($pret);
        self::assertSame('Lilou', $pret->getEmprunteurNom());
        self::assertFalse($pret->isActif());
        self::assertNotNull($pret->getDateRetour());
    }
}
