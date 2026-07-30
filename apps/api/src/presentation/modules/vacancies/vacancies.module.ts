import { Module } from '@nestjs/common';

import { ChangeVacancyStatusUseCase } from '../../../core/application/use-cases/vacancies/change-vacancy-status.use-case';
import { CreateVacancyUseCase } from '../../../core/application/use-cases/vacancies/create-vacancy.use-case';
import { GetVacancyUseCase } from '../../../core/application/use-cases/vacancies/get-vacancy.use-case';
import { ListMyVacanciesUseCase } from '../../../core/application/use-cases/vacancies/list-my-vacancies.use-case';
import { ListOpenVacanciesUseCase } from '../../../core/application/use-cases/vacancies/list-open-vacancies.use-case';
import { UpdateVacancyUseCase } from '../../../core/application/use-cases/vacancies/update-vacancy.use-case';
import { ClanVacancyRepository } from '../../../core/domain/repositories/clan-vacancy.repository';
import { PlayerProfileRepository } from '../../../core/domain/repositories/player-profile.repository';
import { VacanciesController } from './vacancies.controller';

/**
 * Amarracao do modulo de vagas. Casos de uso montados por factory, seguindo o
 * mesmo padrao de `PlayersModule`.
 */
@Module({
  controllers: [VacanciesController],
  providers: [
    {
      provide: CreateVacancyUseCase,
      useFactory: (vacancies: ClanVacancyRepository) => new CreateVacancyUseCase(vacancies),
      inject: [ClanVacancyRepository],
    },
    {
      provide: UpdateVacancyUseCase,
      useFactory: (vacancies: ClanVacancyRepository) => new UpdateVacancyUseCase(vacancies),
      inject: [ClanVacancyRepository],
    },
    {
      provide: ChangeVacancyStatusUseCase,
      useFactory: (vacancies: ClanVacancyRepository) => new ChangeVacancyStatusUseCase(vacancies),
      inject: [ClanVacancyRepository],
    },
    {
      provide: GetVacancyUseCase,
      useFactory: (vacancies: ClanVacancyRepository) => new GetVacancyUseCase(vacancies),
      inject: [ClanVacancyRepository],
    },
    {
      provide: ListMyVacanciesUseCase,
      useFactory: (vacancies: ClanVacancyRepository) => new ListMyVacanciesUseCase(vacancies),
      inject: [ClanVacancyRepository],
    },
    {
      provide: ListOpenVacanciesUseCase,
      useFactory: (vacancies: ClanVacancyRepository, profiles: PlayerProfileRepository) =>
        new ListOpenVacanciesUseCase(vacancies, profiles),
      inject: [ClanVacancyRepository, PlayerProfileRepository],
    },
  ],
})
export class VacanciesModule {}
