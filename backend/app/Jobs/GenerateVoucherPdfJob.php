<?php

namespace App\Jobs;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Services\PdfVoucherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateVoucherPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(private readonly string $voucherId)
    {
        $this->onQueue('high');
    }

    public function handle(PdfVoucherService $pdfService): void
    {
        $voucher = Voucher::with(['product.translations', 'order'])->find($this->voucherId);

        if (!$voucher) {
            Log::warning('GenerateVoucherPdfJob: voucher not found', ['voucher_id' => $this->voucherId]);
            return;
        }

        if ($voucher->pdf_generated_at) {
            return;
        }

        $pdfService->generate($voucher);

        SendVoucherEmailJob::dispatch($this->voucherId)->onQueue('default');
    }
}
