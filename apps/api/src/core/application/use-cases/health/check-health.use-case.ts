import type { HealthCheckResponse } from '@clashscout/shared';

import { AppInfoPort } from '../../ports/app-info.port';

/**
 * Caso de uso de referencia: prova que a fatia vertical
 * (controller -> use case -> port -> adapter) esta ligada corretamente.
 * Classe pura, sem decorators - instanciada por factory no modulo Nest.
 */
export class CheckHealthUseCase {
  constructor(private readonly appInfo: AppInfoPort) {}

  execute(): HealthCheckResponse {
    const info = this.appInfo.getInfo();

    return {
      status: 'ok',
      service: info.service,
      version: info.version,
      environment: info.environment,
      uptimeSeconds: this.appInfo.getUptimeSeconds(),
      timestamp: new Date().toISOString(),
    };
  }
}
