<?php

namespace App\Domains\Vouchers\Services;

use App\Domains\Vouchers\Models\Voucher;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class PdfVoucherService
{
    public function generate(Voucher $voucher): string
    {
        $voucher->load(['product.translations', 'order']);

        $qrCodeSvg = $this->generateQrSvg($voucher->qr_payload);

        $pdf = Pdf::loadView('pdf.voucher', [
            'voucher'   => $voucher,
            'qrCodeSvg' => $qrCodeSvg,
        ])->setPaper('a4');

        $path = "vouchers/{$voucher->id}.pdf";
        Storage::disk('local')->put("private/{$path}", $pdf->output());

        $voucher->update([
            'pdf_path'         => $path,
            'pdf_generated_at' => now(),
        ]);

        return $path;
    }

    public function getDownloadUrl(Voucher $voucher): string
    {
        return URL::temporarySignedRoute(
            'vouchers.download',
            now()->addHours(72),
            ['code' => $voucher->code],
        );
    }

    private function generateQrSvg(string $payload): string
    {
        return \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
            ->size(200)
            ->errorCorrection('H')
            ->generate($payload);
    }
}
