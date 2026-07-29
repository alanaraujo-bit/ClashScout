import 'dotenv/config';

import { defineConfig } from 'prisma/config';

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
 *
 * `process.env.DATABASE_URL` direto, e nao o helper `env()` de `prisma/config`:
 * aquele helper LANCA excecao se a variavel nao existir, e isso quebra
 * `prisma generate` - que nem toca o banco, so le o schema - em qualquer
 * ambiente sem DATABASE_URL configurada (CI, clone novo). `url` e opcional no
 * tipo `Datasource`; comandos que realmente precisam de conexao (migrate,
 * studio) ja falham sozinhos, com o erro claro do proprio Prisma.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
