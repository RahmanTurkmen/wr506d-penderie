<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\StatutTransaction;
use App\Entity\Enum\ValidationStatut;
use App\Entity\Profil;
use App\Entity\User;
use App\Entity\Validation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProfilController
{
    use ResolvesActiveProfilTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
    ) {
    }

    /** @return array<string, mixed> */
    private function serialize(Profil $profil): array
    {
        return [
            'id' => (string) $profil->getId(),
            'nom' => $profil->getNom(),
            'type' => $profil->getType()->value,
            'estMineur' => $profil->isEstMineur(),
        ];
    }

    #[Route('/api/profils', name: 'api_profils_list', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        return new JsonResponse(array_map($this->serialize(...), $user->getProfils()->toArray()));
    }

    /**
     * Crée un sous-compte (toujours de type "gere") rattaché au même User —
     * c'est ainsi qu'un compte principal gère ses enfants/proches (§1, §7).
     */
    #[Route('/api/profils', name: 'api_profils_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $nom = $data['nom'] ?? null;
        $estMineur = (bool) ($data['estMineur'] ?? false);

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => $this->translator->trans('common.nom_requis')], 400);
        }

        $profil = new Profil($user, $nom, ProfilType::Gere);
        $profil->setEstMineur($estMineur);

        $this->em->persist($profil);
        $this->em->flush();

        return new JsonResponse($this->serialize($profil), 201);
    }

    /**
     * "Mon espace" (chap. 22-23) : quelques KPI réels calculés depuis la base
     * pour le profil actif (contrairement au back-office admin, qui reste une
     * maquette statique — ici on agrège les vraies entités du profil connecté).
     */
    #[Route('/api/profils/stats', name: 'api_profils_stats', methods: ['GET'])]
    public function stats(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => $this->translator->trans('profil.not_found')], 404);
        }

        $objets = $profil->getObjets();

        $nbPretsActifs = 0;
        $nbVentesTerminees = 0;
        $montantVentesTerminees = 0.0;
        foreach ($objets as $objet) {
            foreach ($objet->getPrets() as $pret) {
                if ($pret->isActif()) {
                    ++$nbPretsActifs;
                }
            }
            foreach ($objet->getTransactions() as $transaction) {
                if (StatutTransaction::Terminee === $transaction->getStatut()) {
                    ++$nbVentesTerminees;
                    $montantVentesTerminees += (float) $transaction->getMontant();
                }
            }
        }

        $nbEnVente = 0;
        foreach ($objets as $objet) {
            if (StatutObjet::EnVente === $objet->getStatut()) {
                ++$nbEnVente;
            }
        }

        $nbValidationsEnAttente = ProfilType::Principal === $profil->getType()
            ? \count(array_filter(
                $this->em->getRepository(Validation::class)->findBy(['statut' => ValidationStatut::EnAttente]),
                fn (Validation $v) => $v->getProfil()->getUser() === $user,
            ))
            : 0;

        return new JsonResponse([
            'nbObjets' => \count($objets),
            'nbLogements' => \count($profil->getLogements()),
            'nbPretsActifs' => $nbPretsActifs,
            'nbEnVente' => $nbEnVente,
            'nbVentesTerminees' => $nbVentesTerminees,
            'montantVentesTerminees' => round($montantVentesTerminees, 2),
            'nbPartages' => \count($profil->getPartages()),
            'nbValidationsEnAttente' => $nbValidationsEnAttente,
        ]);
    }
}
