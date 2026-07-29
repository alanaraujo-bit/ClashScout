import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config/app-config.module';
import { HealthModule } from './presentation/modules/health/health.module';

/**
 * Modulo raiz. Apenas compoe modulos - nao declara controllers nem regras.
 * Fase 2 adiciona: DatabaseModule, SupercellModule.
 * Fase 3 adiciona: AuthModule, PlayersModule, ClansModule, VacanciesModule.
 */
@Module({
  imports: [AppConfigModule, HealthModule],
})
export class AppModule {}
