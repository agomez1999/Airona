<?php

namespace App\Console\Commands;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Models\VoucherAuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireVouchersCommand extends Command
{
    protected $signature = 'vouchers:expire';
    protected $description = 'Transition active vouchers past their expiry date to expired status';

    public function handle(): int
    {
        $expired = Voucher::where('status', 'active')
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;

        foreach ($expired as $voucher) {
            try {
                DB::transaction(function () use ($voucher) {
                    $fresh = Voucher::lockForUpdate()->find($voucher->id);

                    if (!$fresh || $fresh->status !== 'active' || $fresh->expires_at->isFuture()) {
                        return;
                    }

                    $fresh->update([
                        'status'       => 'expired',
                        'cancelled_at' => now(),
                    ]);

                    VoucherAuditLog::create([
                        'voucher_id' => $fresh->id,
                        'actor_type' => 'system',
                        'action'     => 'expired',
                        'metadata'   => ['expired_at' => now()->toIso8601String()],
                    ]);
                });

                $count++;
            } catch (\Throwable $e) {
                Log::error('ExpireVouchersCommand: failed to expire voucher', [
                    'voucher_id' => $voucher->id,
                    'error'      => $e->getMessage(),
                ]);
            }
        }

        $this->info("Expired {$count} voucher(s).");
        Log::info("vouchers:expire completed", ['count' => $count]);

        return self::SUCCESS;
    }
}
