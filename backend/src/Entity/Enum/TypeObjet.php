<?php

namespace App\Entity\Enum;

enum TypeObjet: string
{
    case Vetement = 'vetement';
    case Livre = 'livre';
    case Vinyle = 'vinyle';
    case Autre = 'autre';
}
