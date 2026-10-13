<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\RefusTenueRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Refus d'un Profil de porter un Objet précis OU toute une Categorie
 * dans l'outfit builder (jamais les deux à la fois).
 */
#[ORM\Entity(repositoryClass: RefusTenueRepository::class)]
#[Assert\Callback('validateCible')]
class RefusTenue
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'refusTenues')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\ManyToOne(targetEntity: Objet::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Objet $objet = null;

    #[ORM\ManyToOne(targetEntity: Categorie::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Categorie $categorie = null;

    public function __construct(Profil $profil, Objet|Categorie $cible)
    {
        $this->initializeId();
        $this->profil = $profil;

        if ($cible instanceof Objet) {
            $this->objet = $cible;
        } else {
            $this->categorie = $cible;
        }
    }

    public function validateCible(ExecutionContextInterface $context): void
    {
        $count = ($this->objet !== null ? 1 : 0) + ($this->categorie !== null ? 1 : 0);

        if (1 !== $count) {
            $context->buildViolation('Un refus cible exactement un Objet OU une Categorie, jamais les deux.')
                ->atPath('objet')
                ->addViolation();
        }
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getObjet(): ?Objet
    {
        return $this->objet;
    }

    public function getCategorie(): ?Categorie
    {
        return $this->categorie;
    }
}
