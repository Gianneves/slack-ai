import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { PeopleRepository } from '../src/people/people.repository.js';
import { SessionsRepository } from '../src/sessions/sessions.repository.js';
import { LoginAttempt } from '../src/sessions/login-attempt.entity.js';
import { Session } from '../src/sessions/session.entity.js';
import { Person } from '../src/people/person.entity.js';
import { SnakeNamingStrategy } from '../src/database/snake-naming-strategy.js';
import { isPasswordRight } from '../src/sessions/passwords.js';
import { hashToken } from '../src/sessions/tokens.js';
import { uniqueEmail } from './db.js';
import { TEST_DATABASE_URL } from './global-setup.js';

const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

async function createPersonOrFail(
  accounts: AccountsService,
  email: string,
  password: string = 'senha-forte',
): Promise<{ id: string; email: string }> {
  const created = await accounts.createPerson({
    email,
    name: 'Pessoa de Teste',
    password,
  });
  if ('error' in created) {
    throw new Error(created.error);
  }
  return created;
}

async function createSessionOrFail(
  sessions: SessionsRepository,
  personId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await sessions.createSession({
    personId,
    tokenHash: hashToken(token),
    lastUsedAt: new Date(),
    expiresAt,
  });
}

describe('Comando de contas (integração)', () => {
  let dataSource: DataSource;
  let accounts: AccountsService;
  let sessions: SessionsRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: TEST_DATABASE_URL,
      entities: [Person, Session, LoginAttempt],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    });
    await dataSource.initialize();
    sessions = new SessionsRepository(dataSource);
    accounts = new AccountsService(new PeopleRepository(dataSource), sessions);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('cria a Pessoa com e-mail normalizado e senha Argon2id', async () => {
    const email = uniqueEmail('int');
    const created = await accounts.createPerson({
      email: `  ${email.toUpperCase()}  `,
      name: 'Ana Silva',
      password: 'senha-forte',
    });

    expect(created).toEqual({ id: expect.any(String), email });
    if ('error' in created) {
      throw new Error(created.error);
    }
    const rows: Array<{ email: string; name: string; password_hash: string }> =
      await dataSource.query(
        'SELECT email, name, password_hash FROM people WHERE id = $1',
        [created.id],
      );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(email);
    expect(rows[0].name).toBe('Ana Silva');
    expect(rows[0].password_hash).toMatch(/^\$argon2id\$/);
    await expect(
      isPasswordRight('senha-forte', rows[0].password_hash),
    ).resolves.toBe(true);
  });

  it('revoga todas as Sessões da Pessoa e mantém as das outras', async () => {
    const first = await createPersonOrFail(accounts, uniqueEmail('revogada'));
    const second = await createPersonOrFail(accounts, uniqueEmail('mantida'));
    const expiresAt = new Date(Date.now() + ONE_DAY_MILLISECONDS);
    await createSessionOrFail(sessions, first.id, randomUUID(), expiresAt);
    await createSessionOrFail(sessions, first.id, randomUUID(), expiresAt);
    await createSessionOrFail(sessions, second.id, randomUUID(), expiresAt);

    const result = await accounts.revokeSessions({
      email: `  ${first.email.toUpperCase()}  `,
    });

    expect(result).toEqual({ ok: true });
    const revoked: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM sessions WHERE person_id = $1',
      [first.id],
    );
    const kept: Array<{ person_id: string }> = await dataSource.query(
      'SELECT person_id FROM sessions WHERE person_id = $1',
      [second.id],
    );
    expect(revoked).toHaveLength(0);
    expect(kept).toHaveLength(1);
  });

  it('troca a senha e apaga todas as Sessões da Pessoa na mesma transação', async () => {
    const first = await createPersonOrFail(
      accounts,
      uniqueEmail('redefinida'),
      'senha-antiga',
    );
    const second = await createPersonOrFail(accounts, uniqueEmail('intacta'));
    const expiresAt = new Date(Date.now() + ONE_DAY_MILLISECONDS);
    await createSessionOrFail(sessions, first.id, randomUUID(), expiresAt);
    await createSessionOrFail(sessions, first.id, randomUUID(), expiresAt);
    await createSessionOrFail(sessions, second.id, randomUUID(), expiresAt);

    const result = await accounts.resetPassword({
      email: `  ${first.email.toUpperCase()}  `,
      password: 'senha-nova',
    });

    expect(result).toEqual({ ok: true });
    const people: Array<{ password_hash: string }> = await dataSource.query(
      'SELECT password_hash FROM people WHERE id = $1',
      [first.id],
    );
    await expect(
      isPasswordRight('senha-nova', people[0].password_hash),
    ).resolves.toBe(true);
    await expect(
      isPasswordRight('senha-antiga', people[0].password_hash),
    ).resolves.toBe(false);
    const revoked: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM sessions WHERE person_id = $1',
      [first.id],
    );
    const kept: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM sessions WHERE person_id = $1',
      [second.id],
    );
    expect(revoked).toHaveLength(0);
    expect(kept).toHaveLength(1);
  });

  it('apaga só as Sessões vencidas', async () => {
    const first = await createPersonOrFail(accounts, uniqueEmail('vencida'));
    const second = await createPersonOrFail(
      accounts,
      uniqueEmail('outra-vencida'),
    );
    const past = new Date(Date.now() - ONE_DAY_MILLISECONDS);
    const future = new Date(Date.now() + ONE_DAY_MILLISECONDS);
    const expiredFirst = randomUUID();
    const expiredSecond = randomUUID();
    const alive = randomUUID();
    await createSessionOrFail(sessions, first.id, expiredFirst, past);
    await createSessionOrFail(sessions, second.id, expiredSecond, past);
    await createSessionOrFail(sessions, first.id, alive, future);

    await accounts.purgeExpiredSessions();

    const expiredFirstRows: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM sessions WHERE token_hash = $1',
      [hashToken(expiredFirst)],
    );
    const expiredSecondRows: Array<unknown> = await dataSource.query(
      'SELECT 1 FROM sessions WHERE token_hash = $1',
      [hashToken(expiredSecond)],
    );
    const aliveRows: Array<{ token_hash: string }> = await dataSource.query(
      'SELECT token_hash FROM sessions WHERE token_hash = $1',
      [hashToken(alive)],
    );
    expect(expiredFirstRows).toHaveLength(0);
    expect(expiredSecondRows).toHaveLength(0);
    expect(aliveRows).toHaveLength(1);
  });
});
