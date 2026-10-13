<?php

namespace App\Controller;

use App\Controller\Trait\ResolvesActiveProfilTrait;
use App\Entity\Categorie;
use App\Entity\Conteneur;
use App\Entity\Enum\ProfilType;
use App\Entity\Enum\StatutObjet;
use App\Entity\Enum\TypeObjet;
use App\Entity\Enum\ValidationType;
use App\Entity\Objet;
use App\Entity\Piece;
use App\Entity\Tag;
use App\Entity\User;
use App\Entity\Validation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Uid\Uuid;

class ObjetController
{
    use ResolvesActiveProfilTrait;

    private const ALLOWED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];
    private const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8 Mo

    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire('%kernel.project_dir%')] private readonly string $projectDir,
    ) {
    }

    private function serialize(Objet $objet): array
    {
        return [
            'id' => (string) $objet->getId(),
            'nom' => $objet->getNom(),
            'type' => $objet->getType()->value,
            'statut' => $objet->getStatut()->value,
            'qrCodeInterne' => $objet->getQrCodeInterne(),
            'photo' => $objet->getPhoto(),
            'categorie' => ['id' => (string) $objet->getCategorie()->getId(), 'nom' => $objet->getCategorie()->getNom()],
            'piece' => $objet->getPiece() ? ['id' => (string) $objet->getPiece()->getId(), 'nom' => $objet->getPiece()->getNom()] : null,
            'conteneur' => $objet->getConteneur() ? ['id' => (string) $objet->getConteneur()->getId(), 'nom' => $objet->getConteneur()->getNom()] : null,
            'tags' => array_map(
                fn ($t) => ['id' => (string) $t->getId(), 'nom' => $t->getNom()],
                $objet->getTags()->toArray(),
            ),
        ];
    }

    /**
     * Enregistre la photo sur disque (public/uploads/objets) et renvoie le
     * chemin public (servi tel quel par nginx, qui a public/ comme racine).
     */
    private function storePhoto(UploadedFile $photo): ?string
    {
        $mime = $photo->getMimeType() ?? $photo->getClientMimeType();
        if (!\in_array($mime, self::ALLOWED_PHOTO_MIME, true) || $photo->getSize() > self::MAX_PHOTO_SIZE) {
            return null;
        }

        $dir = $this->projectDir.'/public/uploads/objets';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $filename = Uuid::v7()->toRfc4122().'.'.($photo->guessExtension() ?: 'jpg');
        $photo->move($dir, $filename);

        return '/uploads/objets/'.$filename;
    }

    private function generateQrCode(): string
    {
        do {
            $code = 'QR-'.strtoupper(bin2hex(random_bytes(5)));
        } while (null !== $this->em->getRepository(Objet::class)->findOneBy(['qrCodeInterne' => $code]));

        return $code;
    }

    #[Route('/api/objets', name: 'api_objets_list', methods: ['GET'])]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        return new JsonResponse(array_map($this->serialize(...), $profil->getObjets()->toArray()));
    }

    #[Route('/api/objets', name: 'api_objets_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $profil = $this->resolveProfil($request, $user);
        if (null === $profil) {
            return new JsonResponse(['error' => 'Aucun profil pour cet utilisateur.'], 404);
        }

        // Multipart (avec photo éventuelle) ou JSON classique (compatibilité) :
        // on normalise les deux dans le même tableau $data.
        $isMultipart = str_starts_with((string) $request->headers->get('Content-Type'), 'multipart/form-data');
        $data = $isMultipart ? $request->request->all() : (json_decode($request->getContent(), true) ?? []);

        $nom = $data['nom'] ?? null;
        $typeValue = $data['type'] ?? null;
        $categorieId = $data['categorieId'] ?? null;
        $pieceId = $data['pieceId'] ?? null;
        $conteneurId = $data['conteneurId'] ?? null;
        $tagIds = $data['tagIds'] ?? [];

        if (!\is_string($nom) || '' === $nom) {
            return new JsonResponse(['error' => 'nom est requis.'], 400);
        }

        $type = TypeObjet::tryFrom((string) $typeValue);
        if (null === $type) {
            return new JsonResponse(['error' => 'type invalide. Valeurs possibles : '.implode(', ', array_column(TypeObjet::cases(), 'value'))], 400);
        }

        $categorie = null !== $categorieId ? $this->em->getRepository(Categorie::class)->find($categorieId) : null;
        if (null === $categorie) {
            return new JsonResponse(['error' => 'categorieId invalide.'], 400);
        }

        if ((null === $pieceId) === (null === $conteneurId)) {
            return new JsonResponse(['error' => 'Il faut fournir exactement un pieceId OU un conteneurId, jamais les deux.'], 400);
        }

        if (null !== $pieceId) {
            $piece = $this->em->getRepository(Piece::class)->find($pieceId);
            if (null === $piece || $piece->getLogement()->getProfil() !== $profil) {
                return new JsonResponse(['error' => 'pieceId introuvable.'], 404);
            }
            $emplacement = $piece;
        } else {
            $conteneur = $this->em->getRepository(Conteneur::class)->find($conteneurId);
            if (null === $conteneur || $conteneur->getPiece()->getLogement()->getProfil() !== $profil) {
                return new JsonResponse(['error' => 'conteneurId introuvable.'], 404);
            }
            $emplacement = $conteneur;
        }

        $objet = new Objet($profil, $categorie, $nom, $type, $this->generateQrCode(), $emplacement);

        foreach ((array) $tagIds as $tagId) {
            $tag = $this->em->getRepository(Tag::class)->find($tagId);
            if (null !== $tag) {
                $objet->addTag($tag);
            }
        }

        $photo = $request->files->get('photo');
        if ($photo instanceof UploadedFile) {
            $path = $this->storePhoto($photo);
            if (null !== $path) {
                $objet->setPhoto($path);
            }
        }

        $this->em->persist($objet);
        $this->em->flush();

        return new JsonResponse($this->serialize($objet), 201);
    }

    #[Route('/api/objets/{id}/statut', name: 'api_objets_statut', methods: ['PATCH'])]
    public function updateStatut(string $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $objet = $this->em->getRepository(Objet::class)->find($id);
        if (null === $objet || $objet->getProfil()->getUser() !== $user) {
            return new JsonResponse(['error' => 'Objet introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $statut = StatutObjet::tryFrom((string) ($data['statut'] ?? ''));
        if (null === $statut) {
            return new JsonResponse(['error' => 'statut invalide. Valeurs possibles : '.implode(', ', array_column(StatutObjet::cases(), 'value'))], 400);
        }

        // §7 invariant : un profil "gere" ne met pas un objet en vente sans
        // validation du compte principal.
        if (StatutObjet::EnVente === $statut && ProfilType::Gere === $objet->getProfil()->getType()) {
            $validation = new Validation($objet->getProfil(), ValidationType::ObjetEnVente, ['objetId' => (string) $objet->getId()]);
            $this->em->persist($validation);
            $this->em->flush();

            return new JsonResponse([
                'enAttenteDeValidation' => true,
                'validationId' => (string) $validation->getId(),
                'message' => 'Mise en vente soumise au compte principal pour validation.',
            ], 202);
        }

        $objet->setStatut($statut);
        $this->em->flush();

        return new JsonResponse($this->serialize($objet));
    }
}
