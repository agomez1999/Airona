<?php

namespace App\Jobs;

use App\Domains\Orders\Models\Order;
use App\Mail\PaymentFailedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPaymentFailureEmailJob implements ShouldQueue
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
        $order = Order::find($this->orderId);

        if (!$order) {
            return;
        }

        $retryUrl = rtrim(config('app.frontend_url', config('app.url')), '/') . "/{$order->locale}/carrito";

        Mail::send(new PaymentFailedMail($order, $retryUrl));
    }
}
