<?php

namespace App\Entity;

use App\Entity\Enum\ProfilType;
use App\Entity\Trait\UuidIdTrait;
use App\Repository\ProfilRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfilRepository::class)]
class Profil
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'profils')]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;

    #[ORM\Column(length: 100)]
    private string $nom;

    #[ORM\Column(enumType: ProfilType::class)]
    private ProfilType $type;

    /**
     * Sous-compte enfant (toujours false pour un profil "principal"). Sert à
     * restreindre l'affichage (ex. prix caché sur les ventes, §8) en plus de
     * la règle de validation qui s'applique à tout profil "gere".
     */
    #[ORM\Column]
    private bool $estMineur = false;

    /** @var Collection<int, Logement> */
    #[ORM\OneToMany(targetEntity: Logement::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $logements;

    /** @var Collection<int, Objet> */
    #[ORM\OneToMany(targetEntity: Objet::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $objets;

    /** @var Collection<int, Partage> */
    #[ORM\OneToMany(targetEntity: Partage::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $partages;

    /** @var Collection<int, Tenue> */
    #[ORM\OneToMany(targetEntity: Tenue::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $tenues;

    /** @var Collection<int, RefusTenue> */
    #[ORM\OneToMany(targetEntity: RefusTenue::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $refusTenues;

    /** @var Collection<int, Valise> */
    #[ORM\OneToMany(targetEntity: Valise::class, mappedBy: 'profil', orphanRemoval: true)]
    private Collection $valises;

    public function __construct(User $user, string $nom, ProfilType $type)
    {
        $this->initializeId();
        $this->user = $user;
        $this->nom = $nom;
        $this->type = $type;
        $this->logements = new ArrayCollection();
        $this->objets = new ArrayCollection();
        $this->partages = new ArrayCollection();
        $this->tenues = new ArrayCollection();
        $this->refusTenues = new ArrayCollection();
        $this->valises = new ArrayCollection();
    }

    public function getUser(): User
    {
        return $this->user;
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

    public function getType(): ProfilType
    {
        return $this->type;
    }

    public function setType(ProfilType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function isEstMineur(): bool
    {
        return $this->estMineur;
    }

    public function setEstMineur(bool $estMineur): static
    {
        $this->estMineur = $estMineur;

        return $this;
    }

    /** @return Collection<int, Logement> */
    public function getLogements(): Collection
    {
        return $this->logements;
    }

    /** @return Collection<int, Objet> */
    public function getObjets(): Collection
    {
        return $this->objets;
    }

    /** @return Collection<int, Partage> */
    public function getPartages(): Collection
    {
        return $this->partages;
    }

    /** @return Collection<int, Tenue> */
    public function getTenues(): Collection
    {
        return $this->tenues;
    }

    /** @return Collection<int, RefusTenue> */
    public function getRefusTenues(): Collection
    {
        return $this->refusTenues;
    }

    /** @return Collection<int, Valise> */
    public function getValises(): Collection
    {
        return $this->valises;
    }
}
