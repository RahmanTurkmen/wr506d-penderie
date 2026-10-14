<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Categorie;
use App\Entity\Conteneur;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\TypeObjet;
use App\Entity\Logement;
use App\Entity\Objet;
use App\Entity\Piece;
use App\Entity\Profil;
use App\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation as SymfonyValidation;

/**
 * Invariant métier central (§3, Objet.php:101) : un objet est rattaché à
 * exactement une Piece OU un Conteneur, jamais les deux, jamais aucun.
 * C'est la règle la plus sensible du modèle de données (elle conditionne
 * tout le rangement/l'inventaire) : on la couvre dans les trois sens
 * (valide / les deux / aucun) plutôt que de se fier uniquement au type-hint
 * du constructeur.
 */
final class ObjetTest extends TestCase
{
    private Profil $profil;
    private Piece $piece;
    private Conteneur $conteneur;
    private Categorie $categorie;

    protected function setUp(): void
    {
        $user = new User('test@lumen.local');
        $this->profil = new Profil($user, 'Camille', ProfilType::Principal);
        $logement = new Logement($this->profil, 'Maison');
        $this->piece = new Piece($logement, 'Salon');
        $this->conteneur = new Conteneur($this->piece, 'Armoire');
        $this->categorie = new Categorie('Vêtements');
    }

    private function validate(Objet $objet): int
    {
        $validator = SymfonyValidation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();

        return \count($validator->validate($objet));
    }

    public function testObjetRattacheAUnePieceEstValide(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-1', $this->piece);

        self::assertSame($this->piece, $objet->getPiece());
        self::assertNull($objet->getConteneur());
        self::assertSame(0, $this->validate($objet));
    }

    public function testObjetRattacheAUnConteneurEstValide(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-2', $this->conteneur);

        self::assertSame($this->conteneur, $objet->getConteneur());
        self::assertNull($objet->getPiece());
        self::assertSame(0, $this->validate($objet));
    }

    public function testDeplacerVersPieceLibereLeConteneur(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-3', $this->conteneur);

        $objet->deplacerVersPiece($this->piece);

        self::assertSame($this->piece, $objet->getPiece());
        self::assertNull($objet->getConteneur());
        self::assertSame(0, $this->validate($objet));
    }

    public function testDeplacerVersConteneurLibereLaPiece(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-4', $this->piece);

        $objet->deplacerVersConteneur($this->conteneur);

        self::assertSame($this->conteneur, $objet->getConteneur());
        self::assertNull($objet->getPiece());
        self::assertSame(0, $this->validate($objet));
    }

    public function testStatutParDefautEstDisponible(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-5', $this->piece);

        self::assertSame(StatutObjet::Disponible, $objet->getStatut());
    }

    /**
     * Le constructeur et deplacerVers*() empêchent déjà d'obtenir un état
     * invalide via l'API publique (union type Piece|Conteneur). On force
     * l'état invalide par réflexion pour vérifier que la contrainte
     * #[Assert\Callback('validateEmplacement')] la détecterait quand même
     * si jamais ce garde-fou venait à être contourné (ex. hydratation
     * Doctrine partielle, bug futur).
     */
    public function testEmplacementAvecLesDeuxEstInvalide(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-6', $this->piece);

        $reflection = new \ReflectionProperty(Objet::class, 'conteneur');
        $reflection->setValue($objet, $this->conteneur);

        self::assertSame(1, $this->validate($objet));
    }

    public function testEmplacementSansAucunEstInvalide(): void
    {
        $objet = new Objet($this->profil, $this->categorie, 'Veste', TypeObjet::Vetement, 'QR-7', $this->piece);

        $reflection = new \ReflectionProperty(Objet::class, 'piece');
        $reflection->setValue($objet, null);

        self::assertSame(1, $this->validate($objet));
    }
}
