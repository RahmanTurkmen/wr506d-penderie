<?php

namespace App\Tests\Integration;

use App\Repository\ObjetRepository;
use App\Repository\PretRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * §7 : la fixture charge un prêt en retard (Perceuse Makita -> Tom,
 * dateFinPrevue dans le passé, jamais clôturé). On vérifie que cette donnée
 * "en retard" arrive bien intacte depuis la base, pas seulement calculée
 * côté front.
 */
final class PretRepositoryTest extends KernelTestCase
{
    public function testPretDeLaPerceuseEstActifEtEnRetard(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $perceuse = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Perceuse Makita']);
        self::assertNotNull($perceuse);

        $pret = $container->get(PretRepository::class)->findOneBy(['objet' => $perceuse]);

        self::assertNotNull($pret);
        self::assertSame('Tom', $pret->getEmprunteurNom());
        self::assertTrue($pret->isActif());
        self::assertNotNull($pret->getDateFinPrevue());
        self::assertLessThan(new \DateTimeImmutable(), $pret->getDateFinPrevue());
    }
}
