/**
 * Token bucket simples para conter a taxa de chamadas a uma API externa.
 *
 * A Supercell nao publica o limite exato, e estourar resulta em 429 com bloqueio
 * temporario da chave. Preferimos enfileirar e atrasar a propria requisicao a
 * arriscar perder a chave: `acquire()` resolve quando ha credito disponivel.
 *
 * Nao e distribuido - vale por instancia do processo, igual ao cache em memoria.
 */
export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillAt: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
  ) {
    if (capacity <= 0 || refillPerSecond <= 0) {
      throw new Error('capacity e refillPerSecond precisam ser positivos.');
    }

    this.tokens = capacity;
    this.lastRefillAt = Date.now();
  }

  async acquire(): Promise<void> {
    for (;;) {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }

      // Tempo exato ate o proximo credito, em vez de poll cego.
      const waitMs = Math.ceil(((1 - this.tokens) / this.refillPerSecond) * 1_000);
      await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 1)));
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillAt) / 1_000;

    if (elapsedSeconds <= 0) {
      return;
    }

    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.lastRefillAt = now;
  }
}
