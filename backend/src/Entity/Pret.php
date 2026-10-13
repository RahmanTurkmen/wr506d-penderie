<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\PretRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Invariant (§7) : un seul Pret actif (dateRetour null) par Objet.
 * Vérifié en service (PretService) avant persistance, pas au niveau DB.
 */
#[ORM\Entity(repositoryClass: PretRepository::class)]
class Pret
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Objet::class, inversedBy: 'prets')]
    #[ORM\JoinColumn(nullable: false)]
    private Objet $objet;

    #[ORM\Column(length: 150)]
    private string $emprunteurNom;

    #[ORM\Column]
    private \DateTimeImmutable $dateDebut;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateFinPrevue = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dateRetour = null;

    public function __construct(Objet $objet, string $emprunteurNom)
    {
        $this->initializeId();
        $this->objet = $objet;
        $this->emprunteurNom = $emprunteurNom;
        $this->dateDebut = new \DateTimeImmutable();
    }

    public function getObjet(): Objet
    {
        return $this->objet;
    }

    public function getEmprunteurNom(): string
    {
        return $this->emprunteurNom;
    }

    public function getDateDebut(): \DateTimeImmutable
    {
        return $this->dateDebut;
    }

    public function getDateFinPrevue(): ?\DateTimeImmutable
    {
        return $this->dateFinPrevue;
    }

    public function setDateFinPrevue(?\DateTimeImmutable $dateFinPrevue): static
    {
        $this->dateFinPrevue = $dateFinPrevue;

        return $this;
    }

    public function getDateRetour(): ?\DateTimeImmutable
    {
        return $this->dateRetour;
    }

    public function isActif(): bool
    {
        return null === $this->dateRetour;
    }

    public function cloturer(): static
    {
        $this->dateRetour = new \DateTimeImmutable();

        return $this;
    }
}
