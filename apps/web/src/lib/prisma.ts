import { createPrismaClient, type PrismaClient } from '@clashscout/database';

/**
 * Client do Prisma para o app web.
 *
 * O app web toca o banco APENAS para o Auth.js (tabelas User/Account/Session).
 * Todo o resto do dominio passa pela API. Manter essa fronteira e o que impede
 * a regra de negocio de vazar para o frontend.
 */

declare global {
  var __clashscoutPrisma: PrismaClient | undefined;
}

function instantiate(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString === undefined || connectionString.trim() === '') {
    throw new Error(
      'DATABASE_URL nao configurada no app web. O Auth.js precisa dela para ' +
        'persistir usuarios e sessoes.',
    );
  }

  // Em dev o Next recarrega modulos a cada edicao; sem o cache global cada
  // reload abriria um novo pool de conexoes ate o Postgres recusar.
  const client =
    globalThis.__clashscoutPrisma ??
    createPrismaClient({
      connectionString,
      logQueries: process.env.NODE_ENV === 'development',
    });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__clashscoutPrisma = client;
  }

  return client;
}

let cached: PrismaClient | undefined;

/**
 * Proxy de inicializacao tardia: a conexao so nasce no primeiro acesso real.
 *
 * Necessario porque `next build` importa os modulos de rota para analisa-los.
 * Com criacao eager, um build sem DATABASE_URL no ambiente falharia na
 * importacao - erro de build por uma variavel que so e usada em runtime.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    cached ??= instantiate();

    return Reflect.get(cached, property, receiver);
  },
});
