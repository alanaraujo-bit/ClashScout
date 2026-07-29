import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResponse } from '@clashscout/shared';

import { CheckHealthUseCase } from '../../../core/application/use-cases/health/check-health.use-case';

/**
 * Camada de apresentacao: traduz HTTP <-> caso de uso. Sem regra de negocio.
 * Rota final: GET /api/v1/health (usada tambem pelo healthcheck do Railway).
 */
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  @Get()
  handle(): HealthCheckResponse {
    return this.checkHealth.execute();
  }
}
