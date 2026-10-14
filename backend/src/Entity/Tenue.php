<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\TenueRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TenueRepository::class)]
class Tenue
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'tenues')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\Column(length: 150)]
    private string $nom;

    /** @var Collection<int, Objet> */
    #[ORM\ManyToMany(targetEntity: Objet::class)]
    #[ORM\JoinTable(name: 'tenue_objet')]
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

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
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
