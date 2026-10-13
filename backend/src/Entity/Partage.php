<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\PartageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PartageRepository::class)]
class Partage
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class, inversedBy: 'partages')]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $token;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $revokedAt = null;

    /** @var Collection<int, Commentaire> */
    #[ORM\OneToMany(targetEntity: Commentaire::class, mappedBy: 'partage', orphanRemoval: true)]
    private Collection $commentaires;

    public function __construct(Profil $profil)
    {
        $this->initializeId();
        $this->profil = $profil;
        $this->token = Uuid::v4();
        $this->createdAt = new \DateTimeImmutable();
        $this->commentaires = new ArrayCollection();
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getToken(): Uuid
    {
        return $this->token;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function isRevoque(): bool
    {
        return null !== $this->revokedAt;
    }

    public function revoquer(): static
    {
        $this->revokedAt = new \DateTimeImmutable();

        return $this;
    }

    /** @return Collection<int, Commentaire> */
    public function getCommentaires(): Collection
    {
        return $this->commentaires;
    }
}
