import { TokenBucketRateLimiter } from './rate-limiter';

describe('TokenBucketRateLimiter', () => {
  it('libera imediatamente enquanto ha credito no bucket', async () => {
    const limiter = new TokenBucketRateLimiter(3, 3);
    const startedAt = Date.now();

    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();

    // As tres primeiras cabem na capacidade inicial: nao devem esperar.
    expect(Date.now() - startedAt).toBeLessThan(50);
  });

  it('faz a chamada seguinte esperar quando o bucket esvazia', async () => {
    // Capacidade 1 e recarga de 20/s => ~50ms para o proximo credito.
    const limiter = new TokenBucketRateLimiter(1, 20);

    await limiter.acquire();
    const startedAt = Date.now();
    await limiter.acquire();

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(30);
  });

  it('recompoe credito com o passar do tempo', async () => {
    const limiter = new TokenBucketRateLimiter(2, 50);

    await limiter.acquire();
    await limiter.acquire();
    await new Promise((resolve) => setTimeout(resolve, 80));

    const startedAt = Date.now();
    await limiter.acquire();

    expect(Date.now() - startedAt).toBeLessThan(30);
  });

  it('rejeita configuracao invalida', () => {
    expect(() => new TokenBucketRateLimiter(0, 10)).toThrow();
    expect(() => new TokenBucketRateLimiter(10, 0)).toThrow();
  });
});
