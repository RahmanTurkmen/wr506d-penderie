<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Categorie;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\TypeObjet;
use App\Entity\Logement;
use App\Entity\Objet;
use App\Entity\Piece;
use App\Entity\Pret;
use App\Entity\Profil;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * Règle métier (§7, Pret.php) : un prêt est actif tant qu'il n'a pas de date
 * de retour ; cloturer() doit le faire basculer définitivement en inactif.
 */
final class PretTest extends TestCase
{
    private function makeObjet(): Objet
    {
        $user = new User('test@lumen.local');
        $profil = new Profil($user, 'Camille', ProfilType::Principal);
        $logement = new Logement($profil, 'Maison');
        $piece = new Piece($logement, 'Salon');
        $categorie = new Categorie('Outils');

        return new Objet($profil, $categorie, 'Perceuse', TypeObjet::Autre, 'QR-1', $piece);
    }

    public function testPretEstActifALaCreation(): void
    {
        $pret = new Pret($this->makeObjet(), 'Tom');

        self::assertTrue($pret->isActif());
        self::assertNull($pret->getDateRetour());
    }

    public function testCloturerRendLePretInactif(): void
    {
        $pret = new Pret($this->makeObjet(), 'Tom');

        $pret->cloturer();

        self::assertFalse($pret->isActif());
        self::assertNotNull($pret->getDateRetour());
    }

    public function testCloturerEstIdempotentSurLaDate(): void
    {
        // cloturer() peut être rappelé (ex. double-clic) : le prêt doit
        // rester inactif, sans lever d'erreur.
        $pret = new Pret($this->makeObjet(), 'Tom');

        $pret->cloturer();
        $premiereDate = $pret->getDateRetour();
        $pret->cloturer();

        self::assertFalse($pret->isActif());
        self::assertNotNull($pret->getDateRetour());
        self::assertGreaterThanOrEqual($premiereDate, $pret->getDateRetour());
    }
}
