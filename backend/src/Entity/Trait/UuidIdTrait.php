<?php

namespace App\Entity\Trait;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

trait UuidIdTrait
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    public function getId(): Uuid
    {
        return $this->id;
    }

    private function initializeId(): void
    {
        $this->id = Uuid::v7();
    }
}
