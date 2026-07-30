import { cookies } from 'next/headers';

const SESSION_COOKIE_NAMES = ['__Secure-authjs.session-token', 'authjs.session-token'];

/**
 * Le o token de sessao bruto gravado pelo Auth.js, direto do cookie.
 *
 * Existe porque a sessao usa `strategy: 'database'`: o callback `session()` do
 * NextAuth nao recebe o token (so `user`), entao e o unico jeito de obter o
 * mesmo valor que a API NestJS espera no header `Authorization: Bearer`. So
 * pode ser chamado em Server Components, Server Actions ou Route Handlers.
 */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();

  for (const name of SESSION_COOKIE_NAMES) {
    const value = jar.get(name)?.value;

    if (value !== undefined && value !== '') {
      return value;
    }
  }

  return null;
}
