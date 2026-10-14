<?php

namespace App\Entity;

use App\Entity\Enum\ValidationStatut;
use App\Entity\Enum\ValidationType;
use App\Entity\Trait\UuidIdTrait;
use App\Repository\ValidationRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * §7 invariant : "profil géré n'initie pas partage/vente sans validation du
 * compte principal". Une action soumise (créer un Partage, passer un Objet
 * en vente) crée une Validation en attente au lieu de s'exécuter tout de
 * suite ; le compte principal (même User, profil "principal") l'approuve ou
 * la refuse, ce qui déclenche (ou non) l'action réelle.
 */
#[ORM\Entity(repositoryClass: ValidationRepository::class)]
class Validation
{
    use UuidIdTrait;

    #[ORM\ManyToOne(targetEntity: Profil::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Profil $profil;

    #[ORM\Column(enumType: ValidationType::class)]
    private ValidationType $type;

    /** JSON libre : ex. {"objetId": "..."} pour objet_en_vente. */
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $payload;

    #[ORM\Column(enumType: ValidationStatut::class)]
    private ValidationStatut $statut;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $decidedAt = null;

    /** @param array<string, mixed>|null $payload */
    public function __construct(Profil $profil, ValidationType $type, ?array $payload = null)
    {
        $this->initializeId();
        $this->profil = $profil;
        $this->type = $type;
        $this->payload = null !== $payload ? (json_encode($payload) ?: null) : null;
        $this->statut = ValidationStatut::EnAttente;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getProfil(): Profil
    {
        return $this->profil;
    }

    public function getType(): ValidationType
    {
        return $this->type;
    }

    /** @return array<string, mixed> */
    public function getPayload(): array
    {
        return null !== $this->payload ? json_decode($this->payload, true) : [];
    }

    public function getStatut(): ValidationStatut
    {
        return $this->statut;
    }

    public function decider(ValidationStatut $statut): static
    {
        $this->statut = $statut;
        $this->decidedAt = new \DateTimeImmutable();

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getDecidedAt(): ?\DateTimeImmutable
    {
        return $this->decidedAt;
    }
}
