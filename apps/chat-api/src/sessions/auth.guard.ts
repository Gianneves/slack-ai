import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_CONFIG } from '../config/session-config.js';
import type { SessionConfig } from '../config/session-config.js';
import { readCookie } from './cookies.js';
import { SessionsService } from './sessions.service.js';
import type {
  AuthenticatedPerson,
  AuthenticatedSessionData,
} from './sessions.service.js';
import { UnauthenticatedError } from './unauthenticated.error.js';

// O request autenticado carrega a Sessão e a Pessoa que o guard resolveu.
export interface AuthenticatedRequest extends Request {
  session: AuthenticatedSessionData;
  person: AuthenticatedPerson;
}

// Token ausente, desconhecido ou vencido lança unauthenticated; o erro de
// domínio sobe até o exception filter, que monta o 401
// (.opencode/rules/nest-api-errors.md).
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionsService,
    @Inject(SESSION_CONFIG) private readonly config: SessionConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readCookie(request.headers.cookie, this.config.cookieName);

    if (token === null) {
      throw new UnauthenticatedError();
    }

    const { session, person } = await this.sessions.authenticate({ token });
    request.session = session;
    request.person = person;
    return true;
  }
}
