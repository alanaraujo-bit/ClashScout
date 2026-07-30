import type { StoredApplicationWithVacancy } from '../../../domain/entities/application.entity';
import { PlayerProfileNotFoundError } from '../../../domain/errors/player.errors';
import type { ApplicationRepository } from '../../../domain/repositories/application.repository';
import type { PlayerProfileRepository } from '../../../domain/repositories/player-profile.repository';

/** Lista as candidaturas do jogador logado, com o resumo de cada vaga. */
export class ListMyApplicationsUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly profiles: PlayerProfileRepository,
  ) {}

  async execute(userId: string): Promise<StoredApplicationWithVacancy[]> {
    const profile = await this.profiles.findByUserId(userId);

    if (profile === null) {
      throw new PlayerProfileNotFoundError();
    }

    return this.applications.listByPlayerProfile(profile.id);
  }
}
