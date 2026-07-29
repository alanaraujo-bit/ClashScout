import { Module } from '@nestjs/common';

import { AppInfoPort } from '../../../core/application/ports/app-info.port';
import { CheckHealthUseCase } from '../../../core/application/use-cases/health/check-health.use-case';
import { AppInfoProvider } from '../../../infrastructure/app-info/app-info.provider';
import { HealthController } from './health.controller';

/**
 * O modulo e o unico ponto de amarracao: liga a porta ao adapter e monta o
 * caso de uso por factory, mantendo o core livre de decorators do Nest.
 */
@Module({
  controllers: [HealthController],
  providers: [
    { provide: AppInfoPort, useClass: AppInfoProvider },
    {
      provide: CheckHealthUseCase,
      useFactory: (appInfo: AppInfoPort) => new CheckHealthUseCase(appInfo),
      inject: [AppInfoPort],
    },
  ],
})
export class HealthModule {}
