<?php

namespace App\Tests\Integration;

use App\Repository\PartageRepository;
use App\Repository\ProfilRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * §8 : un Partage donne un lien public (token) vers le dressing d'un profil,
 * avec des commentaires. On vérifie que le token et les commentaires liés
 * survivent à Doctrine, et qu'un partage neuf n'est pas révoqué.
 */
final class PartageRepositoryTest extends KernelTestCase
{
    public function testPartageDeCamilleAUnTokenEtNEstPasRevoque(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        self::assertNotNull($camille);

        $partage = $container->get(PartageRepository::class)->findOneBy(['profil' => $camille]);

        self::assertNotNull($partage);
        self::assertNotEmpty((string) $partage->getToken());
        self::assertFalse($partage->isRevoque());
    }

    public function testPartageALeCommentaireDeLilou(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        $partage = $container->get(PartageRepository::class)->findOneBy(['profil' => $camille]);
        self::assertNotNull($partage);

        $commentaires = $partage->getCommentaires();

        self::assertCount(1, $commentaires);
        self::assertSame('Beau dressing !', $commentaires->first()->getContenu());
        self::assertSame('lilou@lumen.local', $commentaires->first()->getAuteur()->getEmail());
    }
}
