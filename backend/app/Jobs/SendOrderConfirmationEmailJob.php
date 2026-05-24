<?php

namespace App\Jobs;

use App\Domains\Orders\Models\Order;
use App\Mail\OrderConfirmationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(private readonly string $orderId)
    {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $order = Order::with('items')->find($this->orderId);

        if (!$order) {
            return;
        }

        Mail::send(new OrderConfirmationMail($order));
    }
}
