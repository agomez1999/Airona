<?php

namespace App\Mail;

use App\Domains\Orders\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $retryUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->order->customer_email,
            subject: "Problema con tu pago — Airona Globus",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-failed',
            with: [
                'order'    => $this->order,
                'retryUrl' => $this->retryUrl,
            ],
        );
    }
}
