<?php

namespace App\Listeners;

use App\Events\PaymentConfirmed;
use App\Jobs\GenerateVoucherPdfJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class GenerateVoucherPdfListener implements ShouldQueue
{
    public bool $afterCommit = true;

    public string $queue = 'high';

    public function handle(PaymentConfirmed $event): void
    {
        foreach ($event->order->vouchers as $voucher) {
            GenerateVoucherPdfJob::dispatch($voucher->id)->onQueue('high');
        }
    }
}
