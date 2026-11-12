import { DomainError } from '../common/errors/domain-error.js';

// Cookie ausente, token desconhecido ou Sessão vencida recebem o mesmo erro,
// sem distinguir os casos (LLD, seção 6.2).
export class UnauthenticatedError extends DomainError {
  constructor() {
    super('unauthenticated', 'Não autenticado.');
  }
}
