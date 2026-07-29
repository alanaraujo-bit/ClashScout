import { Injectable, Logger } from '@nestjs/common';
import { encodePlayerTagForApi } from '@clashscout/shared';

import { CachePort } from '../../core/application/ports/cache.port';
import {
  SupercellGatewayPort,
  type PlayerFetchResult,
} from '../../core/application/ports/supercell-gateway.port';
import { SupercellTokenPort } from '../../core/application/ports/supercell-token.port';
import type { SupercellPlayer } from '../../core/domain/entities/player-profile.entity';
import {
  PlayerNotFoundInSupercellError,
  SupercellAuthError,
  SupercellRateLimitedError,
  SupercellUnavailableError,
} from '../../core/domain/errors/integration.errors';
import type { PlayerTag } from '../../core/domain/value-objects/player-tag.vo';
import { AppConfigService } from '../config/app-config.service';
import { TokenBucketRateLimiter } from './rate-limiter';
import { toSupercellPlayer } from './supercell-player.mapper';

/** Prefixo das chaves de cache, para namespacing quando virar Redis. */
const CACHE_PREFIX = 'supercell:player:';

/**
 * Adapter HTTP da API oficial da Supercell.
 *
 * Tres protecoes empilhadas, na ordem em que atuam:
 * 1. cache com TTL - a maioria das leituras nunca sai do processo;
 * 2. rate limiter - o que sai fica abaixo do teto configurado;
 * 3. timeout - uma chamada presa nao prende a requisicao do usuario.
 */
@Injectable()
export class SupercellHttpGateway extends SupercellGatewayPort {
  private readonly logger = new Logger(SupercellHttpGateway.name);
  private readonly rateLimiter: TokenBucketRateLimiter;

  constructor(
    private readonly config: AppConfigService,
    private readonly cache: CachePort,
    private readonly tokenProvider: SupercellTokenPort,
  ) {
    super();
    const perSecond = config.supercellRateLimitPerSecond;
    this.rateLimiter = new TokenBucketRateLimiter(Math.max(Math.ceil(perSecond), 1), perSecond);
  }

  async fetchPlayer(tag: PlayerTag, forceRefresh = false): Promise<PlayerFetchResult> {
    const cacheKey = `${CACHE_PREFIX}${tag.value}`;

    if (!forceRefresh) {
      const cached = await this.cache.get<SupercellPlayer>(cacheKey);

      if (cached !== null) {
        return { player: cached, fromCache: true };
      }
    }

    const payload = await this.request(`/players/${encodePlayerTagForApi(tag.value)}`, {
      method: 'GET',
      notFoundError: () => new PlayerNotFoundInSupercellError(tag.value),
    });

    const player = toSupercellPlayer(payload);
    await this.cache.set(cacheKey, player, this.config.supercellCacheTtlSeconds);

    return { player, fromCache: false };
  }

  async verifyPlayerToken(tag: PlayerTag, apiToken: string): Promise<boolean> {
    // Sem cache de proposito: o token e de uso unico e expira em minutos.
    const payload = await this.request<{ status?: string }>(
      `/players/${encodePlayerTagForApi(tag.value)}/verifytoken`,
      {
        method: 'POST',
        body: { token: apiToken },
        notFoundError: () => new PlayerNotFoundInSupercellError(tag.value),
      },
    );

    return payload.status === 'ok';
  }

  /**
   * Ponto unico de saida HTTP: aplica rate limit, timeout e traduz cada status
   * da Supercell em um erro do nosso dominio.
   */
  private async request<T = unknown>(
    path: string,
    options: {
      method: 'GET' | 'POST';
      body?: unknown;
      notFoundError: () => Error;
    },
  ): Promise<T> {
    const token = await this.tokenProvider.getToken();
    await this.rateLimiter.acquire();

    const url = `${this.config.supercellBaseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(this.config.supercellTimeoutMs),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'erro de rede';
      this.logger.warn(`Falha de rede ao chamar ${path}: ${reason}`);
      throw new SupercellUnavailableError(reason);
    }

    if (response.ok) {
      return (await response.json()) as T;
    }

    throw this.toDomainError(response.status, path, options.notFoundError);
  }

  private toDomainError(status: number, path: string, notFoundError: () => Error): Error {
    switch (status) {
      case 400:
        // Tag mal formada chegando aqui indica bug nosso: o VO deveria ter barrado.
        this.logger.error(`Supercell recusou a requisicao como invalida: ${path}`);
        return new SupercellUnavailableError('requisicao recusada como invalida (400)');

      case 403:
        // O caso mais comum: IP de saida fora da allowlist do token.
        this.logger.error(
          `Supercell retornou 403 em ${path}. Verifique se o IP de saida esta na ` +
            'allowlist da chave no developer portal.',
        );
        return new SupercellAuthError('token invalido ou IP de saida nao autorizado (403)');

      case 404:
        return notFoundError();

      case 429:
        this.logger.warn(`Rate limit da Supercell atingido em ${path}.`);
        return new SupercellRateLimitedError();

      case 503:
        // Retornado durante manutencao do jogo.
        return new SupercellUnavailableError('jogo em manutencao (503)');

      default:
        this.logger.warn(`Supercell retornou status inesperado ${status} em ${path}.`);
        return new SupercellUnavailableError(`status inesperado ${status}`);
    }
  }
}
