import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { App } from './types.js';
import request from 'supertest';
import { clearData, createPerson, uniqueEmail } from './db.js';
import { createTestApp } from './create-test-app.js';

const SESSIONS_URL = '/v1/sessions';
const WRONG_PASSWORD = 'senha-errada';
const WINDOW_EXPIRED_MINUTES = 16;

function postLogin(app: INestApplication<App>, email: string, password: string) {
  return request(app.getHttpServer()).post(SESSIONS_URL).send({ email, password });
}

// Empurra a janela de tentativas para o passado (caso de tempo fora do
// caminho natural dos testes): a última falha passa a 16 min atrás.
async function expireAttemptWindow(
  dataSource: DataSource,
  email: string,
): Promise<void> {
  await dataSource.query(
    `UPDATE login_attempts
     SET first_failed_at = now() - make_interval(mins => $1)
     WHERE email = $2`,
    [WINDOW_EXPIRED_MINUTES, email],
  );
}

describe('POST /v1/sessions (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    app = await createTestApp();
    // O token padrão da conexão do TypeORM no Nest.
    dataSource = app.get<DataSource>(getDataSourceToken());
    await clearData(dataSource);
  });

  afterEach(async () => {
    await clearData(dataSource);
    await app.close();
  });

  it('responde 201 e grava a sessão para uma credencial certa', async () => {
    const password = 'senha-certa';
    const person = await createPerson(dataSource.manager, password);

    const response = await postLogin(app, person.email, password).expect(201);

    expect(response.body).toMatchObject({
      token: expect.any(String),
      expires_at: expect.any(String),
      person: { id: person.id, email: person.email },
    });
    const rows: Array<{ token_hash: string; person_id: string }> =
      await dataSource.query('SELECT token_hash, person_id FROM sessions');
    expect(rows).toHaveLength(1);
    expect(rows[0].person_id).toBe(person.id);
    expect(rows[0].token_hash).toHaveLength(64);
  });

  it('normaliza o e-mail antes de entrar: sem espaços das pontas e em minúsculas', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    const mixed = `  ${person.email.toUpperCase()}  `;

    await postLogin(app, mixed, 'senha-certa').expect(201);
  });

  it('responde 401 invalid_credentials quando o e-mail não tem conta', async () => {
    const response = await postLogin(app, uniqueEmail(), 'senha-certa').expect(401);

    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Credenciais inválidas.',
      code: 'invalid_credentials',
    });
  });

  it('responde o mesmo corpo a e-mail sem conta e à senha errada', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');

    const missing = await postLogin(app, uniqueEmail(), 'senha-certa');
    const wrong = await postLogin(app, person.email, WRONG_PASSWORD);

    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(missing.body).toEqual({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Credenciais inválidas.',
      code: 'invalid_credentials',
    });
    expect(wrong.body).toEqual(missing.body);
  });

  it('responde 400 validation_error a um e-mail inválido e não conta a tentativa', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 4; i += 1) {
      await postLogin(app, 'não é um e-mail', WRONG_PASSWORD).expect(400);
    }

    await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    const attempts: Array<{ failed_attempts: number }> = await dataSource.query(
      'SELECT failed_attempts FROM login_attempts WHERE email = $1',
      [person.email],
    );
    expect(attempts[0].failed_attempts).toBe(1);
  });

  it('bloqueia o e-mail na falha de número 5 dentro da janela, com Retry-After', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 4; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    }

    const response = await postLogin(app, person.email, WRONG_PASSWORD).expect(429);

    expect(response.body.code).toBe('too_many_login_attempts');
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('responde too_many_login_attempts mesmo com a senha certa durante o bloqueio', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 5; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD);
    }

    const response = await postLogin(app, person.email, 'senha-certa').expect(429);

    expect(response.body.code).toBe('too_many_login_attempts');
  });

  it('não estende o bloqueio com tentativas durante ele', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 5; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD);
    }

    const first = await postLogin(app, person.email, WRONG_PASSWORD).expect(429);
    const second = await postLogin(app, person.email, WRONG_PASSWORD).expect(429);

    expect(second.headers['retry-after']).toBe(first.headers['retry-after']);
  });

  it('recomeça a contagem em 1 com uma falha depois da janela vencida', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 4; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    }
    await expireAttemptWindow(dataSource, person.email);

    // Com a janela vencida, o recomeço em 1 muda o roteiro: a 5ª falha nova
    // (a 9ª no total) só bloqueia quando a contagem nova chega em 5.
    for (let i = 0; i < 4; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    }
    const response = await postLogin(app, person.email, WRONG_PASSWORD).expect(429);

    expect(response.body.code).toBe('too_many_login_attempts');
  });

  it('libera o e-mail quando o bloqueio vence, depois um login certo sai', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 5; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD);
    }
    await dataSource.query(
      `UPDATE login_attempts SET blocked_until = now() - interval '1 second' WHERE email = $1`,
      [person.email],
    );

    await postLogin(app, person.email, 'senha-certa').expect(201);
  });

  it('apaga a contagem no login certo, então a 5ª falha não bloqueia', async () => {
    const person = await createPerson(dataSource.manager, 'senha-certa');
    for (let i = 0; i < 4; i += 1) {
      await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    }

    await postLogin(app, person.email, 'senha-certa').expect(201);
    await postLogin(app, person.email, WRONG_PASSWORD).expect(401);
    const attempts: Array<{ failed_attempts: number }> = await dataSource.query(
      'SELECT failed_attempts FROM login_attempts WHERE email = $1',
      [person.email],
    );
    expect(attempts[0].failed_attempts).toBe(1);
  });
});
