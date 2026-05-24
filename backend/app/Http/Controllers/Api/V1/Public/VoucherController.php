<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Domains\Vouchers\Models\Voucher;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class VoucherController extends Controller
{
    public function download(Request $request, string $code): Response
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Invalid or expired download link.');
        }

        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher || !$voucher->pdf_path) {
            abort(404, 'Voucher PDF not found.');
        }

        if (!$voucher->isActive() && $voucher->status !== 'redeemed') {
            abort(403, 'Voucher is not available for download.');
        }

        $fullPath = Storage::disk('local')->path("private/{$voucher->pdf_path}");

        if (!file_exists($fullPath)) {
            abort(404, 'PDF file not found.');
        }

        return response()->file($fullPath, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"vale-{$voucher->code}.pdf\"",
        ]);
    }
}
