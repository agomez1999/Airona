<?php

namespace App\Mail;

use App\Domains\Orders\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->order->customer_email,
            subject: "Confirmación de pedido {$this->order->order_number} — Airona Globus",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'order'  => $this->order->load('items'),
                'locale' => $this->order->locale,
            ],
        );
    }
}
