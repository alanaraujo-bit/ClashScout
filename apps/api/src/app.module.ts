import { Module } from '@nestjs/common';

import { AppConfigModule } from './infrastructure/config/app-config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SupercellModule } from './infrastructure/supercell/supercell.module';
import { ApplicationsModule } from './presentation/modules/applications/applications.module';
import { HealthModule } from './presentation/modules/health/health.module';
import { PlayersModule } from './presentation/modules/players/players.module';
import { VacanciesModule } from './presentation/modules/vacancies/vacancies.module';

/**
 * Modulo raiz. Apenas compoe modulos - nao declara controllers nem regras.
 *
 * Ordem importa: config primeiro (os demais leem variaveis no construtor),
 * depois infraestrutura, por fim os modulos de apresentacao.
 */
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    SupercellModule,
    HealthModule,
    PlayersModule,
    VacanciesModule,
    ApplicationsModule,
  ],
})
export class AppModule {}
