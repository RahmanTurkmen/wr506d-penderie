<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\PieceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PieceRepository::class)]
class Piece
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Logement::class, inversedBy: 'pieces')]
    #[ORM\JoinColumn(nullable: false)]
    private Logement $logement;

    #[ORM\Column(length: 100)]
    private string $nom;

    /** @var Collection<int, Conteneur> */
    #[ORM\OneToMany(targetEntity: Conteneur::class, mappedBy: 'piece', orphanRemoval: true)]
    private Collection $conteneurs;

    // Côté inverse de la relation Objet::$piece, nécessaire pour que Doctrine
    // gère correctement le cascade/orphanRemoval, mais jamais lu côté appli
    // (le front dérive "objets par pièce" depuis la liste plate /api/objets).
    /** @var Collection<int, Objet> */
    #[ORM\OneToMany(targetEntity: Objet::class, mappedBy: 'piece')]
    // @phpstan-ignore-next-line property.onlyWritten
    private Collection $objets;

    public function __construct(Logement $logement, string $nom)
    {
        $this->initializeId();
        $this->logement = $logement;
        $this->nom = $nom;
        $this->conteneurs = new ArrayCollection();
        $this->objets = new ArrayCollection();
    }

    public function getLogement(): Logement
    {
        return $this->logement;
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

    /** @return Collection<int, Conteneur> */
    public function getConteneurs(): Collection
    {
        return $this->conteneurs;
    }
}
