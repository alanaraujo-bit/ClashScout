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

  // Banco de dados. Sem ela a API sobe, mas qualquer rota que toque o banco
  // falha - por isso o DatabaseModule valida a presenca no boot.
  DATABASE_URL: z.string().min(1).optional(),

  // --- Integracao com a API oficial da Supercell ---
  SUPERCELL_API_BASE_URL: z.url().default('https://api.clashofclans.com/v1'),
  SUPERCELL_API_TOKEN: z.string().optional(),

  /** TTL do cache de perfil de jogador. Protege o rate limit da Supercell. */
  SUPERCELL_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(600),

  /** Teto de requisicoes por segundo enviadas a Supercell. */
  SUPERCELL_RATE_LIMIT_PER_SECOND: z.coerce.number().positive().default(10),

  /** Timeout de cada chamada HTTP a Supercell. */
  SUPERCELL_TIMEOUT_MS: z.coerce.number().int().positive().default(8_000),
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
