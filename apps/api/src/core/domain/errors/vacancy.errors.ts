import { ForbiddenError, NotFoundError } from './domain.error';

/** Vaga inexistente (-> 404). */
export class VacancyNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Vaga', identifier);
  }
}

/** Usuario tentou editar/gerenciar uma vaga que nao lhe pertence (-> 403). */
export class VacancyNotOwnedError extends ForbiddenError {
  constructor() {
    super('Esta vaga pertence a outro usuario.');
  }
}
