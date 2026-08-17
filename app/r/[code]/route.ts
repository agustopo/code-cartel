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
    return new NextResponse(pageHtml('Este cartel todavía está siendo configurado. Volvé a intentar más tarde.'), {
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
