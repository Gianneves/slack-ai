// Atalhos da base para os testes: cada teste cria os próprios dados, com
// uniqueEmail(), e não depende da ordem nem do dado de outro teste
// (.opencode/rules/nest-api-testing.md).
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { generateUuidV7 } from '../src/common/uuid/uuid-v7.js';
import { hashPassword } from '../src/sessions/passwords.js';
import { Person } from '../src/people/person.entity.js';
import { Session } from '../src/sessions/session.entity.js';
import { LoginAttempt } from '../src/sessions/login-attempt.entity.js';

// E-mails e2e no domínio teste.local, apagados por prefixo ou pelo
// down -v (LLD, "Ambiente de desenvolvimento").
export function uniqueEmail(prefix: string = 'e2e'): string {
  return `${prefix}-${randomUUID()}@teste.local`;
}

export interface CreatedPerson {
  id: string;
  email: string;
  password: string;
}

// Preparação que pode falhar usa um atalho que falha sozinho: lança em vez
// de devolver null.
export async function createPerson(
  manager: EntityManager,
  password: string,
): Promise<CreatedPerson> {
  const email = uniqueEmail();
  const created = await manager.getRepository(Person).save({
    id: generateUuidV7(),
    email,
    name: 'Pessoa de Teste',
    passwordHash: await hashPassword(password),
  });
  return { id: created.id, email, password };
}

export async function clearData(dataSource: DataSource): Promise<void> {
  await dataSource.getRepository(Session).clear();
  await dataSource.getRepository(LoginAttempt).clear();
  await dataSource.getRepository(Person).clear();
}
