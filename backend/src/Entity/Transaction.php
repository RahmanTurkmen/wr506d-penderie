<?php

namespace App\Entity;

use App\Entity\Enum\StatutTransaction;
use App\Entity\Trait\UuidIdTrait;
use App\Repository\TransactionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Invariant (§7) : une seule Transaction active par Objet ; l'acheteur est
 * toujours un utilisateur authentifié (jamais un accès par simple lien de partage).
 */
#[ORM\Entity(repositoryClass: TransactionRepository::class)]
class Transaction
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Objet::class, inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false)]
    private Objet $objet;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $acheteur;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $montant;

    #[ORM\Column(enumType: StatutTransaction::class)]
    private StatutTransaction $statut;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(Objet $objet, User $acheteur, string $montant)
    {
        $this->initializeId();
        $this->objet = $objet;
        $this->acheteur = $acheteur;
        $this->montant = $montant;
        $this->statut = StatutTransaction::EnCours;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getObjet(): Objet
    {
        return $this->objet;
    }

    public function getAcheteur(): User
    {
        return $this->acheteur;
    }

    public function getMontant(): string
    {
        return $this->montant;
    }

    public function getStatut(): StatutTransaction
    {
        return $this->statut;
    }

    public function setStatut(StatutTransaction $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
