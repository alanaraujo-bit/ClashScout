/**
 * Configuracao do cookie de sessao, compartilhada entre `auth.ts` (NextAuth) e
 * `app-session.ts` (login por e-mail/senha, que cria a sessao na mao).
 *
 * Fixar isto explicitamente - em vez de confiar na deteccao automatica de
 * `useSecureCookies` do Auth.js a partir da URL da requisicao - garante que
 * os dois caminhos de login concordam sobre o nome e os atributos do cookie.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const SESSION_COOKIE_NAME = isProduction
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: isProduction,
};
