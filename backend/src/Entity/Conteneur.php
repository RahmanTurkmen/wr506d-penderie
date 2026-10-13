<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\ConteneurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConteneurRepository::class)]
class Conteneur
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Piece::class, inversedBy: 'conteneurs')]
    #[ORM\JoinColumn(nullable: false)]
    private Piece $piece;

    #[ORM\Column(length: 100)]
    private string $nom;

    /** @var Collection<int, Objet> */
    #[ORM\OneToMany(targetEntity: Objet::class, mappedBy: 'conteneur')]
    private Collection $objets;

    public function __construct(Piece $piece, string $nom)
    {
        $this->initializeId();
        $this->piece = $piece;
        $this->nom = $nom;
        $this->objets = new ArrayCollection();
    }

    public function getPiece(): Piece
    {
        return $this->piece;
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

    /** @return Collection<int, Objet> */
    public function getObjets(): Collection
    {
        return $this->objets;
    }
}
