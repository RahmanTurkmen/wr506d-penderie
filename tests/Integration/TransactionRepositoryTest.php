<?php

namespace App\Tests\Integration;

use App\Entity\Enum\StatutTransaction;
use App\Repository\ObjetRepository;
use App\Repository\TransactionRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * §6 : achat d'un objet mis en vente (le Plaid). Une Transaction démarre
 * toujours "en_cours" (pas encore de validation de paiement).
 */
final class TransactionRepositoryTest extends KernelTestCase
{
    public function testTransactionDuPlaidEstEnCours(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $plaid = $container->get(ObjetRepository::class)->findOneBy(['nom' => 'Plaid']);
        self::assertNotNull($plaid);

        $transaction = $container->get(TransactionRepository::class)->findOneBy(['objet' => $plaid]);

        self::assertNotNull($transaction);
        self::assertSame('lilou@lumen.local', $transaction->getAcheteur()->getEmail());
        self::assertSame('10.00', $transaction->getMontant());
        self::assertSame(StatutTransaction::EnCours, $transaction->getStatut());
    }
}
