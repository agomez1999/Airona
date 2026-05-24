<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Pago no procesado – Airona Globus</title>
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
                            Experiencias en globo aerostático
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

                        {{-- Alert icon area --}}
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                            <tr>
                                <td style="width:48px;height:48px;background:#fef2f2;border-radius:50%;text-align:center;vertical-align:middle;font-size:22px;">
                                    &#9888;
                                </td>
                            </tr>
                        </table>

                        <h1 style="font-size:22px;font-weight:700;color:#1a1f2e;margin:0 0 10px;">
                            No pudimos procesar tu pago
                        </h1>
                        <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
                            Ha ocurrido un problema al procesar el pago de tu pedido. No te preocupes:
                        </p>

                        {{-- Reassurance box --}}
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="padding:16px 20px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;">
                                    <p style="margin:0;font-size:15px;font-weight:700;color:#166534;">
                                        No se ha realizado ningún cargo en tu método de pago.
                                    </p>
                                </td>
                            </tr>
                        </table>

                        {{-- Order reference --}}
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                            <tr>
                                <td style="padding:14px 16px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
                                    <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Referencia de pedido</span><br>
                                    <span style="font-size:17px;font-weight:700;color:#1a1f2e;font-family:'Courier New',Courier,monospace;letter-spacing:2px;">
                                        {{ $order->order_number }}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        {{-- CTA button --}}
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="border-radius:6px;background-color:#c9a84c;text-align:center;">
                                    <a href="{{ $retryUrl }}"
                                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#1a1f2e;text-decoration:none;letter-spacing:0.5px;">
                                        Intentar de nuevo
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
                            Si el problema persiste, contacta con tu banco o prueba con otro método de pago.<br>
                            Estamos aquí para ayudarte si necesitas asistencia.
                        </p>

                    </td>
                </tr>

                {{-- ── Footer ── --}}
                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:22px 48px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                            Airona Globus &middot; Experiencias en globo aerostático
                        </p>
                        <p style="margin:6px 0 0;font-size:11px;color:#b0b7c3;">
                            Si tienes alguna duda, contáctanos respondiendo a este correo.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>
