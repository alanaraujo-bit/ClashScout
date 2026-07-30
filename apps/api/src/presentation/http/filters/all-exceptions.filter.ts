import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@clashscout/shared';
import type { Request, Response } from 'express';

import {
  BusinessRuleError,
  DomainError,
  ForbiddenError,
  NotFoundError,
} from '../../../core/domain/errors/domain.error';
import {
  PlayerNotFoundInSupercellError,
  SupercellAuthError,
  SupercellNotConfiguredError,
  SupercellRateLimitedError,
  SupercellUnavailableError,
} from '../../../core/domain/errors/integration.errors';

/**
 * Fronteira unica de erro: traduz erros de dominio e excecoes do Nest para o
 * envelope `ApiErrorResponse`. Detalhes internos nunca vazam em producao.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, code, message, details } = this.describe(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, exception instanceof Error ? exception.stack : undefined);
    }

    const body: ApiErrorResponse = {
      statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details ? { details } : {}),
    };

    response.status(statusCode).json(body);
  }

  private describe(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof NotFoundError) {
      return { statusCode: HttpStatus.NOT_FOUND, code: exception.code, message: exception.message };
    }

    // Tag valida em formato, mas inexistente no jogo.
    if (exception instanceof PlayerNotFoundInSupercellError) {
      return { statusCode: HttpStatus.NOT_FOUND, code: exception.code, message: exception.message };
    }

    // Falhas de integracao antes do DomainError generico: sao DomainError
    // tambem, mas nenhuma delas e culpa da entrada do usuario, logo nao viram 400.
    if (exception instanceof SupercellRateLimitedError) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof SupercellAuthError) {
      return {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof SupercellUnavailableError) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof SupercellNotConfiguredError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof ForbiddenError) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof BusinessRuleError) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof DomainError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ?? exception.message);

      const status = exception.getStatus();

      return {
        statusCode: status,
        code: httpStatusToCode(status),
        message: Array.isArray(message) ? message.join('; ') : message,
        details: typeof payload === 'object' ? payload : undefined,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno inesperado.',
    };
  }
}

/**
 * Codigo estavel para excecoes do proprio Nest (guards, ValidationPipe, rota
 * inexistente), que nao passam por um erro de dominio nosso.
 *
 * Um `HTTP_EXCEPTION` generico nao serve ao proposito do campo `code`: o
 * frontend precisa distinguir "faca login" de "corrija o formulario" sem ler o
 * texto da mensagem.
 */
function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_FAILED';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHENTICATED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.PAYLOAD_TOO_LARGE:
      return 'PAYLOAD_TOO_LARGE';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR';
  }
}
