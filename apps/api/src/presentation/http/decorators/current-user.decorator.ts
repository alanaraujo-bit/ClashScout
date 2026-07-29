import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../../core/domain/repositories/session.repository';
import { REQUEST_USER_KEY } from '../guards/session.guard';

/**
 * Injeta o usuario autenticado no handler. So faz sentido em rotas protegidas
 * pelo SessionGuard - sem ele, nao ha usuario na requisicao.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<Request & Record<string, unknown>>();
    const user = request[REQUEST_USER_KEY] as AuthenticatedUser | undefined;

    if (user === undefined) {
      // Erro de programacao (rota sem guard), nao de entrada do usuario.
      throw new Error('@CurrentUser() usado em rota sem SessionGuard.');
    }

    return user;
  },
);
