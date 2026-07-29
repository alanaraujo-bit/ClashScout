import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import {
  SessionRepository,
  type AuthenticatedUser,
} from '../../../core/domain/repositories/session.repository';

/**
 * Nomes de cookie usados pelo Auth.js. O prefixo `__Secure-` aparece quando o
 * site roda em HTTPS, que e o caso em producao na Vercel.
 */
const SESSION_COOKIE_NAMES = ['__Secure-authjs.session-token', 'authjs.session-token'];

/** Onde o guard deposita o usuario resolvido, lido pelo @CurrentUser(). */
export const REQUEST_USER_KEY = 'clashscoutUser';

/**
 * Exige uma sessao valida do Auth.js.
 *
 * Aceita o token pelo cookie (fluxo normal do navegador) ou por
 * `Authorization: Bearer <sessionToken>`, que serve para clientes sem cookie -
 * o proprio PWA quando instalado e chamadas de teste.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractSessionToken(request);

    if (token === null) {
      throw new UnauthorizedException('Sessao ausente.');
    }

    const user = await this.sessions.findValidUserBySessionToken(token);

    if (user === null) {
      throw new UnauthorizedException('Sessao invalida ou expirada.');
    }

    (request as Request & Record<string, unknown>)[REQUEST_USER_KEY] = user;

    return true;
  }
}

function extractSessionToken(request: Request): string | null {
  const authorization = request.headers.authorization;

  if (authorization !== undefined && authorization.startsWith('Bearer ')) {
    const bearer = authorization.slice('Bearer '.length).trim();

    if (bearer !== '') {
      return bearer;
    }
  }

  return extractCookie(request.headers.cookie, SESSION_COOKIE_NAMES);
}

/**
 * Le um cookie do header cru. Feito a mao para nao adicionar `cookie-parser`
 * apenas por causa de um cookie - e para nao precisar registrar middleware
 * global so para este guard.
 */
function extractCookie(header: string | undefined, names: string[]): string | null {
  if (header === undefined) {
    return null;
  }

  const jar = new Map<string, string>();

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');

    if (separator > 0) {
      jar.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }

  for (const name of names) {
    const value = jar.get(name);

    if (value !== undefined && value !== '') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export type { AuthenticatedUser };
