<?php

namespace App\Mail;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Services\PdfVoucherService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VoucherExpiringSoonMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Voucher $voucher,
        private readonly PdfVoucherService $pdfService,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->voucher->customer_email,
            subject: "Tu vale caduca pronto — Airona Globus",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.voucher-expiring-soon',
            with: [
                'voucher'     => $this->voucher,
                'downloadUrl' => $this->pdfService->getDownloadUrl($this->voucher),
            ],
        );
    }
}
