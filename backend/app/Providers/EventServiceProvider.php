<?php

namespace App\Providers;

use App\Events\OrderFailed;
use App\Events\PaymentConfirmed;
use App\Listeners\GenerateVoucherPdfListener;
use App\Listeners\SendOrderConfirmationEmailListener;
use App\Listeners\SendPaymentFailureEmailListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PaymentConfirmed::class => [
            GenerateVoucherPdfListener::class,
            SendOrderConfirmationEmailListener::class,
        ],
        OrderFailed::class => [
            SendPaymentFailureEmailListener::class,
        ],
    ];
}
