<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\LogementRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LogementRepository::class)]
class Logement
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'logements')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\Column(length: 100)]
    private string $nom;

    /** @var Collection<int, Piece> */
    #[ORM\OneToMany(targetEntity: Piece::class, mappedBy: 'logement', orphanRemoval: true)]
    private Collection $pieces;

    public function __construct(Profil $profil, string $nom)
    {
        $this->initializeId();
        $this->profil = $profil;
        $this->nom = $nom;
        $this->pieces = new ArrayCollection();
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    /** @return Collection<int, Piece> */
    public function getPieces(): Collection
    {
        return $this->pieces;
    }
}
