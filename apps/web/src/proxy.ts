import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * Protege as rotas autenticadas: sem sessao, redireciona para /login com o
 * destino original em `callbackUrl` para o Auth.js voltar pra la apos o login.
 */
export default auth((request) => {
  if (request.auth === null) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/vacancies/:path*',
    '/applications/:path*',
    '/leader/:path*',
  ],
};
