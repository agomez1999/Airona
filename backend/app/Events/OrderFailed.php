<?php

namespace App\Events;

use App\Domains\Orders\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderFailed
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Order $order) {}
}
