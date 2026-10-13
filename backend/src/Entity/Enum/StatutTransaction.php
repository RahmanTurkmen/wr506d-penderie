<?php

namespace App\Entity\Enum;

enum StatutTransaction: string
{
    case EnCours = 'en_cours';
    case Terminee = 'terminee';
    case Annulee = 'annulee';
}
