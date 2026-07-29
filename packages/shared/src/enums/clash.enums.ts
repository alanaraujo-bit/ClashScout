/**
 * Vocabulario de dominio do produto. Fica no pacote compartilhado porque
 * tanto os filtros do frontend quanto as regras do backend dependem dele.
 * As entidades e regras de negocio propriamente ditas chegam na Fase 3.
 */

/** Papel do usuario dentro da plataforma. */
export enum UserRole {
  PLAYER = 'PLAYER',
  LEADER = 'LEADER',
  ADMIN = 'ADMIN',
}

/** Perfil de jogo declarado pelo jogador / exigido pela vaga. */
export enum PlayStyle {
  WAR = 'WAR',
  FARMING = 'FARMING',
  CWL = 'CWL',
  CLAN_GAMES = 'CLAN_GAMES',
  CASUAL = 'CASUAL',
}

/** Situacao de uma vaga publicada por um cla. */
export enum VacancyStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
}

/** Situacao de uma candidatura de jogador a uma vaga. */
export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}
