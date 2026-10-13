<?php

namespace App\Entity;

use App\Entity\Trait\UuidIdTrait;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use UuidIdTrait;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\Column]
    private string $password;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Profil> */
    #[ORM\OneToMany(targetEntity: Profil::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $profils;

    public function __construct(string $email)
    {
        $this->initializeId();
        $this->email = $email;
        $this->createdAt = new \DateTimeImmutable();
        $this->profils = new ArrayCollection();
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function eraseCredentials(): void
    {
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return Collection<int, Profil> */
    public function getProfils(): Collection
    {
        return $this->profils;
    }
}
