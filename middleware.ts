import { NextRequest, NextResponse } from 'next/server';

// Protege /admin y las rutas de la API que usa el panel con un usuario y clave
// simples (HTTP Basic Auth). El navegador va a mostrar un cartelito pidiendo
// usuario y contraseña la primera vez.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse('Faltan configurar ADMIN_USER / ADMIN_PASSWORD', { status: 500 });
  }

  const authHeader = req.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [reqUser, reqPass] = decoded.split(':');
      if (reqUser === user && reqPass === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Acceso restringido', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Panel de administración"' },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/codes/:path*', '/api/settings/:path*'],
};
