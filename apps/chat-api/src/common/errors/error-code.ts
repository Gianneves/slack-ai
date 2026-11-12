// Códigos estáveis do contrato de erro (LLD, "Conceitos transversais de
// implementação", seção "Erros"). Um código novo entra também no mapa de
// status do DomainExceptionFilter.
export type ErrorCode =
  | 'invalid_credentials'
  | 'too_many_login_attempts'
  | 'unauthenticated'
  | 'validation_error'
  | 'http_error'
  | 'internal_error';
