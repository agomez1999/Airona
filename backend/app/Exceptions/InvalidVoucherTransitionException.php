<?php

namespace App\Exceptions;

use RuntimeException;

class InvalidVoucherTransitionException extends RuntimeException
{
    public function __construct(string $from, string $to)
    {
        parent::__construct("Invalid voucher status transition from '{$from}' to '{$to}'.");
    }
}
