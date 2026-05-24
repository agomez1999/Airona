<?php

namespace App\Jobs;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Services\PdfVoucherService;
use App\Mail\VoucherDeliveryMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendVoucherEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(private readonly string $voucherId)
    {
        $this->onQueue('default');
    }

    public function handle(PdfVoucherService $pdfService): void
    {
        $voucher = Voucher::with(['product.translations', 'order'])->find($this->voucherId);

        if (!$voucher || $voucher->email_sent_at) {
            return;
        }

        Mail::send(new VoucherDeliveryMail($voucher, $pdfService));

        $voucher->update(['email_sent_at' => now()]);
    }
}
