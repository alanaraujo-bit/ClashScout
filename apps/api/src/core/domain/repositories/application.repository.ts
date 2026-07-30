import type { ApplicationStatus } from '@clashscout/shared';

import type {
  StoredApplication,
  StoredApplicationWithCandidate,
  StoredApplicationWithVacancy,
} from '../entities/application.entity';

export interface UpsertApplicationInput {
  vacancyId: string;
  playerProfileId: string;
  message: string | null;
}

/**
 * Contrato de persistencia de candidaturas.
 *
 * Interface declarada no dominio, implementada na infraestrutura (Prisma).
 */
export abstract class ApplicationRepository {
  abstract findByVacancyAndProfile(
    vacancyId: string,
    playerProfileId: string,
  ): Promise<StoredApplication | null>;

  abstract findById(id: string): Promise<StoredApplication | null>;

  /**
   * Cria a candidatura ou, se ja existir uma linha para o par (vaga, perfil)
   * em estado terminal (REJECTED/WITHDRAWN), reabre-a como PENDING.
   */
  abstract upsertPending(input: UpsertApplicationInput): Promise<StoredApplication>;

  abstract decide(
    id: string,
    status: ApplicationStatus,
    decidedBy: string,
  ): Promise<StoredApplication>;

  /** Candidaturas do jogador, com o resumo da vaga embutido. */
  abstract listByPlayerProfile(playerProfileId: string): Promise<StoredApplicationWithVacancy[]>;

  /** Candidaturas recebidas por uma vaga, com o perfil do candidato embutido. */
  abstract listByVacancy(vacancyId: string): Promise<StoredApplicationWithCandidate[]>;
}
