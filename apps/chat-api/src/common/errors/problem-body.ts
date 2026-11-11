import { HttpStatus } from '@nestjs/common';

// Resposta de erro da API: application/problem+json (RFC 9457), com a
// extensão code (LLD, "Conceitos transversais de implementação", seção "Erros").
export interface ProblemBody {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
}

export const INTERNAL_ERROR_CODE: ProblemBody['code'] = 'internal_error';

export const HTTP_STATUS_TITLES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

export function buildProblemBody(
  status: HttpStatus,
  code: string,
  detail: string,
): ProblemBody {
  return {
    type: 'about:blank',
    title: HTTP_STATUS_TITLES[status] ?? 'Internal Server Error',
    status,
    detail,
    code,
  };
}
