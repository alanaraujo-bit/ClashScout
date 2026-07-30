import type { StoredClanVacancy } from '../../../domain/entities/clan-vacancy.entity';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

/** Lista as vagas criadas pelo usuario logado - o painel do lider. */
export class ListMyVacanciesUseCase {
  constructor(private readonly vacancies: ClanVacancyRepository) {}

  async execute(ownerId: string): Promise<StoredClanVacancy[]> {
    return this.vacancies.listByOwner(ownerId);
  }
}
