import { createClient } from '@supabase/supabase-js';

// Este cliente usa la "service role key", que tiene permisos totales.
// Por eso SOLO se debe usar en el servidor (API routes), nunca en el navegador.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
