// Exercita o repository com a dependência real, construído com `new`, sem
// módulo do Nest (.opencode/rules/nest-api-testing.md). O upsert atômico
// (ADR 0023) é o que prova aqui: duas falhas simultâneas contam as duas.
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_BLOCK_SECONDS,
  LOGIN_WINDOW_SECONDS,
} from '../src/sessions/login-limits.js';
import { LoginAttempt } from '../src/sessions/login-attempt.entity.js';
import { LoginAttemptsRepository } from '../src/sessions/login-attempts.repository.js';
import { Session } from '../src/sessions/session.entity.js';
import { SnakeNamingStrategy } from '../src/database/snake-naming-strategy.js';
import { Person } from '../src/people/person.entity.js';
import { createPerson, uniqueEmail } from './db.js';
import { TEST_DATABASE_URL } from './global-setup.js';

describe('LoginAttemptsRepository (integração)', () => {
  let dataSource: DataSource;
  let repository: LoginAttemptsRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: TEST_DATABASE_URL,
      entities: [LoginAttempt, Session, Person],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    });
    await dataSource.initialize();
    repository = new LoginAttemptsRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.getRepository(LoginAttempt).clear();
  });

  it('encontra sem linha quando o e-mail não tem falhas contadas', async () => {
    await repository.findByEmail(uniqueEmail('int')).then((value) => {
      expect(value).toBeNull();
    });
  });

  it('conta as duas falhas simultâneas: o incremento é atômico', async () => {
    const email = uniqueEmail('int');

    const [first, second] = await Promise.all([
      repository.registerFailure(
        email,
        LOGIN_WINDOW_SECONDS,
        LOGIN_ATTEMPT_LIMIT,
        LOGIN_BLOCK_SECONDS,
      ),
      repository.registerFailure(
        email,
        LOGIN_WINDOW_SECONDS,
        LOGIN_ATTEMPT_LIMIT,
        LOGIN_BLOCK_SECONDS,
      ),
    ]);

    // Um upsert conta como insert (+1) e o outro como update (+2): as duas
    // falhas contam, e a linha fica com o total 2.
    expect([first.failedAttempts, second.failedAttempts]).toContain(1);
    expect([first.failedAttempts, second.failedAttempts]).toContain(2);
    const rows: Array<{ failed_attempts: number }> = await dataSource.query(
      'SELECT failed_attempts FROM login_attempts WHERE email = $1',
      [email],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].failed_attempts).toBe(2);
  });

  it('bloqueia o e-mail na falha de número 5 e grava o bloqueio', async () => {
    const email = uniqueEmail('int');

    let last = await repository.registerFailure(
      email,
      LOGIN_WINDOW_SECONDS,
      LOGIN_ATTEMPT_LIMIT,
      LOGIN_BLOCK_SECONDS,
    );
    for (let i = 2; i <= LOGIN_ATTEMPT_LIMIT; i += 1) {
      last = await repository.registerFailure(
        email,
        LOGIN_WINDOW_SECONDS,
        LOGIN_ATTEMPT_LIMIT,
        LOGIN_BLOCK_SECONDS,
      );
    }

    expect(last.failedAttempts).toBe(LOGIN_ATTEMPT_LIMIT);
    const rows: Array<{ blocked_until: Date | null }> = await dataSource.query(
      'SELECT blocked_until FROM login_attempts WHERE email = $1',
      [email],
    );
    expect(rows[0].blocked_until).not.toBeNull();
  });

  it('apaga a contagem do e-mail, como o login certo pede', async () => {
    const email = uniqueEmail('int');
    await repository.registerFailure(
      email,
      LOGIN_WINDOW_SECONDS,
      LOGIN_ATTEMPT_LIMIT,
      LOGIN_BLOCK_SECONDS,
    );

    await repository.clearForEmail(email);

    const rows: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM login_attempts WHERE email = $1',
      [email],
    );
    expect(rows).toHaveLength(0);
  });

  it('grava a pessoa de teste em `people`, como o atalho promete', async () => {
    const created = await createPerson(dataSource.manager, 'senha-certa');

    const rows: Array<{ email: string }> = await dataSource.query(
      'SELECT email FROM people WHERE id = $1',
      [created.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(created.email);
  });
});
