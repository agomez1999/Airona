<!DOCTYPE html>
<html lang="{{ $locale ?? 'es' }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    @if($locale === 'ca')
        <title>Confirmació de comanda – Airona Globus</title>
    @elseif($locale === 'fr')
        <title>Confirmation de commande – Airona Globus</title>
    @elseif($locale === 'en')
        <title>Order confirmation – Airona Globus</title>
    @else
        <title>Confirmación de pedido – Airona Globus</title>
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
                        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a0a8bb;margin-top:4px;">
                            @if($locale === 'ca')
                                Experiències en globus aerostàtic
                            @elseif($locale === 'fr')
                                Expériences en montgolfière
                            @elseif($locale === 'en')
                                Hot air balloon experiences
                            @else
                                Experiencias en globo aerostático
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
                                Gràcies per la teva compra!
                            @elseif($locale === 'fr')
                                Merci pour votre achat !
                            @elseif($locale === 'en')
                                Thank you for your purchase!
                            @else
                                ¡Gracias por tu compra!
                            @endif
                        </h1>
                        <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">
                            @if($locale === 'ca')
                                Hem rebut la teva comanda correctament.
                            @elseif($locale === 'fr')
                                Nous avons bien reçu votre commande.
                            @elseif($locale === 'en')
                                We have received your order successfully.
                            @else
                                Hemos recibido tu pedido correctamente.
                            @endif
                        </p>

                        {{-- Order details --}}
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="padding:14px 16px;background:#f9fafb;border-radius:6px 6px 0 0;border-bottom:1px solid #e5e7eb;">
                                    <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">
                                        @if($locale === 'ca')
                                            Número de comanda
                                        @elseif($locale === 'fr')
                                            Numéro de commande
                                        @elseif($locale === 'en')
                                            Order number
                                        @else
                                            Número de pedido
                                        @endif
                                    </span><br>
                                    <span style="font-size:17px;font-weight:700;color:#1a1f2e;font-family:'Courier New',Courier,monospace;letter-spacing:2px;">
                                        {{ $order->order_number }}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:14px 16px;background:#f9fafb;border-radius:0 0 6px 6px;">
                                    <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Email</span><br>
                                    <span style="font-size:15px;color:#374151;">{{ $order->customer_email }}</span>
                                </td>
                            </tr>
                        </table>

                        {{-- Items list --}}
                        <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin:0 0 10px;">
                            @if($locale === 'ca')
                                Resum de la comanda
                            @elseif($locale === 'fr')
                                Récapitulatif de la commande
                            @elseif($locale === 'en')
                                Order summary
                            @else
                                Resumen del pedido
                            @endif
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
                            @foreach($order->items as $item)
                            <tr style="border-bottom:{{ $loop->last ? 'none' : '1px solid #e5e7eb' }};">
                                <td style="padding:12px 16px;font-size:14px;color:#374151;">
                                    {{ $item->product_name ?? ($item->product?->name ?? '—') }}
                                    @if($item->quantity > 1)
                                        <span style="color:#9ca3af;">&times;{{ $item->quantity }}</span>
                                    @endif
                                </td>
                                <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:600;color:#1a1f2e;white-space:nowrap;">
                                    {{ number_format($item->unit_price_cents / 100, 2, ',', '.') }}&nbsp;€
                                </td>
                            </tr>
                            @endforeach
                            <tr style="background:#f9fafb;border-top:2px solid #e5e7eb;">
                                <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#1a1f2e;">
                                    Total
                                </td>
                                <td style="padding:14px 16px;text-align:right;font-size:17px;font-weight:700;color:#c9a84c;white-space:nowrap;">
                                    {{ number_format($order->total_cents / 100, 2, ',', '.') }}&nbsp;€
                                </td>
                            </tr>
                        </table>

                        {{-- Voucher note --}}
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding:16px 20px;background:#fdfaf3;border:1px solid #c9a84c;border-radius:6px;">
                                    <p style="margin:0;font-size:14px;color:#92740a;line-height:1.6;">
                                        @if($locale === 'ca')
                                            <strong>Rebràs els teus vals en un email separat en els propers minuts.</strong><br>
                                            Cada val inclourà un codi QR llest per presentar el dia de la teva experiència.
                                        @elseif($locale === 'fr')
                                            <strong>Vous recevrez vos bons dans un e-mail séparé dans les prochaines minutes.</strong><br>
                                            Chaque bon inclura un code QR prêt à présenter le jour de votre expérience.
                                        @elseif($locale === 'en')
                                            <strong>You will receive your vouchers in a separate email within the next few minutes.</strong><br>
                                            Each voucher will include a QR code ready to present on the day of your experience.
                                        @else
                                            <strong>Recibirás tus vales en un email separado en los próximos minutos.</strong><br>
                                            Cada vale incluirá un código QR listo para presentar el día de tu experiencia.
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
