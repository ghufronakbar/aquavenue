<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'superadmin';
    case Admin      = 'admin';
    case User       = 'user';
}
