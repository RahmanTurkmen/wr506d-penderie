<?php

namespace App\Entity;

use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\TypeObjet;
use App\Entity\Trait\UuidIdTrait;
use App\Repository\ObjetRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ObjetRepository::class)]
#[Assert\Callback('validateEmplacement')]
class Objet
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'objets')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\ManyToOne(targetEntity: Categorie::class, inversedBy: 'objets')]
    #[ORM\JoinColumn(nullable: false)]
    private Categorie $categorie;

    #[ORM\ManyToOne(targetEntity: Piece::class, inversedBy: 'objets')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Piece $piece = null;

    #[ORM\ManyToOne(targetEntity: Conteneur::class, inversedBy: 'objets')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Conteneur $conteneur = null;

    #[ORM\Column(length: 150)]
    private string $nom;

    #[ORM\Column(enumType: TypeObjet::class)]
    private TypeObjet $type;

    #[ORM\Column(enumType: StatutObjet::class)]
    private StatutObjet $statut;

    #[ORM\Column(length: 100, unique: true)]
    private string $qrCodeInterne;

    /** @var Collection<int, Tag> */
    #[ORM\ManyToMany(targetEntity: Tag::class, inversedBy: 'objets')]
    #[ORM\JoinTable(name: 'objet_tag')]
    private Collection $tags;

    /** @var Collection<int, Pret> */
    #[ORM\OneToMany(targetEntity: Pret::class, mappedBy: 'objet', orphanRemoval: true)]
    private Collection $prets;

    /** @var Collection<int, Transaction> */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'objet', orphanRemoval: true)]
    private Collection $transactions;

    public function __construct(
        Profil $profil,
        Categorie $categorie,
        string $nom,
        TypeObjet $type,
        string $qrCodeInterne,
        Piece|Conteneur $emplacement,
    ) {
        $this->initializeId();
        $this->profil = $profil;
        $this->categorie = $categorie;
        $this->nom = $nom;
        $this->type = $type;
        $this->qrCodeInterne = $qrCodeInterne;
        $this->statut = StatutObjet::Disponible;
        $this->tags = new ArrayCollection();
        $this->prets = new ArrayCollection();
        $this->transactions = new ArrayCollection();

        if ($emplacement instanceof Piece) {
            $this->piece = $emplacement;
        } else {
            $this->conteneur = $emplacement;
        }
    }

    /**
     * Invariant : un objet est rattaché à une Piece OU un Conteneur, jamais les deux, jamais aucun.
     */
    public function validateEmplacement(ExecutionContextInterface $context): void
    {
        $count = ($this->piece !== null ? 1 : 0) + ($this->conteneur !== null ? 1 : 0);

        if (1 !== $count) {
            $context->buildViolation('Un objet doit être rattaché à exactement une Piece OU un Conteneur, jamais les deux.')
                ->atPath('piece')
                ->addViolation();
        }
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getCategorie(): Categorie
    {
        return $this->categorie;
    }

    public function setCategorie(Categorie $categorie): static
    {
        $this->categorie = $categorie;

        return $this;
    }

    public function getPiece(): ?Piece
    {
        return $this->piece;
    }

    public function getConteneur(): ?Conteneur
    {
        return $this->conteneur;
    }

    public function deplacerVersPiece(Piece $piece): static
    {
        $this->piece = $piece;
        $this->conteneur = null;

        return $this;
    }

    public function deplacerVersConteneur(Conteneur $conteneur): static
    {
        $this->conteneur = $conteneur;
        $this->piece = null;

        return $this;
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

    public function getType(): TypeObjet
    {
        return $this->type;
    }

    public function setType(TypeObjet $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getStatut(): StatutObjet
    {
        return $this->statut;
    }

    public function setStatut(StatutObjet $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getQrCodeInterne(): string
    {
        return $this->qrCodeInterne;
    }

    /** @return Collection<int, Tag> */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(Tag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }

        return $this;
    }

    public function removeTag(Tag $tag): static
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    /** @return Collection<int, Pret> */
    public function getPrets(): Collection
    {
        return $this->prets;
    }

    /** @return Collection<int, Transaction> */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }
}
