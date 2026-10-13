<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\ValiseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Bonus (§9, initialement hors V1) : liste d'objets préparés pour un voyage.
 */
#[ORM\Entity(repositoryClass: ValiseRepository::class)]
class Valise
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'valises')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\Column(length: 150)]
    private string $nom;

    /** @var Collection<int, Objet> */
    #[ORM\ManyToMany(targetEntity: Objet::class)]
    #[ORM\JoinTable(name: 'valise_objet')]
    private Collection $objets;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(Profil $profil, string $nom)
    {
        $this->initializeId();
        $this->profil = $profil;
        $this->nom = $nom;
        $this->objets = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
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

    /** @return Collection<int, Objet> */
    public function getObjets(): Collection
    {
        return $this->objets;
    }

    public function addObjet(Objet $objet): static
    {
        if (!$this->objets->contains($objet)) {
            $this->objets->add($objet);
        }

        return $this;
    }

    public function removeObjet(Objet $objet): static
    {
        $this->objets->removeElement($objet);

        return $this;
    }
}
