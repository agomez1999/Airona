<?php

namespace App\Domains\Vouchers\Services;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Models\VoucherAuditLog;
use App\Exceptions\InvalidVoucherTransitionException;
use Illuminate\Support\Facades\DB;

class VoucherStateMachine
{
    private const ALLOWED = [
        'pending_payment' => ['active', 'cancelled'],
        'active'          => ['redeemed', 'expired', 'refunded', 'cancelled'],
    ];

    public function transition(
        Voucher $voucher,
        string $to,
        string $actorType = 'system',
        ?int $actorId = null,
        array $metadata = [],
    ): Voucher {
        $from = $voucher->status;

        if (!in_array($to, self::ALLOWED[$from] ?? [], true)) {
            throw new InvalidVoucherTransitionException($from, $to);
        }

        return DB::transaction(function () use ($voucher, $from, $to, $actorType, $actorId, $metadata) {
            $fresh = Voucher::lockForUpdate()->findOrFail($voucher->id);

            if ($fresh->status !== $from) {
                throw new InvalidVoucherTransitionException($fresh->status, $to);
            }

            $updates = ['status' => $to];
            $action  = $to;

            match ($to) {
                'active'    => $updates += ['activated_at' => now()],
                'redeemed'  => $updates += ['redeemed_at' => now(), 'redeemed_by_user_id' => $actorId],
                'expired'   => $updates += ['cancelled_at' => now()],   // reuse cancelled_at timestamp column
                'refunded'  => $updates += ['refunded_at' => now()],
                'cancelled' => $updates += ['cancelled_at' => now()],
                default     => null,
            };

            $fresh->update($updates);

            VoucherAuditLog::create([
                'voucher_id' => $fresh->id,
                'actor_type' => $actorType,
                'actor_id'   => $actorId,
                'action'     => $action,
                'metadata'   => $metadata ?: null,
            ]);

            return $fresh;
        });
    }

    public function canTransition(Voucher $voucher, string $to): bool
    {
        return in_array($to, self::ALLOWED[$voucher->status] ?? [], true);
    }
}
