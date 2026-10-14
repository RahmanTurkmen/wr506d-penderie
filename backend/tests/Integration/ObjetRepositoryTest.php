<?php

namespace App\Tests\Integration;

use App\Entity\Objet;
use App\Repository\ObjetRepository;
use App\Repository\ProfilRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Vérifie que l'inventaire chargé par les fixtures est bien relié à son
 * profil via Doctrine, avec les objets attendus (§3 : l'inventaire est la
 * fonctionnalité centrale de l'app).
 */
final class ObjetRepositoryTest extends KernelTestCase
{
    public function testObjetsDeCamilleSontTousRattachesAuBonProfil(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $camille = $container->get(ProfilRepository::class)->findOneBy(['nom' => 'Camille']);
        self::assertNotNull($camille);

        $objets = $container->get(ObjetRepository::class)->findBy(['profil' => $camille]);

        self::assertNotEmpty($objets);
        foreach ($objets as $objet) {
            self::assertInstanceOf(Objet::class, $objet);
            self::assertSame($camille, $objet->getProfil());
        }
    }

    public function testPerceuseMakitaExisteEtEstRangeeDansLEtabli(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $perceuse = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Perceuse Makita']);

        self::assertNotNull($perceuse);
        self::assertNotNull($perceuse->getConteneur());
        self::assertSame('Établi', $perceuse->getConteneur()->getNom());
        self::assertNull($perceuse->getPiece());
    }

    public function testVeloEnfantAUneValidationEnAttenteLiee(): void
    {
        // §7 invariant : un profil géré (Eva, enfant) qui met un objet en
        // vente ne le fait pas directement, ça crée une Validation en
        // attente que le compte principal doit approuver.
        self::bootKernel();
        $container = static::getContainer();

        $velo = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Vélo rose enfant']);
        self::assertNotNull($velo);

        $validation = $container->get(\App\Repository\ValidationRepository::class)
            ->findOneBy(['profil' => $velo->getProfil()]);

        self::assertNotNull($validation);
        self::assertSame(\App\Entity\Enum\ValidationStatut::EnAttente, $validation->getStatut());
        self::assertSame((string) $velo->getId(), $validation->getPayload()['objetId'] ?? null);
    }
}
