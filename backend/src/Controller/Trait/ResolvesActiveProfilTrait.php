<?php

namespace App\Controller\Trait;

use App\Entity\Profil;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;

/**
 * Un User peut avoir plusieurs Profil (principal + sous-comptes gérés).
 * Le client indique le profil actif via l'en-tête X-Profil-Id ; par défaut
 * on retombe sur le profil principal (premier créé, à l'inscription).
 */
trait ResolvesActiveProfilTrait
{
    protected function resolveProfil(Request $request, User $user): ?Profil
    {
        $profilId = $request->headers->get('X-Profil-Id');

        if (null !== $profilId) {
            foreach ($user->getProfils() as $profil) {
                if ((string) $profil->getId() === $profilId) {
                    return $profil;
                }
            }

            return null;
        }

        $first = $user->getProfils()->first();

        return false !== $first ? $first : null;
    }
}
