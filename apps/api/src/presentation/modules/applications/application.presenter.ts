import type { ApplicationResponse, VacancyApplicationResponse } from '@clashscout/shared';

import type {
  StoredApplicationWithCandidate,
  StoredApplicationWithVacancy,
} from '../../../core/domain/entities/application.entity';
import { toPlayerProfileResponse } from '../players/player.presenter';

/** Converte a candidatura no ponto de vista do jogador (GET /applications/me). */
export function toApplicationResponse(
  application: StoredApplicationWithVacancy,
): ApplicationResponse {
  return {
    id: application.id,
    status: application.status,
    message: application.message,
    createdAt: application.createdAt.toISOString(),
    decidedAt: application.decidedAt?.toISOString() ?? null,
    vacancy: application.vacancy,
  };
}

/** Converte a candidatura no ponto de vista do lider, com o perfil do candidato. */
export function toVacancyApplicationResponse(
  application: StoredApplicationWithCandidate,
): VacancyApplicationResponse {
  return {
    id: application.id,
    status: application.status,
    message: application.message,
    createdAt: application.createdAt.toISOString(),
    decidedAt: application.decidedAt?.toISOString() ?? null,
    candidate: toPlayerProfileResponse(application.candidate, false),
  };
}
