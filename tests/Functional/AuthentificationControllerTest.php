<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * POST /api/login (firewall json_login + JWT) et accès aux routes protégées
 * (^/api, IS_AUTHENTICATED_FULLY). Ce sont les deux règles de sécurité les
 * plus critiques de l'app : sans elles, n'importe qui accèderait à
 * l'inventaire de n'importe qui.
 */
final class AuthentificationControllerTest extends WebTestCase
{
    public function testConnexionReussieRenvoieUnToken(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'test@lumen.local',
            'password' => 'password123',
        ]));

        self::assertResponseIsSuccessful();
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertArrayHasKey('token', $data);
        self::assertNotEmpty($data['token']);
    }

    public function testMotDePasseIncorrectEstRefuse(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'test@lumen.local',
            'password' => 'mauvais-mot-de-passe',
        ]));

        self::assertResponseStatusCodeSame(401);
    }

    public function testRouteProtegeeSansTokenRenvoie401(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/objets');

        self::assertResponseStatusCodeSame(401);
    }

    public function testRouteProtegeeAvecTokenValideFonctionne(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'email' => 'test@lumen.local',
            'password' => 'password123',
        ]));
        $token = (json_decode((string) $client->getResponse()->getContent(), true))['token'];

        // Pas d'en-tête X-Profil-Id : ResolvesActiveProfilTrait retombe sur
        // le premier profil de l'utilisateur (le "principal").
        $client->request('GET', '/api/objets', server: [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);

        self::assertResponseIsSuccessful();
    }
}
