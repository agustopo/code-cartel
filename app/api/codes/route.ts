import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I/L

function randomCode() {
  let c = '';
  for (let i = 0; i < 6; i++) c += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return c;
}

export async function GET() {
  const supabase = supabaseAdmin();

  const { data: codes, error } = await supabase
    .from('codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: scans } = await supabase.from('scans').select('code');
  const scanCounts: Record<string, number> = {};
  (scans || []).forEach((s: any) => {
    scanCounts[s.code] = (scanCounts[s.code] || 0) + 1;
  });

  const result = (codes || []).map((c: any) => ({ ...c, scanCount: scanCounts[c.code] || 0 }));
  return NextResponse.json({ codes: result });
}

export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const business = (body.business || '').trim() || '(sin nombre)';

  let code = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = randomCode();
    const { data } = await supabase.from('codes').select('code').eq('code', candidate).maybeSingle();
    if (!data) {
      code = candidate;
      break;
    }
  }
  if (!code) return NextResponse.json({ error: 'No se pudo generar un código único, probá de nuevo.' }, { status: 500 });

  const { data: inserted, error } = await supabase
    .from('codes')
    .insert({ code, business, link: '', status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: inserted });
}
