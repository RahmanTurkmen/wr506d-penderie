<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Enum\ProfilType;
use App\Entity\Enum\ValidationType;
use App\Entity\Profil;
use App\Entity\User;
use App\Entity\Validation;
use PHPUnit\Framework\TestCase;

/**
 * Validation::$payload est stocké en JSON en base (string|null) mais exposé
 * en tableau via getPayload() (§5). On vérifie l'aller-retour encode/decode
 * et les cas limites (payload absent) corrigés lors du passage PHPStan
 * niveau 6 (json_encode() peut renvoyer false).
 */
final class ValidationTest extends TestCase
{
    private function makeProfil(): Profil
    {
        $user = new User('eva@lumen.local');

        return new Profil($user, 'Eva', ProfilType::Gere);
    }

    public function testPayloadNullParDefaut(): void
    {
        $validation = new Validation($this->makeProfil(), ValidationType::ObjetEnVente);

        self::assertSame([], $validation->getPayload());
    }

    public function testPayloadFaitUnAllerRetourFidele(): void
    {
        $payload = ['objetId' => 'abc-123', 'prix' => 10.5];

        $validation = new Validation($this->makeProfil(), ValidationType::ObjetEnVente, $payload);

        self::assertSame($payload, $validation->getPayload());
    }

    public function testPayloadVideEstTraiteCommeAbsent(): void
    {
        $validation = new Validation($this->makeProfil(), ValidationType::Partage, []);

        self::assertSame([], $validation->getPayload());
    }

    public function testStatutEtDecisionParDefaut(): void
    {
        $validation = new Validation($this->makeProfil(), ValidationType::Partage);

        self::assertSame(\App\Entity\Enum\ValidationStatut::EnAttente, $validation->getStatut());
        self::assertNull($validation->getDecidedAt());
    }

    public function testDeciderMetAJourStatutEtDate(): void
    {
        $validation = new Validation($this->makeProfil(), ValidationType::Partage);

        $validation->decider(\App\Entity\Enum\ValidationStatut::Validee);

        self::assertSame(\App\Entity\Enum\ValidationStatut::Validee, $validation->getStatut());
        self::assertNotNull($validation->getDecidedAt());
    }
}
