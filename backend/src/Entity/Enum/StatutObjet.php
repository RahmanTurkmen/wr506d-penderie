<?php

namespace App\Entity\Enum;

enum StatutObjet: string
{
    case Disponible = 'disponible';
    case Prete = 'prete';
    case EnVente = 'en_vente';
}
