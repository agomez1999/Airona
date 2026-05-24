<?php

namespace App\Listeners;

use App\Events\PaymentConfirmed;
use App\Jobs\SendOrderConfirmationEmailJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderConfirmationEmailListener implements ShouldQueue
{
    public bool $afterCommit = true;

    public string $queue = 'default';

    public function handle(PaymentConfirmed $event): void
    {
        SendOrderConfirmationEmailJob::dispatch($event->order->id)->onQueue('default');
    }
}
