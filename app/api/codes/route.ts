import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = supabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const link = (body.link || '').trim();
  const status = link ? 'active' : 'pending';

  const { data, error } = await supabase
    .from('codes')
    .update({ link, status })
    .eq('code', params.code.toUpperCase())
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from('codes').delete().eq('code', params.code.toUpperCase());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
