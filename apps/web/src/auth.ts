import { PrismaAdapter } from '@auth/prisma-adapter';
import { UserRole } from '@clashscout/shared';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/session-cookie';

/**
 * Configuracao do Auth.js (NextAuth v5).
 *
 * Decisoes que valem registro:
 *
 * - `strategy: 'database'`. A sessao vive na tabela `Session`, nao num JWT.
 *   Isso permite que a API NestJS valide a mesma sessao lendo o banco, sem
 *   duplicar a criptografia de token entre dois runtimes, e torna a revogacao
 *   imediata: apagar a linha encerra o acesso.
 *
 * - Provider Google apenas. O vinculo com a conta do jogo NAO e login: e um
 *   passo separado (POST /api/v1/players/link na API), porque o API Token do
 *   Clash of Clans prova posse de conta do jogo, nao identidade de pessoa.
 *
 * - As variaveis AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET sao lidas automaticamente
 *   pelo provider, por convencao do Auth.js v5.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: 'database',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  // Nome e atributos fixos: o login por e-mail/senha (app-session.ts) cria a
  // sessao direto no banco e precisa gravar o cookie com exatamente esta config.
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: SESSION_COOKIE_OPTIONS,
    },
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * Enriquece a sessao com `id` e `role`, que o frontend usa para decidir o
     * que mostrar e a API usa para autorizar.
     */
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: UserRole }).role ?? UserRole.PLAYER;

      return session;
    },
  },
});
