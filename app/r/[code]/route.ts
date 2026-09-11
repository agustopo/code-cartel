import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Esta ruta es a la que apunta el QR impreso: tusitio.com/r/CODIGO
// Busca el link guardado para ese código y redirige para allá.
// Si todavía no tiene link cargado, muestra una página simple de "en preparación".
//
// IMPORTANTE: forzamos que sea siempre dinámica. Sin esto, Next.js puede
// cachear la respuesta y servir un link viejo hasta la próxima revalidación,
// que es justo el retraso que se estaba viendo al actualizar el link.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code?.toUpperCase();
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error || !data) {
    return new NextResponse(pageHtml('Este código no existe.'), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' },
    });
  }

  if (!data.link) {
    return new NextResponse(pendingPageHtml(), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' },
    });
  }

  // Registra el escaneo (no bloquea la redirección si falla)
  supabase.from('scans').insert({ code }).then(() => {});

  return NextResponse.redirect(data.link, {
    status: 302,
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  });
}

function pageHtml(message: string) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carteles QR</title>
<style>
  body{font-family:system-ui,sans-serif;background:#ECEEF0;color:#14181C;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;}
  .box{max-width:360px;}
  p{font-size:15px;line-height:1.5;color:#333;}
</style></head>
<body><div class="box"><p>${message}</p></div></body></html>`;
}

// Página que se muestra cuando el cartel todavía no tiene un link de reseña
// asignado. Datos de contacto y de pago fijos (editar acá si cambian).
function pendingPageHtml() {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;}
  body{margin:0;background:#5B34E0;color:#fff;font-family:'Baloo 2',system-ui,sans-serif;display:flex;justify-content:center;padding:40px 20px 56px;}
  .wrap{max-width:420px;width:100%;text-align:center;}
  .logo{display:flex;flex-direction:column;align-items:center;margin-bottom:28px;}
  .logo svg{width:36px;height:auto;margin-bottom:2px;}
  .logo span{font-weight:800;font-size:28px;letter-spacing:0.5px;}
  h1{font-size:26px;line-height:1.25;font-weight:700;margin:0 0 26px;}
  h1 .gold{color:#F5B324;}
  .importante{color:#F5B324;font-weight:800;font-size:20px;letter-spacing:1px;margin-bottom:14px;}
  .contacto{font-weight:700;font-size:17px;line-height:1.4;margin-bottom:22px;}
  .terminos{color:#F5B324;font-size:13.5px;line-height:1.6;margin-bottom:26px;}
  .terminos b{font-weight:800;}
  .pago{font-weight:700;font-size:14.5px;line-height:1.7;margin-bottom:18px;}
  .total{font-weight:800;font-size:16px;margin-bottom:34px;}
  .total .gold{color:#F5B324;}
  .iconos{display:flex;justify-content:center;gap:34px;margin-bottom:34px;}
  .icono{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;font-weight:600;}
  .icono svg{width:30px;height:30px;}
  .footer-logo{display:flex;flex-direction:column;align-items:center;}
  .footer-logo svg{width:26px;height:auto;margin-bottom:2px;}
  .footer-logo span{font-weight:800;font-size:22px;}
</style></head>
<body>
  <div class="wrap">
    <div class="logo">
      <svg viewBox="0 0 24 14" fill="none"><path d="M2 12c5.5-8 14.5-8 20 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M6.5 12c3.5-5 7.5-5 11 0" stroke="#F5B324" stroke-width="2.2" stroke-linecap="round"/></svg>
      <span>Revi</span>
    </div>

    <h1><span class="gold">Este cartel</span> todavía está siendo configurado. Volvé a intentarlo <span class="gold">más tarde.</span></h1>

    <div class="importante">IMPORTANTE</div>
    <div class="contacto">Enviá tu dirección y nombre del comercio al 2323-328484</div>

    <div class="terminos">
      Una vez activado y verificado el correcto funcionamiento del cartel, podrás utilizarlo con normalidad.
      El pago se realizará mediante transferencia bancaria.
      En caso de no efectuarse el pago, los códigos QR y el sistema NFC <b>serán desactivados.</b>
    </div>

    <div class="pago">
      Alias: cartel.revi<br>
      CBU: 3840200500000023167724<br>
      AGUSTIN QUELLE<br>
      Banco: Ualá Bank S.A.U.
    </div>

    <div class="total">TOTAL: <span class="gold">QR $25.000</span> / <span class="gold">QR + NFC $35.000</span></div>

    <div class="iconos">
      <div class="icono">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M3 12l4-4h5l9 9-5 5-9-9V8"/><circle cx="8" cy="8" r="1.2" fill="#fff"/></svg>
        Pago único
      </div>
      <div class="icono">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M4 12c4.5-6.5 11.5-6.5 16 0M7 15c2.8-3.8 6.2-3.8 9 0" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="#fff"/></svg>
        Tecnología NFC
      </div>
      <div class="icono">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><rect x="8" y="7" width="3" height="3"/><rect x="13" y="7" width="3" height="3"/><rect x="8" y="12" width="3" height="3"/></svg>
        QR dinámico
      </div>
    </div>

    <div class="footer-logo">
      <svg viewBox="0 0 24 14" fill="none"><path d="M2 12c5.5-8 14.5-8 20 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M6.5 12c3.5-5 7.5-5 11 0" stroke="#F5B324" stroke-width="2.2" stroke-linecap="round"/></svg>
      <span>Revi</span>
    </div>
  </div>
</body></html>`;
}
</body></html>`;
}
