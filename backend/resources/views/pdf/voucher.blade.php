<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vale Experiencia – Airona Globus</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            background: #ffffff;
            color: #1a1f2e;
            font-size: 14px;
            line-height: 1.5;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            background: #ffffff;
        }

        /* ── Header ── */
        .header {
            background: #1a1f2e;
            color: #ffffff;
            padding: 36px 48px 28px;
            position: relative;
        }

        .header-brand {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 3px;
            color: #c9a84c;
            text-transform: uppercase;
        }

        .header-subtitle {
            font-size: 11px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #a0a8bb;
            margin-top: 4px;
        }

        .header-badge {
            position: absolute;
            top: 36px;
            right: 48px;
            background: #c9a84c;
            color: #1a1f2e;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 2px;
        }

        .gold-line {
            height: 3px;
            background: #c9a84c;
        }

        /* ── Body ── */
        .body {
            padding: 40px 48px;
        }

        .experience-name {
            font-size: 26px;
            font-weight: 700;
            color: #1a1f2e;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }

        .experience-tagline {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 36px;
        }

        /* ── Voucher Code Box ── */
        .code-section {
            margin-bottom: 36px;
        }

        .code-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .code-box {
            border: 2px solid #c9a84c;
            border-radius: 6px;
            padding: 18px 24px;
            background: #fdfaf3;
            display: inline-block;
            min-width: 280px;
        }

        .code-value {
            font-family: "Courier New", Courier, monospace;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #1a1f2e;
        }

        /* ── QR Code ── */
        .qr-section {
            text-align: center;
            margin-bottom: 36px;
        }

        .qr-wrapper {
            display: inline-block;
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #ffffff;
        }

        .qr-wrapper svg {
            display: block;
            width: 180px;
            height: 180px;
        }

        .qr-hint {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* ── Details Row ── */
        .details-grid {
            margin-bottom: 36px;
        }

        .detail-item {
            margin-bottom: 14px;
        }

        .detail-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #9ca3af;
            margin-bottom: 3px;
        }

        .detail-value {
            font-size: 15px;
            color: #1a1f2e;
            font-weight: 500;
        }

        .expiry-warning {
            font-size: 15px;
            color: #dc2626;
            font-weight: 600;
        }

        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 28px 0;
        }

        /* ── Footer ── */
        .footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 22px 48px;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }

        .footer-text {
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            letter-spacing: 0.3px;
        }

        .footer-disclaimer {
            font-size: 10px;
            color: #b0b7c3;
            text-align: center;
            margin-top: 4px;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="page">

    {{-- Header --}}
    <div class="header">
        <div class="header-brand">Airona Globus</div>
        <div class="header-subtitle">Experiencias en globo aerostático</div>
        <div class="header-badge">Vale Experiencia</div>
    </div>
    <div class="gold-line"></div>

    {{-- Body --}}
    <div class="body">

        {{-- Experience name --}}
        <div class="experience-name">
            {{ optional($voucher->product->translation($voucher->locale ?? 'es'))->name ?? optional($voucher->product->translations->first())->name ?? '' }}
        </div>
        <div class="experience-tagline">
            {{ optional($voucher->product->translation($voucher->locale ?? 'es'))->short_description ?? '' }}
        </div>

        {{-- Voucher code --}}
        <div class="code-section">
            <div class="code-label">Código del vale</div>
            <div class="code-box">
                <span class="code-value">{{ $voucher->code }}</span>
            </div>
        </div>

        {{-- QR code --}}
        <div class="qr-section">
            <div class="qr-wrapper">
                {!! $qrCodeSvg !!}
            </div>
            <div class="qr-hint">Escanear al llegar</div>
        </div>

        <hr class="divider">

        {{-- Details --}}
        <div class="details-grid">

            @if($voucher->order?->customer_name ?? $voucher->customer_name ?? null)
            <div class="detail-item">
                <div class="detail-label">Titular</div>
                <div class="detail-value">{{ $voucher->order?->customer_name ?? $voucher->customer_name }}</div>
            </div>
            @endif

            <div class="detail-item">
                <div class="detail-label">Válido hasta</div>
                @if($voucher->expires_at)
                    <div class="expiry-warning">{{ \Carbon\Carbon::parse($voucher->expires_at)->format('d/m/Y') }}</div>
                @else
                    <div class="detail-value">Sin fecha de caducidad</div>
                @endif
            </div>

            @if($voucher->order)
            <div class="detail-item">
                <div class="detail-label">Número de pedido</div>
                <div class="detail-value">{{ $voucher->order->order_number }}</div>
            </div>
            @endif

        </div>

    </div>

    {{-- Footer --}}
    <div class="footer">
        <div class="footer-text">Airona Globus &middot; Experiencias en globo aerostático</div>
        <div class="footer-disclaimer">Este vale es personal e intransferible. No reembolsable.</div>
    </div>

</div>
</body>
</html>
