<?php

namespace App\DataFixtures;

use App\Entity\Blocage;
use App\Entity\Categorie;
use App\Entity\Commentaire;
use App\Entity\Conteneur;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\TypeObjet;
use App\Entity\Enum\ValidationType;
use App\Entity\Logement;
use App\Entity\Objet;
use App\Entity\Partage;
use App\Entity\Piece;
use App\Entity\Pret;
use App\Entity\Profil;
use App\Entity\RefusTenue;
use App\Entity\Tag;
use App\Entity\Tenue;
use App\Entity\Transaction;
use App\Entity\User;
use App\Entity\Validation;
use App\Entity\Valise;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Fixtures dédiées à la campagne de test (séance 16-21) — distinctes de
 * AppFixtures (données de démo/dev). Minimales mais couvrent un cas de
 * chaque entité métier, pour que les tests d'intégration et fonctionnels
 * aient un jeu de données prévisible à interroger. Chargées uniquement via
 * `doctrine:fixtures:load --group=test` (jamais en dev), cf. `make test-db-fixtures`.
 */
class TestFixtures extends Fixture implements FixtureGroupInterface
{
    public function __construct(private readonly UserPasswordHasherInterface $passwordHasher)
    {
    }

    public static function getGroups(): array
    {
        return ['test'];
    }

    public function load(ObjectManager $manager): void
    {
        $camilleUser = $this->createUser($manager, 'test@lumen.local', 'password123');
        $lilouUser = $this->createUser($manager, 'lilou@lumen.local', 'password123');

        $camille = new Profil($camilleUser, 'Camille', ProfilType::Principal);
        $eva = new Profil($camilleUser, 'Eva', ProfilType::Gere);
        $eva->setEstMineur(true);
        $manager->persist($camille);
        $manager->persist($eva);

        $vetements = new Categorie('Vêtements');
        $outils = new Categorie('Outils');
        $jouets = new Categorie('Jouets');
        $manager->persist($vetements);
        $manager->persist($outils);
        $manager->persist($jouets);

        $maison = new Logement($camille, 'Maison');
        $manager->persist($maison);
        $salon = new Piece($maison, 'Salon');
        $manager->persist($salon);
        $armoire = new Conteneur($salon, 'Armoire');
        $manager->persist($armoire);

        $chambreEva = new Logement($eva, "Chambre d'Eva");
        $manager->persist($chambreEva);
        $pieceEva = new Piece($chambreEva, 'Chambre');
        $manager->persist($pieceEva);

        $veste = new Objet($camille, $vetements, 'Veste en jean', TypeObjet::Vetement, 'QR-TEST-1', $salon);
        $manager->persist($veste);

        $perceuse = new Objet($camille, $outils, 'Perceuse', TypeObjet::Autre, 'QR-TEST-2', $armoire);
        $perceuse->setStatut(StatutObjet::Prete);
        $manager->persist($perceuse);

        $plaid = new Objet($camille, $vetements, 'Plaid', TypeObjet::Autre, 'QR-TEST-3', $salon);
        $plaid->setStatut(StatutObjet::EnVente);
        $manager->persist($plaid);

        $velo = new Objet($eva, $jouets, 'Vélo enfant', TypeObjet::Autre, 'QR-TEST-4', $pieceEva);
        $manager->persist($velo);

        $hiver = new Tag('Hiver');
        $manager->persist($hiver);
        $veste->addTag($hiver);

        // Prêt actif et en retard, sur la perceuse (comme sur le Figma).
        $pretPerceuse = new Pret($perceuse, 'Tom');
        $pretPerceuse->setDateFinPrevue(new \DateTimeImmutable('-4 days'));
        $manager->persist($pretPerceuse);

        // Prêt clôturé, sur un autre objet, pour couvrir le cas "inactif".
        $pretVeste = new Pret($veste, 'Lilou');
        $pretVeste->cloturer();
        $manager->persist($pretVeste);

        // Validation en attente : Eva (profil géré/mineur) met son vélo en vente.
        $validation = new Validation($eva, ValidationType::ObjetEnVente, ['objetId' => (string) $velo->getId()]);
        $manager->persist($validation);

        // Partage + commentaire.
        $partage = new Partage($camille);
        $manager->persist($partage);
        $commentaire = new Commentaire($partage, $lilouUser, 'Beau dressing !');
        $manager->persist($commentaire);

        // Refus de porter une catégorie entière.
        $refus = new RefusTenue($camille, $outils);
        $manager->persist($refus);

        // Blocage : Camille bloque Lilou.
        $blocage = new Blocage($camille, $lilouUser);
        $manager->persist($blocage);

        // Transaction : Lilou achète le plaid mis en vente.
        $transaction = new Transaction($plaid, $lilouUser, '10.00');
        $manager->persist($transaction);

        // Tenue.
        $tenue = new Tenue($camille, 'Tenue du jour');
        $tenue->addObjet($veste);
        $manager->persist($tenue);

        // Valise.
        $valise = new Valise($camille, 'Weekend');
        $valise->addObjet($veste);
        $manager->persist($valise);

        $manager->flush();
    }

    private function createUser(ObjectManager $manager, string $email, string $plainPassword): User
    {
        $user = new User($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));
        $manager->persist($user);

        return $user;
    }
}
