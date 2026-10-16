<?php

namespace App\Tests\Functional;

use App\Repository\CategorieRepository;
use App\Repository\PieceRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * POST /api/objets — couvre l'invariant le plus important de la création
 * d'objet (§3) : exactement un pieceId OU un conteneurId, jamais les deux,
 * jamais aucun. C'est la même règle que Objet::validateEmplacement()
 * (tests/Unit/Entity/ObjetTest.php), vérifiée ici côté HTTP.
 */
final class ObjetControllerTest extends WebTestCase
{
    private function authenticatedClient(): \Symfony\Bundle\FrameworkBundle\KernelBrowser
    {
        $client = static::createClient();
        $user = static::getContainer()->get(UserRepository::class)
            ->findOneBy(['email' => 'test@lumen.local']);
        $client->loginUser($user);

        return $client;
    }

    public function testCreationAvecPieceEtConteneurEstRefusee(): void
    {
        $client = $this->authenticatedClient();
        $container = static::getContainer();

        $categorie = $container->get(CategorieRepository::class)->findOneBy(['nom' => 'Outils']);
        $piece = $container->get(PieceRepository::class)->findOneBy(['nom' => 'Salon']);
        self::assertNotNull($categorie);
        self::assertNotNull($piece);

        $client->request('POST', '/api/objets', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'nom' => 'Objet invalide',
            'type' => 'autre',
            'categorieId' => (string) $categorie->getId(),
            'pieceId' => (string) $piece->getId(),
            'conteneurId' => (string) $piece->getId(), // volontairement incohérent
        ]));

        self::assertResponseStatusCodeSame(400);
    }

    public function testCreationSansEmplacementEstRefusee(): void
    {
        $client = $this->authenticatedClient();
        $container = static::getContainer();

        $categorie = $container->get(CategorieRepository::class)->findOneBy(['nom' => 'Outils']);
        self::assertNotNull($categorie);

        $client->request('POST', '/api/objets', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'nom' => 'Objet sans emplacement',
            'type' => 'autre',
            'categorieId' => (string) $categorie->getId(),
        ]));

        self::assertResponseStatusCodeSame(400);
    }

    public function testCreationValideRenvoie201(): void
    {
        $client = $this->authenticatedClient();
        $container = static::getContainer();

        $categorie = $container->get(CategorieRepository::class)->findOneBy(['nom' => 'Outils']);
        $piece = $container->get(PieceRepository::class)->findOneBy(['nom' => 'Salon']);
        self::assertNotNull($categorie);
        self::assertNotNull($piece);

        $client->request('POST', '/api/objets', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'nom' => 'Objet de test fonctionnel',
            'type' => 'autre',
            'categorieId' => (string) $categorie->getId(),
            'pieceId' => (string) $piece->getId(),
        ]));

        self::assertResponseStatusCodeSame(201);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame('Objet de test fonctionnel', $data['nom']);
    }

    public function testTypeInvalideEstRefuse(): void
    {
        $client = $this->authenticatedClient();
        $container = static::getContainer();

        $categorie = $container->get(CategorieRepository::class)->findOneBy(['nom' => 'Outils']);
        $piece = $container->get(PieceRepository::class)->findOneBy(['nom' => 'Salon']);

        $client->request('POST', '/api/objets', server: ['CONTENT_TYPE' => 'application/json'], content: json_encode([
            'nom' => 'Objet invalide',
            'type' => 'type-qui-nexiste-pas',
            'categorieId' => (string) $categorie->getId(),
            'pieceId' => (string) $piece->getId(),
        ]));

        self::assertResponseStatusCodeSame(400);
    }
}
