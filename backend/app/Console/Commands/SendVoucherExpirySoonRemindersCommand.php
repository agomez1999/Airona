<?php

namespace App\Console\Commands;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Models\VoucherAuditLog;
use App\Jobs\SendVoucherExpirySoonEmailJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendVoucherExpirySoonRemindersCommand extends Command
{
    protected $signature = 'vouchers:send-expiry-reminders';
    protected $description = 'Send reminder emails for active vouchers expiring within 30 days';

    public function handle(): int
    {
        $vouchers = Voucher::where('status', 'active')
            ->whereNull('reminder_sent_at')
            ->whereBetween('expires_at', [now(), now()->addDays(30)])
            ->get();

        $count = 0;

        foreach ($vouchers as $voucher) {
            SendVoucherExpirySoonEmailJob::dispatch($voucher->id);

            $voucher->update(['reminder_sent_at' => now()]);

            VoucherAuditLog::create([
                'voucher_id' => $voucher->id,
                'actor_type' => 'system',
                'action'     => 'expiry_reminder_queued',
                'metadata'   => ['expires_at' => $voucher->expires_at->toIso8601String()],
            ]);

            $count++;
        }

        $this->info("Queued expiry reminder for {$count} voucher(s).");
        Log::info("vouchers:send-expiry-reminders completed", ['count' => $count]);

        return self::SUCCESS;
    }
}
