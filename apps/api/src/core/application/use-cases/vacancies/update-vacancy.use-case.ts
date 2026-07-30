import type {
  ClanVacancyInput,
  StoredClanVacancy,
} from '../../../domain/entities/clan-vacancy.entity';
import { VacancyNotFoundError, VacancyNotOwnedError } from '../../../domain/errors/vacancy.errors';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

export interface UpdateVacancyInput {
  vacancyId: string;
  ownerId: string;
  changes: Partial<ClanVacancyInput>;
}

/** Atualiza os campos de uma vaga. So o dono pode editar. */
export class UpdateVacancyUseCase {
  constructor(private readonly vacancies: ClanVacancyRepository) {}

  async execute(input: UpdateVacancyInput): Promise<StoredClanVacancy> {
    const vacancy = await this.vacancies.findById(input.vacancyId);

    if (vacancy === null) {
      throw new VacancyNotFoundError(input.vacancyId);
    }

    if (vacancy.ownerId !== input.ownerId) {
      throw new VacancyNotOwnedError();
    }

    return this.vacancies.update(input.vacancyId, input.changes);
  }
}
