<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Enum\ProfilType;
use App\Entity\Partage;
use App\Entity\Profil;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * §8 : un Partage (lien public vers le dressing) doit pouvoir être révoqué
 * — une fois révoqué, le lien ne doit plus permettre l'accès (vérifié côté
 * contrôleur via isRevoque(), donc cette règle doit être fiable).
 */
final class PartageTest extends TestCase
{
    private function makePartage(): Partage
    {
        $user = new User('test@lumen.local');
        $profil = new Profil($user, 'Camille', ProfilType::Principal);

        return new Partage($profil);
    }

    public function testNEstPasRevoqueParDefaut(): void
    {
        $partage = $this->makePartage();

        self::assertFalse($partage->isRevoque());
    }

    public function testRevoquerLeRendIrrevocablementRevoque(): void
    {
        $partage = $this->makePartage();

        $partage->revoquer();

        self::assertTrue($partage->isRevoque());
    }

    public function testAUnTokenUniqueALaCreation(): void
    {
        $partage1 = $this->makePartage();
        $partage2 = $this->makePartage();

        self::assertNotSame((string) $partage1->getToken(), (string) $partage2->getToken());
    }
}
