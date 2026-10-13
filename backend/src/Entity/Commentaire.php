<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\CommentaireRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Un commentaire nécessite un compte authentifié (§8 : la lecture seule par
 * lien ne permet pas de commenter, seule une "personne autorisée" le peut).
 */
#[ORM\Entity(repositoryClass: CommentaireRepository::class)]
class Commentaire
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Partage::class, inversedBy: 'commentaires')]
    #[ORM\JoinColumn(nullable: false)]
    private Partage $partage;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $auteur;

    #[ORM\Column(type: 'text')]
    private string $contenu;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(Partage $partage, User $auteur, string $contenu)
    {
        $this->initializeId();
        $this->partage = $partage;
        $this->auteur = $auteur;
        $this->contenu = $contenu;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getPartage(): Partage
    {
        return $this->partage;
    }

    public function getAuteur(): User
    {
        return $this->auteur;
    }

    public function getContenu(): string
    {
        return $this->contenu;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
