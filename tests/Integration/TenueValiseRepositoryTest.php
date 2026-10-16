<?php

namespace App\Tests\Integration;

use App\Repository\ProfilRepository;
use App\Repository\TenueRepository;
use App\Repository\ValiseRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Tenue (outfit du jour) et Valise (bonus §9) sont toutes deux des listes
 * d'objets rattachées à un profil. On vérifie que la relation many-to-many
 * vers Objet est bien peuplée après un aller-retour Doctrine.
 */
final class TenueValiseRepositoryTest extends KernelTestCase
{
    public function testTenueDuJourContientLaVeste(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        $tenue = $container->get(TenueRepository::class)->findOneBy(['profil' => $camille]);

        self::assertNotNull($tenue);
        self::assertSame('Tenue du jour', $tenue->getNom());
        self::assertCount(1, $tenue->getObjets());
        self::assertSame('Veste en jean', $tenue->getObjets()->first()->getNom());
    }

    public function testValiseWeekendContientLaVeste(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        $valise = $container->get(ValiseRepository::class)->findOneBy(['profil' => $camille]);

        self::assertNotNull($valise);
        self::assertSame('Weekend', $valise->getNom());
        self::assertCount(1, $valise->getObjets());
        self::assertSame('Veste en jean', $valise->getObjets()->first()->getNom());
    }
}
