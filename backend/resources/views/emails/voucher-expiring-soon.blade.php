<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tu vale caduca pronto — Airona Globus</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1f2e;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Airona Globus</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:normal;letter-spacing:1px;">⚠️ Tu vale caduca pronto</h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px;">
          <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
            @if($voucher->customer_name)
            Hola <strong>{{ $voucher->customer_name }}</strong>,
            @else
            Hola,
            @endif
          </p>

          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            Tu vale para <strong>{{ $voucher->product?->name ?? 'Experiencia en globo' }}</strong> caduca el
            <strong style="color:#dc2626;">{{ $voucher->expires_at?->format('d/m/Y') }}</strong>.
            ¡No dejes escapar tu experiencia!
          </p>

          <!-- Voucher code -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr>
              <td style="background:#f9f5ec;border:2px solid #c9a84c;border-radius:8px;padding:20px;text-align:center;">
                <p style="margin:0 0 4px;color:#6b7280;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Código de vale</p>
                <p style="margin:0;color:#1a1f2e;font-size:24px;font-family:'Courier New',monospace;letter-spacing:4px;font-weight:bold;">{{ $voucher->code }}</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
            <tr>
              <td align="center">
                <a href="{{ $downloadUrl }}" style="display:inline-block;background:#c9a84c;color:#1a1f2e;text-decoration:none;padding:14px 32px;border-radius:6px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;letter-spacing:0.5px;">
                  Descargar mi vale (PDF)
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
            Para reservar tu experiencia, contacta con nosotros respondiendo a este email o visita nuestra web.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;font-family:Arial,sans-serif;">
            Airona Globus · Experiencias en globo aerostático<br>
            Este vale es personal e intransferible.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
