import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET() {
  // El dominio "oficial" es el de la variable de entorno (el que realmente
  // vas a usar en producción). Se expone acá solo para mostrarlo en el panel.
  return NextResponse.json({ domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || '' });
}
