<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Categorie;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\TypeObjet;
use App\Entity\Logement;
use App\Entity\Objet;
use App\Entity\Piece;
use App\Entity\Profil;
use App\Entity\RefusTenue;
use App\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation as SymfonyValidation;

/**
 * Invariant (RefusTenue.php:44) : un refus cible exactement un Objet OU une
 * Categorie, jamais les deux. Même famille de règle que l'invariant
 * d'emplacement d'Objet (tests/Unit/Entity/ObjetTest.php) — même traitement :
 * le constructeur empêche déjà l'état invalide via le type-hint
 * Objet|Categorie, on vérifie en plus que la contrainte de validation le
 * détecterait si ce garde-fou était contourné.
 */
final class RefusTenueTest extends TestCase
{
    private Profil $profil;
    private Categorie $categorie;
    private Objet $objet;

    protected function setUp(): void
    {
        $user = new User('test@lumen.local');
        $this->profil = new Profil($user, 'Camille', ProfilType::Principal);
        $this->categorie = new Categorie('Outils');

        $logement = new Logement($this->profil, 'Maison');
        $piece = new Piece($logement, 'Salon');
        $this->objet = new Objet($this->profil, $this->categorie, 'Perceuse', TypeObjet::Autre, 'QR-1', $piece);
    }

    private function validate(RefusTenue $refus): int
    {
        $validator = SymfonyValidation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        return \count($validator->validate($refus));
    }

    public function testRefusCiblantUneCategorieEstValide(): void
    {
        $refus = new RefusTenue($this->profil, $this->categorie);

        self::assertSame($this->categorie, $refus->getCategorie());
        self::assertNull($refus->getObjet());
        self::assertSame(0, $this->validate($refus));
    }

    public function testRefusCiblantUnObjetEstValide(): void
    {
        $refus = new RefusTenue($this->profil, $this->objet);

        self::assertSame($this->objet, $refus->getObjet());
        self::assertNull($refus->getCategorie());
        self::assertSame(0, $this->validate($refus));
    }

    public function testRefusCiblantLesDeuxEstInvalide(): void
    {
        $refus = new RefusTenue($this->profil, $this->categorie);

        $reflection = new \ReflectionProperty(RefusTenue::class, 'objet');
        $reflection->setValue($refus, $this->objet);

        self::assertSame(1, $this->validate($refus));
    }
}
