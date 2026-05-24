<!DOCTYPE html>
<html lang="{{ $locale ?? 'es' }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    @if($locale === 'ca')
        <title>El teu val d'experiència – Airona Globus</title>
    @elseif($locale === 'fr')
        <title>Votre bon d'expérience – Airona Globus</title>
    @elseif($locale === 'en')
        <title>Your experience voucher – Airona Globus</title>
    @else
        <title>Tu vale de experiencia – Airona Globus</title>
    @endif
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            color: #374151;
            -webkit-text-size-adjust: 100%;
        }
        table { border-collapse: collapse; }
        img { display: block; border: 0; }
        a { color: #c9a84c; text-decoration: none; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 16px;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                {{-- ── Header ── --}}
                <tr>
                    <td style="background-color:#1a1f2e;padding:36px 48px 28px;text-align:left;">
                        <div style="font-size:24px;font-weight:700;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">
                            Airona Globus
                        </div>
                        <div style="font-size:13px;letter-spacing:1px;color:#a0a8bb;margin-top:6px;">
                            @if($locale === 'ca')
                                El teu val d'experiència
                            @elseif($locale === 'fr')
                                Votre bon d'expérience
                            @elseif($locale === 'en')
                                Your experience voucher
                            @else
                                Tu vale de experiencia
                            @endif
                        </div>
                    </td>
                </tr>

                {{-- ── Gold line ── --}}
                <tr>
                    <td style="height:3px;background-color:#c9a84c;font-size:0;line-height:0;">&nbsp;</td>
                </tr>

                {{-- ── Body ── --}}
                <tr>
                    <td style="padding:40px 48px;">

                        <h1 style="font-size:22px;font-weight:700;color:#1a1f2e;margin:0 0 8px;">
                            @if($locale === 'ca')
                                La teva experiència t'espera!
                            @elseif($locale === 'fr')
                                Votre expérience vous attend !
                            @elseif($locale === 'en')
                                Your experience awaits!
                            @else
                                ¡Tu experiencia te espera!
                            @endif
                        </h1>
                        <p style="font-size:15px;color:#6b7280;margin:0 0 28px;">
                            @if($locale === 'ca')
                                Aquí tens el teu val per a:
                            @elseif($locale === 'fr')
                                Voici votre bon pour :
                            @elseif($locale === 'en')
                                Here is your voucher for:
                            @else
                                Aquí tienes tu vale para:
                            @endif
                        </p>

                        {{-- Experience name --}}
                        <p style="font-size:20px;font-weight:700;color:#1a1f2e;margin:0 0 28px;line-height:1.3;">
                            {{ optional($voucher->product->translation($voucher->locale ?? 'es'))->name ?? optional($voucher->product->translations->first())->name ?? 'Experiencia en globo' }}
                        </p>

                        {{-- Voucher code box --}}
                        <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 10px;">
                            @if($locale === 'ca')
                                Codi del val
                            @elseif($locale === 'fr')
                                Code du bon
                            @elseif($locale === 'en')
                                Voucher code
                            @else
                                Código del vale
                            @endif
                        </p>
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="padding:18px 28px;background:#fdfaf3;border:2px solid #c9a84c;border-radius:6px;">
                                    <span style="font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:700;letter-spacing:6px;color:#1a1f2e;">
                                        {{ $voucher->code }}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        {{-- Expiry date --}}
                        @if($voucher->expires_at)
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="padding:12px 16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;">
                                    <span style="font-size:13px;font-weight:700;color:#dc2626;">
                                        @if($locale === 'ca')
                                            Vàlid fins: {{ \Carbon\Carbon::parse($voucher->expires_at)->format('d/m/Y') }}
                                        @elseif($locale === 'fr')
                                            Valable jusqu'au : {{ \Carbon\Carbon::parse($voucher->expires_at)->format('d/m/Y') }}
                                        @elseif($locale === 'en')
                                            Valid until: {{ \Carbon\Carbon::parse($voucher->expires_at)->format('d/m/Y') }}
                                        @else
                                            Válido hasta: {{ \Carbon\Carbon::parse($voucher->expires_at)->format('d/m/Y') }}
                                        @endif
                                    </span>
                                </td>
                            </tr>
                        </table>
                        @endif

                        {{-- CTA button --}}
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                            <tr>
                                <td style="border-radius:6px;background-color:#c9a84c;text-align:center;">
                                    <a href="{{ $downloadUrl }}"
                                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#1a1f2e;text-decoration:none;letter-spacing:0.5px;">
                                        @if($locale === 'ca')
                                            Descarregar el meu val (PDF)
                                        @elseif($locale === 'fr')
                                            Télécharger mon bon (PDF)
                                        @elseif($locale === 'en')
                                            Download my voucher (PDF)
                                        @else
                                            Descargar mi vale (PDF)
                                        @endif
                                    </a>
                                </td>
                            </tr>
                        </table>

                        {{-- Instructions --}}
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding:16px 20px;background:#f0f4ff;border-left:4px solid #6366f1;border-radius:0 6px 6px 0;">
                                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
                                        @if($locale === 'ca')
                                            <strong>Instruccions:</strong><br>
                                            Presenta aquest val el dia de la teva experiència. El personal escanejarà el codi QR a la teva arribada. També pots descarregar el PDF per tenir-lo disponible sense connexió.
                                        @elseif($locale === 'fr')
                                            <strong>Instructions :</strong><br>
                                            Présentez ce bon le jour de votre expérience. Le personnel scannera le code QR à votre arrivée. Vous pouvez également télécharger le PDF pour l'avoir disponible hors ligne.
                                        @elseif($locale === 'en')
                                            <strong>Instructions:</strong><br>
                                            Present this voucher on the day of your experience. Staff will scan the QR code on your arrival. You can also download the PDF to have it available offline.
                                        @else
                                            <strong>Instrucciones:</strong><br>
                                            Presenta este vale el día de tu experiencia. El personal escaneará el código QR a tu llegada. También puedes descargar el PDF para tenerlo disponible sin conexión.
                                        @endif
                                    </p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>

                {{-- ── Footer ── --}}
                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:22px 48px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                            @if($locale === 'ca')
                                Airona Globus &middot; Experiències en globus aerostàtic
                            @elseif($locale === 'fr')
                                Airona Globus &middot; Expériences en montgolfière
                            @elseif($locale === 'en')
                                Airona Globus &middot; Hot air balloon experiences
                            @else
                                Airona Globus &middot; Experiencias en globo aerostático
                            @endif
                        </p>
                        <p style="margin:6px 0 0;font-size:11px;color:#b0b7c3;">
                            @if($locale === 'ca')
                                Si tens algun dubte, contacta'ns responent aquest correu.
                            @elseif($locale === 'fr')
                                Si vous avez des questions, contactez-nous en répondant à cet e-mail.
                            @elseif($locale === 'en')
                                If you have any questions, contact us by replying to this email.
                            @else
                                Si tienes alguna duda, contáctanos respondiendo a este correo.
                            @endif
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>
