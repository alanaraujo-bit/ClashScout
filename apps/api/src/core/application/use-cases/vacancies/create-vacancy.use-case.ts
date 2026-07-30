import type {
  ClanVacancyInput,
  StoredClanVacancy,
} from '../../../domain/entities/clan-vacancy.entity';
import type { ClanVacancyRepository } from '../../../domain/repositories/clan-vacancy.repository';

/** Cria uma vaga em DRAFT. Publicar (OPEN) e uma acao separada e explicita. */
export class CreateVacancyUseCase {
  constructor(private readonly vacancies: ClanVacancyRepository) {}

  async execute(ownerId: string, input: ClanVacancyInput): Promise<StoredClanVacancy> {
    return this.vacancies.create(ownerId, input);
  }
}
