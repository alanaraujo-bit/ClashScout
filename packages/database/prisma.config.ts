import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

/**
 * Configuracao do Prisma CLI (migrate, studio, generate).
 *
 * A partir do Prisma 7 a URL de conexao sai do schema e vem para ca. Esta URL e
 * usada apenas por comandos de linha de comando; em runtime a aplicacao injeta
 * a conexao via driver adapter (ver PrismaService na api).
 *
 * Localmente aponte DATABASE_URL para a URL publica do Postgres do Railway
 * (`DATABASE_PUBLIC_URL` no painel), ja que o host interno `.railway.internal`
 * so resolve de dentro da rede do Railway.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
