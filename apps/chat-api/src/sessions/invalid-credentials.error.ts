import { DomainError } from '../common/errors/domain-error.js';

// E-mail sem conta e senha errada recebem a mesma resposta, para não
// revelar se a conta existe (LLD, "Estados e regras", seção 6.2).
export class InvalidCredentialsError extends DomainError {
  constructor() {
    const message = 'Credenciais inválidas.';
    super('invalid_credentials', message);
  }
}
