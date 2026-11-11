import { DomainError } from '../common/errors/domain-error.js';

// Durante o bloqueio, toda tentativa recebe too_many_login_attempts, mesmo
// com a senha certa, com o tempo que falta no Retry-After (LLD, seção 6.2).
export class TooManyLoginAttemptsError extends DomainError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    const message = 'Muitas tentativas de login. Aguarde antes de tentar de novo.';
    super('too_many_login_attempts', message, {
      retry_after_seconds: Math.ceil(retryAfterSeconds),
    });
    this.retryAfterSeconds = Math.ceil(retryAfterSeconds);
  }
}
