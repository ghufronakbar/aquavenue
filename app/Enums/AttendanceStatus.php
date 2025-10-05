<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case OnTime = 'ontime';
    case Late   = 'late';
}
