import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * Acesso tipado a configuracao. Nenhuma outra classe le `process.env`
 * diretamente - assim trocar a fonte de config nao vaza para as demais camadas.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get corsOrigins(): string[] {
    return this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  /** `undefined` quando o banco nao foi configurado - o DatabaseModule reclama. */
  get databaseUrl(): string | undefined {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get supercellBaseUrl(): string {
    return this.config.get('SUPERCELL_API_BASE_URL', { infer: true });
  }

  get supercellToken(): string | undefined {
    return this.config.get('SUPERCELL_API_TOKEN', { infer: true });
  }

  get supercellCacheTtlSeconds(): number {
    return this.config.get('SUPERCELL_CACHE_TTL_SECONDS', { infer: true });
  }

  get supercellRateLimitPerSecond(): number {
    return this.config.get('SUPERCELL_RATE_LIMIT_PER_SECOND', { infer: true });
  }

  get supercellTimeoutMs(): number {
    return this.config.get('SUPERCELL_TIMEOUT_MS', { infer: true });
  }
}
