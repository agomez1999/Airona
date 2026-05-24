<?php

namespace App\Listeners;

use App\Events\OrderFailed;
use App\Jobs\SendPaymentFailureEmailJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendPaymentFailureEmailListener implements ShouldQueue
{
    public bool $afterCommit = true;

    public string $queue = 'default';

    public function handle(OrderFailed $event): void
    {
        SendPaymentFailureEmailJob::dispatch($event->order->id)->onQueue('default');
    }
}
