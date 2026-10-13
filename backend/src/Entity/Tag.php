<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\TagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TagRepository::class)]
class Tag
{
    use UuidIdTrait;

    #[ORM\Column(length: 50, unique: true)]
    private string $nom;

    /** @var Collection<int, Objet> */
    #[ORM\ManyToMany(targetEntity: Objet::class, mappedBy: 'tags')]
    private Collection $objets;

    public function __construct(string $nom)
    {
        $this->initializeId();
        $this->nom = $nom;
        $this->objets = new ArrayCollection();
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
