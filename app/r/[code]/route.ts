import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Esta ruta es a la que apunta el QR impreso: tusitio.com/r/CODIGO
// Busca el link guardado para ese código y redirige para allá.
// Si todavía no tiene link cargado, muestra una página simple de "en preparación".
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
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (!data.link) {
    return new NextResponse(pendingHtml(), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  // Registra el escaneo (no bloquea la redirección si falla)
  supabase.from('scans').insert({ code }).then(() => {});

  return NextResponse.redirect(data.link, { status: 302 });
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

// Página que se muestra cuando el cartel todavía no tiene link asignado.
// Diseño alineado a la identidad de marca (Revi).
function pendingHtml() {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revi</title>
<style>
  *{box-sizing:border-box;}
  body{font-family:'Poppins',system-ui,sans-serif;background:#5B36D6;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:32px 24px;text-align:center;}
  .box{max-width:420px;}
  h1{font-size:28px;line-height:1.25;font-weight:700;margin:0 0 20px;}
  h1 .accent{color:#F6C445;}
  p.sub{font-size:13px;line-height:1.6;color:#E4DEFA;margin:0 0 28px;text-transform:uppercase;letter-spacing:.3px;}
  .pago{font-size:14px;line-height:1.7;color:#fff;margin:0 0 20px;}
  .pago strong{font-weight:700;}
  .total{font-size:20px;font-weight:700;color:#fff;margin:0 0 8px;}
  .brand{margin-top:20px;width:120px;height:auto;}
</style></head>
<body>
  <div class="box">
    <h1><span class="accent">Este cartel</span> todavía está siendo configurado. Volvé a intentarlo <span class="accent">más tarde.</span></h1>
    <p class="sub">Una vez que el cartel sea activado y verificado, podrás utilizarlo con normalidad. El pago se realiza mediante transferencia una vez comprobado su correcto funcionamiento.</p>
    <p class="pago">
      Alias: <strong>cartel.revi</strong><br>
      CBU: <strong>3840200500000023167724</strong><br>
      <strong>AGUSTIN QUELLE</strong><br>
      Banco: <strong>Ualá Bank S.A.U.</strong>
    </p>
    <p class="total">TOTAL $35.000</p>
    <img class="brand" src="/revi-logo.png" alt="Revi" />
  </div>
</body></html>`;
}
