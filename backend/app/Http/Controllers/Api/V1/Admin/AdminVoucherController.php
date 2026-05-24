<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Vouchers\Models\Voucher;
use App\Domains\Vouchers\Services\PdfVoucherService;
use App\Domains\Vouchers\Services\VoucherStateMachine;
use App\Exceptions\InvalidVoucherTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Resources\VoucherResource;
use App\Jobs\GenerateVoucherPdfJob;
use App\Jobs\SendVoucherEmailJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminVoucherController extends Controller
{
    public function __construct(
        private readonly VoucherStateMachine $stateMachine,
        private readonly PdfVoucherService $pdfService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Voucher::with(['order', 'product'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        return VoucherResource::collection($query->paginate(25));
    }

    public function show(string $code): VoucherResource
    {
        $voucher = Voucher::with(['order.items', 'product', 'auditLogs'])
            ->where('code', $code)
            ->firstOrFail();

        return new VoucherResource($voucher);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $voucher = Voucher::with(['product', 'order'])
            ->where('code', $request->code)
            ->first();

        if (!$voucher) {
            return response()->json(['valid' => false, 'message' => 'Código no encontrado.'], 422);
        }

        if (!$voucher->isActive()) {
            return response()->json([
                'valid'   => false,
                'message' => "El vale no está activo (estado: {$voucher->status}).",
                'voucher' => new VoucherResource($voucher->load(['product', 'order'])),
            ], 422);
        }

        if ($voucher->isExpired()) {
            return response()->json([
                'valid'   => false,
                'message' => 'El vale ha expirado.',
                'voucher' => new VoucherResource($voucher->load(['product', 'order'])),
            ], 422);
        }

        return response()->json([
            'valid'   => true,
            'voucher' => new VoucherResource($voucher->load(['product', 'order'])),
        ]);
    }

    public function redeem(Request $request, string $code): JsonResponse
    {
        $voucher = Voucher::where('code', $code)->firstOrFail();

        if (!$voucher->isActive()) {
            return response()->json([
                'message' => "El vale no se puede canjear (estado: {$voucher->status}).",
            ], 422);
        }

        if ($voucher->isExpired()) {
            return response()->json(['message' => 'El vale ha expirado.'], 422);
        }

        try {
            $redeemed = $this->stateMachine->transition(
                $voucher,
                'redeemed',
                'admin',
                $request->user()->id,
                ['redeemed_via' => 'admin_panel'],
            );
        } catch (InvalidVoucherTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Vale canjeado correctamente.',
            'voucher' => new VoucherResource($redeemed->load(['product', 'order', 'auditLogs'])),
        ]);
    }

    public function cancel(Request $request, string $code): JsonResponse
    {
        $voucher = Voucher::where('code', $code)->firstOrFail();

        try {
            $cancelled = $this->stateMachine->transition(
                $voucher,
                'cancelled',
                'admin',
                $request->user()->id,
                ['reason' => $request->input('reason')],
            );
        } catch (InvalidVoucherTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Vale cancelado.',
            'voucher' => new VoucherResource($cancelled),
        ]);
    }

    public function resendEmail(string $code): JsonResponse
    {
        $voucher = Voucher::where('code', $code)->firstOrFail();

        if (!$voucher->isActive()) {
            return response()->json(['message' => 'Solo se puede reenviar el email de vales activos.'], 422);
        }

        if (!$voucher->pdf_generated_at) {
            GenerateVoucherPdfJob::dispatch($voucher->id);
        } else {
            SendVoucherEmailJob::dispatch($voucher->id);
        }

        $voucher->auditLogs()->create([
            'actor_type' => 'admin',
            'action'     => 'email_resent',
            'metadata'   => ['queued_at' => now()->toIso8601String()],
        ]);

        return response()->json(['message' => 'Email de vale en cola para reenvío.']);
    }

    public function auditLog(string $code): JsonResponse
    {
        $voucher = Voucher::with('auditLogs')->where('code', $code)->firstOrFail();

        return response()->json([
            'data' => $voucher->auditLogs->map(fn ($log) => [
                'action'     => $log->action,
                'actor_type' => $log->actor_type,
                'actor_id'   => $log->actor_id,
                'metadata'   => $log->metadata,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toIso8601String(),
            ]),
        ]);
    }
}
