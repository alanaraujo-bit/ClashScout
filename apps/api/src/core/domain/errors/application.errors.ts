import { BusinessRuleError, ForbiddenError, NotFoundError } from './domain.error';

/** Candidatura inexistente (-> 404). */
export class ApplicationNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Candidatura', identifier);
  }
}

/** O jogador ja tem uma candidatura ativa para esta vaga (-> 422). */
export class DuplicateApplicationError extends BusinessRuleError {
  constructor() {
    super('APPLICATION_ALREADY_ACTIVE', 'Voce ja tem uma candidatura ativa para esta vaga.');
  }
}

/** Perfil sem verificacao de posse nao pode se candidatar (-> 422). */
export class PlayerNotVerifiedError extends BusinessRuleError {
  constructor() {
    super(
      'PLAYER_NOT_VERIFIED',
      'Verifique a posse da sua conta do jogo (API Token) antes de se candidatar a vagas.',
    );
  }
}

/** A vaga nao esta aberta para candidaturas (-> 422). */
export class VacancyNotOpenError extends BusinessRuleError {
  constructor() {
    super('VACANCY_NOT_OPEN', 'Esta vaga nao esta aberta para candidaturas no momento.');
  }
}

/** Usuario tentou decidir/ver candidaturas de uma vaga que nao lhe pertence (-> 403). */
export class ApplicationVacancyNotOwnedError extends ForbiddenError {
  constructor() {
    super('Apenas o dono da vaga pode gerenciar as candidaturas dela.');
  }
}
