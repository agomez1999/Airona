<?php

namespace App\Mail;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Services\PdfVoucherService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class VoucherDeliveryMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Voucher $voucher,
        private readonly PdfVoucherService $pdfService,
    ) {}

    public function envelope(): Envelope
    {
        $experience = $this->voucher->product?->name ?? 'Experiencia en globo';

        return new Envelope(
            to: $this->voucher->customer_email,
            subject: "Tu vale: {$experience} — Airona Globus",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.voucher-delivery',
            with: [
                'voucher'     => $this->voucher,
                'downloadUrl' => $this->pdfService->getDownloadUrl($this->voucher),
            ],
        );
    }

    public function attachments(): array
    {
        if (!$this->voucher->pdf_path) {
            return [];
        }

        $fullPath = Storage::disk('local')->path("private/{$this->voucher->pdf_path}");

        if (!file_exists($fullPath)) {
            return [];
        }

        return [
            Attachment::fromPath($fullPath)
                ->as("vale-{$this->voucher->code}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
