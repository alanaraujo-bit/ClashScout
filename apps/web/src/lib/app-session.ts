import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';

import { prisma } from './prisma';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
} from './session-cookie';

/**
 * Cria uma sessao de banco e grava o cookie que o Auth.js le.
 *
 * O login por e-mail/senha nao passa pelo Credentials provider do Auth.js de
 * proposito: aquele provider so sustenta sessao JWT, e a API NestJS valida
 * sessao lendo a tabela `Session` (estrategia 'database' - ver SessionGuard).
 * Aqui replicamos exatamente o que o adapter faz no login com Google: mesma
 * tabela, mesmo cookie. Para quem le a sessao depois, os dois fluxos de login
 * sao indistinguiveis.
 */
export async function createSessionCookie(userId: string): Promise<void> {
  const sessionToken = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, sessionToken, { ...SESSION_COOKIE_OPTIONS, expires });
}
