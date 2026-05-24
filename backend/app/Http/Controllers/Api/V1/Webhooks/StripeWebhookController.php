<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Domains\Payments\Services\PaymentService;
use App\Http\Controllers\Controller;
use App\Jobs\HandleStripeWebhookJob;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature', '');

        try {
            $event = $this->paymentService->constructWebhookEvent($payload, $sigHeader);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'message' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);
            return response('Invalid signature.', 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook parsing error', ['message' => $e->getMessage()]);
            return response('Webhook error.', 400);
        }

        HandleStripeWebhookJob::dispatch($event->type, $event->data->object->toArray());

        return response('', 200);
    }
}
