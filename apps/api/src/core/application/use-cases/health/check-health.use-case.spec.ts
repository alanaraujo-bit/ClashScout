import { AppInfoPort, type AppInfo } from '../../ports/app-info.port';
import { CheckHealthUseCase } from './check-health.use-case';

class AppInfoStub extends AppInfoPort {
  getInfo(): AppInfo {
    return { service: 'ClashScout API', version: '0.1.0', environment: 'test' };
  }

  getUptimeSeconds(): number {
    return 42;
  }
}

describe('CheckHealthUseCase', () => {
  it('monta a resposta de health a partir da porta injetada', () => {
    const useCase = new CheckHealthUseCase(new AppInfoStub());

    const result = useCase.execute();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('ClashScout API');
    expect(result.environment).toBe('test');
    expect(result.uptimeSeconds).toBe(42);
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
