<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * POST /api/register — couvre les règles de validation de
 * RegistrationController, qui sont le seul rempart contre un compte
 * invalide ou en double (pas de contrainte DB unique sur email hors
 * contrainte applicative explicite).
 */
final class RegistrationControllerTest extends WebTestCase
{
    public function testInscriptionReussie(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'nouveau.'.uniqid().'@lumen.local',
            'password' => 'motdepasse123',
            'nom' => 'Testeur',
        ]));

        self::assertResponseStatusCodeSame(201);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('Testeur', $data['profil']['nom']);
        self::assertSame('principal', $data['profil']['type']);
    }

    public function testChampsManquantsRenvoie400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'incomplet@lumen.local',
        ]));

        self::assertResponseStatusCodeSame(400);
    }

    public function testMotDePasseTropCourtRenvoie400(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'court.'.uniqid().'@lumen.local',
            'password' => '123',
            'nom' => 'Testeur',
        ]));

        self::assertResponseStatusCodeSame(400);
    }

    public function testEmailDejaUtiliseRenvoie409(): void
    {
        // test@lumen.local existe déjà dans les fixtures.
        $client = static::createClient();

        $client->request('POST', '/api/register', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'test@lumen.local',
            'password' => 'motdepasse123',
            'nom' => 'Doublon',
        ]));

        self::assertResponseStatusCodeSame(409);
    }
}
