import type { ApplicationStatus } from '@clashscout/shared';

import type { StoredPlayerProfile } from './player-profile.entity';

/** Candidatura no ponto de vista do jogador: so precisa saber da vaga. */
export interface StoredApplication {
  id: string;
  vacancyId: string;
  playerProfileId: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  decidedBy: string | null;
}

/** Candidatura com o resumo da vaga embutido, para a lista "minhas candidaturas". */
export interface StoredApplicationWithVacancy extends StoredApplication {
  vacancy: {
    id: string;
    title: string;
    clanTag: string;
    clanName: string;
    status: string;
  };
}

/** Candidatura com o perfil do candidato embutido, para o inbox do lider. */
export interface StoredApplicationWithCandidate extends StoredApplication {
  candidate: StoredPlayerProfile;
}
