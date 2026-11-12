import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from './domain-error.js';
import { ErrorCode } from './error-code.js';
import { buildProblemBody } from './problem-body.js';

// Mapa de code para status HTTP. Só o filter conhece o HTTP
// (.opencode/rules/nest-api-errors.md).
const DOMAIN_STATUS: Record<ErrorCode, HttpStatus> = {
  invalid_credentials: HttpStatus.UNAUTHORIZED,
  too_many_login_attempts: HttpStatus.TOO_MANY_REQUESTS,
  unauthenticated: HttpStatus.UNAUTHORIZED,
  validation_error: HttpStatus.BAD_REQUEST,
  http_error: HttpStatus.INTERNAL_SERVER_ERROR,
  internal_error: HttpStatus.INTERNAL_SERVER_ERROR,
};

// Erro inesperado: o filter registra em log e responde 500, sem expor
// mensagem interna nem stack trace.
const INTERNAL_ERROR_DETAIL = 'Ocorreu um erro inesperado. Tente novamente.';
const VALIDATION_ERROR_DETAIL = 'Os dados enviados não são válidos.';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      this.respondDomain(response, exception);
      return;
    }

    if (exception instanceof HttpException) {
      this.respondHttp(response, exception);
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        buildProblemBody(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'internal_error',
          INTERNAL_ERROR_DETAIL,
        ),
      );
  }

  // Erro de domínio: status vem do mapa de code; dados do caso viram
  // cabeçalhos (Retry-After do limite de tentativas).
  private respondDomain(response: Response, error: DomainError): void {
    const status = DOMAIN_STATUS[error.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const retryAfterSeconds = error.data['retry_after_seconds'];
    if (typeof retryAfterSeconds === 'number') {
      response.setHeader('Retry-After', Math.ceil(retryAfterSeconds).toString());
    }
    response.status(status).json(buildProblemBody(status, error.code, error.message));
  }

  // Só o status de uma HttpException é aceito do erro de fornecedor;
  // a mensagem de validação das regras do pipe não vaza detalhe interno.
  private respondHttp(response: Response, exception: HttpException): void {
    const status = exception.getStatus();
    const isValidation = status === HttpStatus.BAD_REQUEST;
    const code: ErrorCode = isValidation ? 'validation_error' : 'http_error';
    const detail = isValidation
      ? VALIDATION_ERROR_DETAIL
      : (exception.getResponse() as { message?: string }).message ??
        exception.message;
    response.status(status).json(buildProblemBody(status, code, detail));
  }
}
