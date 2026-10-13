<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\BlocageRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * §8 : une personne bloquée n'a plus aucun accès, même avec un lien de
 * partage valide — à vérifier en priorité sur toute résolution d'accès,
 * avant même de regarder le token du Partage.
 */
#[ORM\Entity(repositoryClass: BlocageRepository::class)]
#[ORM\UniqueConstraint(name: 'profil_user_unique', columns: ['profil_id', 'user_id'])]
class Blocage
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(Profil $profil, User $user)
    {
        $this->initializeId();
        $this->profil = $profil;
        $this->user = $user;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
