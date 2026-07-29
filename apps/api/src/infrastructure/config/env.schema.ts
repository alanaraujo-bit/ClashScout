import { z } from 'zod';

/**
 * Fonte unica de verdade das variaveis de ambiente.
 * A aplicacao falha no boot (fail fast) se algo obrigatorio estiver ausente,
 * em vez de quebrar em runtime dentro de um caso de uso.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // O Railway injeta PORT dinamicamente; localmente caimos em 3333.
  PORT: z.coerce.number().int().positive().default(3333),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Fase 2: obrigatorias quando o Prisma e a integracao entrarem.
  DATABASE_URL: z.string().min(1).optional(),
  SUPERCELL_API_BASE_URL: z.url().default('https://api.clashofclans.com/v1'),
  SUPERCELL_API_TOKEN: z.string().optional(),

  // Fase 3: autenticacao.
  JWT_SECRET: z.string().min(16).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variaveis de ambiente invalidas:\n${issues}`);
  }

  return parsed.data;
}
