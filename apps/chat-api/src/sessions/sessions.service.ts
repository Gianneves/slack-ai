// Camada de serviços (.opencode/rules/nest-api-coding-standards.md): recebe
// e devolve dados simples e tipos do domínio, sem importar nada de HTTP.
import { Inject, Injectable, Logger } from '@nestjs/common';
import { normalizeEmail } from '../common/email.js';
import type { SessionConfig } from '../config/session-config.js';
import { SESSION_CONFIG } from '../config/session-config.js';
import { PeopleRepository } from '../people/people.repository.js';
import { FAKE_PASSWORD_HASH, isPasswordRight } from './passwords.js';
import { InvalidCredentialsError } from './invalid-credentials.error.js';
import { TooManyLoginAttemptsError } from './too-many-login-attempts.error.js';
import {
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_BLOCK_SECONDS,
  LOGIN_WINDOW_SECONDS,
} from './login-limits.js';
import { LoginAttemptsRepository } from './login-attempts.repository.js';
import { SESSION_RENEWAL_INTERVAL_SECONDS } from './session-limits.js';
import { SessionsRepository } from './sessions.repository.js';
import { createSessionToken, hashToken } from './tokens.js';
import { UnauthenticatedError } from './unauthenticated.error.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresAt: Date;
  person: {
    id: string;
    email: string;
  };
}

export interface AuthenticatedPerson {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedSessionData {
  id: string;
  personId: string;
  expiresAt: Date;
}

export interface AuthenticatedSession {
  session: AuthenticatedSessionData;
  person: AuthenticatedPerson;
}

// O e-mail está bloqueado enquanto blocked_until é posterior ao agora.
function isBlocked(blockedUntil: Date | null, now: Date): boolean {
  return blockedUntil !== null && blockedUntil > now;
}

// Um login certo fora do bloqueio apaga a contagem; a sessão nova e a
// contagem apagada gravam de forma atômica.
async function createSessionAndClearAttempts(
  sessions: SessionsRepository,
  loginAttempts: LoginAttemptsRepository,
  input: { personId: string; tokenHash: string; lastUsedAt: Date; expiresAt: Date; email: string },
): Promise<{ expiresAt: Date }> {
  return sessions.manager.transaction(async (manager) => {
    // Os repositories recebem o manager da transação pelo próprio método:
    // `withRepository` reinstancia o repository e não serve para os que
    // recebem o DataSource no construtor.
    const session = await sessions.createSession(
      {
        personId: input.personId,
        tokenHash: input.tokenHash,
        lastUsedAt: input.lastUsedAt,
        expiresAt: input.expiresAt,
      },
      manager,
    );
    await loginAttempts.clearForEmail(input.email, manager);
    return { expiresAt: session.expiresAt };
  });
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    // Dependência injetada leva o nome do papel, sem sufixo do tipo.
    private readonly people: PeopleRepository,
    private readonly sessions: SessionsRepository,
    private readonly loginAttempts: LoginAttemptsRepository,
    @Inject(SESSION_CONFIG) private readonly config: SessionConfig,
  ) {}

  // Entrar (`POST /v1/sessions`): regras em "Estados e regras", seção
  // "Sessão e login" (LLD).
  async login(input: LoginInput): Promise<LoginResult> {
    const email = normalizeEmail(input.email);
    // O e-mail é normalizado antes de tudo (LLD, seção 6.2).
    const now = new Date();
    const attempt = await this.loginAttempts.findByEmail(email);

    if (isBlocked(attempt?.blockedUntil ?? null, now)) {
      const blockedUntil = attempt?.blockedUntil;
      const seconds = blockedUntil
        ? Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)
        : LOGIN_BLOCK_SECONDS;
      // Tentativa de login bloqueada: log warn (LLD, "Logs"), sem token.
      this.logger.warn(`tentativa de login bloqueada (${seconds}s restantes)`);
      throw new TooManyLoginAttemptsError(seconds);
    }

    const person = await this.people.findByEmail(email);
    // Quando o e-mail não tem conta, verifica contra o hash fictício, para
    // o tempo de resposta não revelar se a conta existe (LLD, "Segurança").
    const isPasswordValid = await isPasswordRight(
      input.password,
      person?.passwordHash ?? FAKE_PASSWORD_HASH,
    );

    if (!isPasswordValid) {
      // O incremento é atômico, no próprio UPDATE do upsert (ADR 0023).
      const updated = await this.loginAttempts.registerFailure(
        email,
        LOGIN_WINDOW_SECONDS,
        LOGIN_ATTEMPT_LIMIT,
        LOGIN_BLOCK_SECONDS,
      );
      // A falha que atinge o limite já responde como bloqueada.
      if (isBlocked(updated.blockedUntil, now)) {
        const blockedUntil = updated.blockedUntil ?? now;
        const seconds = Math.ceil(
          (blockedUntil.getTime() - now.getTime()) / 1000,
        );
        throw new TooManyLoginAttemptsError(seconds);
      }
      throw new InvalidCredentialsError();
    }

    // Credencial certa e e-mail fora do bloqueio: cria a Sessão com
    // expires_at = agora + duração da Sessão e devolve o token, entregue
    // uma única vez (LLD, seção 6.2 e "Segurança").
    const token = createSessionToken();
    const expiresAt = new Date(
      now.getTime() + this.config.ttlDays * MILLISECONDS_PER_DAY,
    );
    const session = await createSessionAndClearAttempts(
      this.sessions,
      this.loginAttempts,
      {
        personId: person!.id,
        tokenHash: hashToken(token),
        lastUsedAt: now,
        expiresAt,
        email,
      },
    );

    return {
      token,
      expiresAt: session.expiresAt,
      person: {
        id: person!.id,
        email: person!.email,
      },
    };
  }

  // Verificar (`GET /v1/sessions/current`): token desconhecido, Sessão vencida
  // e cookie ausente recebem unauthenticated, sem distinguir os casos
  // (LLD, seção 6.2).
  async authenticate(input: { token: string }): Promise<AuthenticatedSession> {
    const session = await this.sessions.findByTokenHash(hashToken(input.token));
    const now = new Date();

    if (session === null) {
      throw new UnauthenticatedError();
    }

    // A Sessão vencida é apagada nessa hora (LLD, seção 6.2).
    if (session.expiresAt <= now) {
      await this.sessions.deleteById(session.id);
      throw new UnauthenticatedError();
    }

    const person = await this.people.findById(session.personId);
    if (person === null) {
      await this.sessions.deleteById(session.id);
      throw new UnauthenticatedError();
    }

    // A Sessão é renovada só quando passou o intervalo de renovação desde o
    // last_used_at, e a escrita é condicional (LLD, seção 6.2).
    const renewalDueBefore = new Date(
      now.getTime() - SESSION_RENEWAL_INTERVAL_SECONDS * 1000,
    );
    let currentExpiresAt = session.expiresAt;
    if (session.lastUsedAt <= renewalDueBefore) {
      const expiresAt = new Date(
        now.getTime() + this.config.ttlDays * MILLISECONDS_PER_DAY,
      );
      const renewed = await this.sessions.renew(
        session.id,
        now,
        expiresAt,
        renewalDueBefore,
      );
      if (renewed) {
        currentExpiresAt = expiresAt;
      }
    }

    return {
      session: {
        id: session.id,
        personId: session.personId,
        expiresAt: currentExpiresAt,
      },
      person: {
        id: person.id,
        name: person.name,
        email: person.email,
      },
    };
  }

  // Sair (`DELETE /v1/sessions/current`): apaga só a Sessão apresentada; as
  // outras Sessões da Pessoa continuam valendo (LLD, seção 6.2).
  async logout(input: { sessionId: string }): Promise<void> {
    await this.sessions.deleteById(input.sessionId);
  }
}
