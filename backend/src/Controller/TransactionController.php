<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\StatutTransaction;
use App\Entity\Objet;
use App\Entity\Transaction;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class TransactionController
{
    use ResolvesActiveProfilTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /**
     * §8 (tableau séance 8) : un sous-compte enfant voit une vente avec le
     * prix caché.
     */
    private function serialize(Transaction $transaction, bool $hidePrice): array
    {
        return [
            'id' => (string) $transaction->getId(),
            'montant' => $hidePrice ? null : $transaction->getMontant(),
            'statut' => $transaction->getStatut()->value,
            'acheteur' => $transaction->getAcheteur()->getEmail(),
            'createdAt' => $transaction->getCreatedAt()->format('c'),
        ];
    }

    #[Route('/api/objets/{objetId}/transactions', name: 'api_transactions_list', methods: ['GET'])]
    public function list(string $objetId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $objet = $this->em->getRepository(Objet::class)->find($objetId);
        if (null === $objet) {
            return new JsonResponse(['error' => 'Objet introuvable.'], 404);
        }

        // Vendeur (propriétaire) ou acheteur peuvent voir les transactions.
        $isOwner = $objet->getProfil()->getUser() === $user;
        $transactions = array_filter(
            $objet->getTransactions()->toArray(),
            fn ($t) => $isOwner || $t->getAcheteur() === $user,
        );

        $viewerProfil = $this->resolveProfil($request, $user);
        $hidePrice = $viewerProfil?->isEstMineur() ?? false;

        return new JsonResponse(array_map(fn ($t) => $this->serialize($t, $hidePrice), $transactions));
    }

    #[Route('/api/objets/{objetId}/transactions', name: 'api_transactions_create', methods: ['POST'])]
    public function create(string $objetId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $objet = $this->em->getRepository(Objet::class)->find($objetId);
        if (null === $objet) {
            return new JsonResponse(['error' => 'Objet introuvable.'], 404);
        }

        if (StatutObjet::EnVente !== $objet->getStatut()) {
            return new JsonResponse(['error' => "Cet objet n'est pas en vente."], 409);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $montant = $data['montant'] ?? null;
        if (!\is_numeric($montant)) {
            return new JsonResponse(['error' => 'montant est requis (nombre).'], 400);
        }

        // §7 : transaction = utilisateur authentifié (garanti par #[CurrentUser]).
        $transaction = new Transaction($objet, $user, (string) $montant);
        $this->em->persist($transaction);
        $this->em->flush();

        return new JsonResponse($this->serialize($transaction, false), 201);
    }

    #[Route('/api/transactions/{id}/statut', name: 'api_transactions_statut', methods: ['PATCH'])]
    public function updateStatut(string $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $transaction = $this->em->getRepository(Transaction::class)->find($id);
        if (null === $transaction) {
            return new JsonResponse(['error' => 'Transaction introuvable.'], 404);
        }

        $isOwner = $transaction->getObjet()->getProfil()->getUser() === $user;
        $isAcheteur = $transaction->getAcheteur() === $user;
        if (!$isOwner && !$isAcheteur) {
            return new JsonResponse(['error' => 'Transaction introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $statut = StatutTransaction::tryFrom((string) ($data['statut'] ?? ''));
        if (null === $statut) {
            return new JsonResponse(['error' => 'statut invalide.'], 400);
        }

        $transaction->setStatut($statut);
        if (StatutTransaction::Terminee === $statut) {
            $transaction->getObjet()->setStatut(StatutObjet::Disponible);
        }
        $this->em->flush();

        return new JsonResponse($this->serialize($transaction, false));
    }
}
