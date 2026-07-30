/**
 * Erro de negocio. Vive no dominio e nao conhece HTTP.
 * A traducao para status code acontece no filtro da camada de apresentacao.
 */
export abstract class DomainError extends Error {
  /** Codigo estavel consumido pelo frontend (ex.: PLAYER_TAG_INVALID). */
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** Recurso inexistente (-> 404). */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} nao encontrado: ${identifier}` : `${resource} nao encontrado.`);
  }
}

/** Regra de negocio violada (-> 422). */
export class BusinessRuleError extends DomainError {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Acao nao permitida para o usuario atual sobre o recurso (-> 403). */
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Acao nao permitida para este usuario.') {
    super(message);
  }
}
