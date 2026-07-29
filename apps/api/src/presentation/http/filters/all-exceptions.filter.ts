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
  NotFoundError,
} from '../../../core/domain/errors/domain.error';

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

      return {
        statusCode: exception.getStatus(),
        code: 'HTTP_EXCEPTION',
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
