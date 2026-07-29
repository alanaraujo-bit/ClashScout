import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export interface CreatePrismaClientOptions {
  connectionString: string;
  /** Loga cada query. Util em desenvolvimento; ruidoso e caro em producao. */
  logQueries?: boolean;
}

/**
 * Unico lugar que sabe COMO o client se conecta.
 *
 * A partir do Prisma 7 a conexao entra por um driver adapter em vez da `url` do
 * schema. Encapsular isso aqui evita que `apps/api` (e qualquer outro consumidor)
 * dependa de `@prisma/adapter-pg` e do detalhe de qual driver esta em uso.
 */
export function createPrismaClient({
  connectionString,
  logQueries = false,
}: CreatePrismaClientOptions): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: logQueries ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });
}
