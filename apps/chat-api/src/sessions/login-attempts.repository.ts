import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { generateUuidV7 } from '../common/uuid/uuid-v7.js';
import { LoginAttempt } from './login-attempt.entity.js';

// Upsert atômico (ADR 0023): o incremento acontece no próprio UPDATE, para
// duas falhas simultâneas contarem as duas. Estados do limite de um e-mail
// (LLD, "Estados e regras", seção "Limite de tentativas"):
// - A janela começa na primeira falha; falha com janela vencida recomeça em 1.
// - A falha de número tentativas de login bloqueia o e-mail.
// - Tentativa de e-mail já bloqueado não conta e não estende o bloqueio.
const REGISTER_FAILURE_SQL = `
  INSERT INTO login_attempts (id, email, failed_attempts, first_failed_at, blocked_until, created_at, updated_at)
  VALUES ($1, $2, 1, now(), NULL, now(), now())
  ON CONFLICT (email) DO UPDATE SET
    first_failed_at = CASE
      WHEN login_attempts.blocked_until IS NOT NULL AND login_attempts.blocked_until > now()
        THEN login_attempts.first_failed_at
      WHEN login_attempts.first_failed_at + make_interval(secs => $3) < now()
        THEN now()
      ELSE login_attempts.first_failed_at
    END,
    failed_attempts = CASE
      WHEN login_attempts.blocked_until IS NOT NULL AND login_attempts.blocked_until > now()
        THEN login_attempts.failed_attempts
      WHEN login_attempts.first_failed_at + make_interval(secs => $3) < now()
        THEN 1
      ELSE login_attempts.failed_attempts + 1
    END,
    blocked_until = CASE
      WHEN login_attempts.blocked_until IS NOT NULL AND login_attempts.blocked_until > now()
        THEN login_attempts.blocked_until
      WHEN (CASE
        WHEN login_attempts.first_failed_at + make_interval(secs => $3) < now()
          THEN 1
        ELSE login_attempts.failed_attempts + 1
      END) >= $4
        THEN now() + make_interval(secs => $5)
      ELSE login_attempts.blocked_until
    END,
    updated_at = now()
  RETURNING id, email, failed_attempts, first_failed_at, blocked_until
`;

interface RegisterFailureRow {
  id: string;
  email: string;
  failed_attempts: number;
  first_failed_at: Date;
  blocked_until: Date | null;
}

@Injectable()
export class LoginAttemptsRepository extends Repository<LoginAttempt> {
  constructor(dataSource: DataSource) {
    super(LoginAttempt, dataSource.createEntityManager());
  }

  findByEmail(email: string): Promise<LoginAttempt | null> {
    return this.findOneBy({ email });
  }

  // Devolve a linha atualizada, com o estado do limite após a contagem.
  async registerFailure(
    email: string,
    windowSeconds: number,
    attemptLimit: number,
    blockSeconds: number,
    manager?: EntityManager,
  ): Promise<LoginAttempt> {
    const executor = manager ?? this;
    const rows = await executor.query<RegisterFailureRow[]>(REGISTER_FAILURE_SQL, [
      generateUuidV7(),
      email,
      windowSeconds,
      attemptLimit,
      blockSeconds,
    ]);
    const row = rows[0];

    const attempt = new LoginAttempt();
    attempt.id = row.id;
    attempt.email = row.email;
    attempt.failedAttempts = row.failed_attempts;
    attempt.firstFailedAt = new Date(row.first_failed_at);
    attempt.blockedUntil = row.blocked_until === null ? null : new Date(row.blocked_until);
    return attempt;
  }

  // Um login certo fora do bloqueio apaga a contagem (LLD, seção 6.2).
  clearForEmail(email: string, manager?: EntityManager): Promise<unknown> {
    const executor = manager ?? this;
    return executor.query('DELETE FROM login_attempts WHERE email = $1', [email]);
  }
}
