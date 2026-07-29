import { InMemoryCacheService } from './in-memory-cache.service';

describe('InMemoryCacheService', () => {
  let cache: InMemoryCacheService;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new InMemoryCacheService();
  });

  afterEach(() => {
    cache.onModuleDestroy();
    jest.useRealTimers();
  });

  it('devolve o valor gravado antes do TTL vencer', async () => {
    await cache.set('chave', { trophies: 3000 }, 60);

    await expect(cache.get<{ trophies: number }>('chave')).resolves.toEqual({ trophies: 3000 });
  });

  it('devolve null depois do TTL vencer', async () => {
    await cache.set('chave', 'valor', 10);

    jest.advanceTimersByTime(10_001);

    await expect(cache.get('chave')).resolves.toBeNull();
  });

  it('devolve null para chave inexistente', async () => {
    await expect(cache.get('nunca-gravada')).resolves.toBeNull();
  });

  it('remove a chave no delete', async () => {
    await cache.set('chave', 'valor', 60);
    await cache.delete('chave');

    await expect(cache.get('chave')).resolves.toBeNull();
  });

  it('esvazia tudo no clear', async () => {
    await cache.set('a', 1, 60);
    await cache.set('b', 2, 60);
    await cache.clear();

    await expect(cache.get('a')).resolves.toBeNull();
    await expect(cache.get('b')).resolves.toBeNull();
  });
});
