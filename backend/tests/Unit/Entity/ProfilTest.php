<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Enum\ProfilType;
use App\Entity\Profil;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * Profil::$estMineur conditionne deux règles métier ailleurs (§7 : un profil
 * mineur ne vend/partage jamais directement, passe par une Validation ; §8 :
 * le prix d'une vente lui est caché). Elle doit donc être false par défaut
 * (un profil "principal" n'est jamais mineur) et modifiable explicitement.
 */
final class ProfilTest extends TestCase
{
    public function testNEstPasMineurParDefaut(): void
    {
        $user = new User('test@lumen.local');
        $profil = new Profil($user, 'Camille', ProfilType::Principal);

        self::assertFalse($profil->isEstMineur());
    }

    public function testPeutEtreMarqueMineur(): void
    {
        $user = new User('test@lumen.local');
        $profil = new Profil($user, 'Eva', ProfilType::Gere);

        $profil->setEstMineur(true);

        self::assertTrue($profil->isEstMineur());
    }
}
