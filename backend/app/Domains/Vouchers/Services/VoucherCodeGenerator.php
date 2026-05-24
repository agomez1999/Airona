<?php

namespace App\Domains\Vouchers\Services;

use App\Domains\Vouchers\Models\Voucher;

class VoucherCodeGenerator
{
    private const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    private const SEGMENTS = 3;
    private const SEGMENT_LENGTH = 4;
    private const PREFIX = 'AIRONA';

    public function generate(): string
    {
        $attempts = 0;

        do {
            if (++$attempts > 10) {
                throw new \RuntimeException('Failed to generate a unique voucher code after 10 attempts.');
            }

            $code = self::PREFIX;
            for ($i = 0; $i < self::SEGMENTS; $i++) {
                $code .= '-' . $this->randomSegment();
            }
        } while (Voucher::where('code', $code)->exists());

        return $code;
    }

    private function randomSegment(): string
    {
        $charset = self::CHARSET;
        $length = strlen($charset);
        $segment = '';

        for ($i = 0; $i < self::SEGMENT_LENGTH; $i++) {
            $segment .= $charset[random_int(0, $length - 1)];
        }

        return $segment;
    }
}
