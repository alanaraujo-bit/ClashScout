import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

import { CachePort } from '../../core/application/ports/cache.port';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Teto de entradas. Evita que o cache cresca sem limite e vire vazamento. */
const MAX_ENTRIES = 5_000;

/** Frequencia da limpeza de entradas expiradas. */
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Cache em memoria com TTL.
 *
 * Escolhido como implementacao inicial por ser suficiente para uma unica
 * instancia e nao exigir infraestrutura extra. A troca por Redis e a
 * substituicao desta classe no modulo - o `CachePort` nao muda.
 *
 * Limitacao consciente: com mais de uma instancia da API, cada uma tera seu
 * proprio cache, e a taxa de chamadas a Supercell cresce proporcionalmente ao
 * numero de instancias. Ao escalar horizontalmente, migrar para Redis.
 */
@Injectable()
export class InMemoryCacheService extends CachePort implements OnModuleDestroy {
  private readonly logger = new Logger(InMemoryCacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly sweeper: NodeJS.Timeout;

  constructor() {
    super();
    this.sweeper = setInterval(() => this.sweepExpired(), SWEEP_INTERVAL_MS);
    // Um timer pendente nao deve impedir o processo de encerrar.
    this.sweeper.unref();
  }

  get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (entry === undefined) {
      return Promise.resolve(null);
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return Promise.resolve(null);
    }

    // Reinsere para que a ordem do Map reflita uso recente (base do descarte).
    this.store.delete(key);
    this.store.set(key, entry);

    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.store.size >= MAX_ENTRIES && !this.store.has(key)) {
      this.evictOldest();
    }

    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1_000 });

    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.store.clear();
    return Promise.resolve();
  }

  onModuleDestroy(): void {
    clearInterval(this.sweeper);
    this.store.clear();
  }

  /** Descarta a entrada menos recentemente usada (primeira do Map). */
  private evictOldest(): void {
    const oldest = this.store.keys().next();

    if (!oldest.done) {
      this.store.delete(oldest.value);
    }
  }

  private sweepExpired(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`${removed} entrada(s) expirada(s) removida(s) do cache.`);
    }
  }
}
