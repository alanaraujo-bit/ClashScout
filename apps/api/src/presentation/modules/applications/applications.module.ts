import { Module } from '@nestjs/common';

import { ApplyToVacancyUseCase } from '../../../core/application/use-cases/applications/apply-to-vacancy.use-case';
import { DecideApplicationUseCase } from '../../../core/application/use-cases/applications/decide-application.use-case';
import { ListMyApplicationsUseCase } from '../../../core/application/use-cases/applications/list-my-applications.use-case';
import { ListVacancyApplicationsUseCase } from '../../../core/application/use-cases/applications/list-vacancy-applications.use-case';
import { WebPushPort } from '../../../core/application/ports/web-push.port';
import { ApplicationRepository } from '../../../core/domain/repositories/application.repository';
import { ClanVacancyRepository } from '../../../core/domain/repositories/clan-vacancy.repository';
import { PlayerProfileRepository } from '../../../core/domain/repositories/player-profile.repository';
import { ApplicationsController } from './applications.controller';

/**
 * Amarracao do modulo de candidaturas. Casos de uso montados por factory,
 * seguindo o mesmo padrao de `PlayersModule`.
 */
@Module({
  controllers: [ApplicationsController],
  providers: [
    {
      provide: ApplyToVacancyUseCase,
      useFactory: (
        applications: ApplicationRepository,
        vacancies: ClanVacancyRepository,
        profiles: PlayerProfileRepository,
        webPush: WebPushPort,
      ) => new ApplyToVacancyUseCase(applications, vacancies, profiles, webPush),
      inject: [ApplicationRepository, ClanVacancyRepository, PlayerProfileRepository, WebPushPort],
    },
    {
      provide: ListMyApplicationsUseCase,
      useFactory: (applications: ApplicationRepository, profiles: PlayerProfileRepository) =>
        new ListMyApplicationsUseCase(applications, profiles),
      inject: [ApplicationRepository, PlayerProfileRepository],
    },
    {
      provide: ListVacancyApplicationsUseCase,
      useFactory: (applications: ApplicationRepository, vacancies: ClanVacancyRepository) =>
        new ListVacancyApplicationsUseCase(applications, vacancies),
      inject: [ApplicationRepository, ClanVacancyRepository],
    },
    {
      provide: DecideApplicationUseCase,
      useFactory: (
        applications: ApplicationRepository,
        vacancies: ClanVacancyRepository,
        profiles: PlayerProfileRepository,
        webPush: WebPushPort,
      ) => new DecideApplicationUseCase(applications, vacancies, profiles, webPush),
      inject: [ApplicationRepository, ClanVacancyRepository, PlayerProfileRepository, WebPushPort],
    },
  ],
})
export class ApplicationsModule {}
