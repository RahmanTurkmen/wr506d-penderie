<?php

namespace App\Entity\Enum;

enum ValidationStatut: string
{
    case EnAttente = 'en_attente';
    case Validee = 'validee';
    case Refusee = 'refusee';
}
