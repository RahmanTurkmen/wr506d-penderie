<?php

namespace App\Tests\Integration;

use App\Repository\CategorieRepository;
use App\Repository\ProfilRepository;
use App\Repository\RefusTenueRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Un RefusTenue cible une Categorie entière OU un Objet précis (jamais les
 * deux) dans l'outfit builder. La fixture couvre le cas "catégorie entière".
 */
final class RefusTenueRepositoryTest extends KernelTestCase
{
    public function testRefusDeCamilleCibleLaCategorieOutils(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        $outils = $container->get(CategorieRepository::class)->findOneBy(['nom' => 'Outils']);
        self::assertNotNull($camille);
        self::assertNotNull($outils);

        $refus = $container->get(RefusTenueRepository::class)->findOneBy(['profil' => $camille]);

        self::assertNotNull($refus);
        self::assertSame($outils, $refus->getCategorie());
        self::assertNull($refus->getObjet());
    }
}
