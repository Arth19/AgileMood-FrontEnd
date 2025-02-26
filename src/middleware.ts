import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('agile-mood-token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

  // Se não houver token, redireciona para o login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Adiciona o token no header de autorização
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Authorization', `Bearer ${token}`);

  // Retorna a resposta com os headers modificados
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/home/:path*',
    '/teams/:path*',
    '/profile/:path*',
    '/api/:path*',
  ],
}; 