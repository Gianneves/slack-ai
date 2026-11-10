import type { ErrorCode } from './error-code.js';

// Erro de domínio: carrega o code estável do contrato e os dados do caso.
// Não sabe o status HTTP; quem traduz é o DomainExceptionFilter
// (.opencode/rules/nest-api-errors.md).
export abstract class DomainError extends Error {
  readonly code: ErrorCode;
  readonly data: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, data: Record<string, unknown> = {}) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
