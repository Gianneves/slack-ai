// Comando de contas: via de operação da F01 para criar Pessoas, revogar
// Sessões, redefinir a senha e limpar Sessões vencidas (HLD, seção 2; LLD,
// seções 6.2 e 7). Não passa pelo HTTP, então os resultados de negócio são
// uniões discriminadas, e não DomainError do catálogo da API.
import { normalizeEmail } from '../common/email.js';
import { PeopleRepository } from '../people/people.repository.js';
import { hashPassword } from '../sessions/passwords.js';
import { SessionsRepository } from '../sessions/sessions.repository.js';

export interface CreatePersonInput {
  email: string;
  name: string;
  password: string;
}

export interface CreatedPerson {
  id: string;
  email: string;
}

export type CreatePersonResult =
  CreatedPerson | { error: 'person_already_exists' };

export interface RevokeSessionsInput {
  email: string;
}

export type RevokeSessionsResult = { ok: true } | { error: 'person_not_found' };

export interface ResetPasswordInput {
  email: string;
  password: string;
}

export type ResetPasswordResult = { ok: true } | { error: 'person_not_found' };

export class AccountsService {
  constructor(
    private readonly people: PeopleRepository,
    private readonly sessions: SessionsRepository,
  ) {}

  // Criar Pessoa com e-mail normalizado e hash Argon2id da senha lida da
  // entrada padrão (LLD, seção 6.2).
  async createPerson(input: CreatePersonInput): Promise<CreatePersonResult> {
    const email = normalizeEmail(input.email);
    const existing = await this.people.findByEmail(email);
    if (existing !== null) {
      return { error: 'person_already_exists' };
    }

    const person = await this.people.createPerson({
      email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
    });

    return { id: person.id, email: person.email };
  }

  // Revogar apaga todas as Sessões da Pessoa identificada pelo e-mail
  // normalizado; a próxima requisição com qualquer uma recebe
  // unauthenticated (LLD, seção 6.2).
  async revokeSessions(
    input: RevokeSessionsInput,
  ): Promise<RevokeSessionsResult> {
    const person = await this.people.findByEmail(normalizeEmail(input.email));
    if (person === null) {
      return { error: 'person_not_found' };
    }

    await this.sessions.deleteByPersonId(person.id);
    return { ok: true };
  }

  // Redefinir a senha troca o hash e revoga todas as Sessões da Pessoa na
  // mesma transação (LLD, seção 6.2).
  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    const person = await this.people.findByEmail(normalizeEmail(input.email));
    if (person === null) {
      return { error: 'person_not_found' };
    }

    const passwordHash = await hashPassword(input.password);
    await this.people.manager.transaction(async (manager) => {
      await this.people.updatePasswordHash(person.id, passwordHash, manager);
      await this.sessions.deleteByPersonId(person.id, manager);
    });

    return { ok: true };
  }

  // Limpeza de Sessões vencidas: apaga as que têm expires_at até agora
  // (LLD, seção 7).
  async purgeExpiredSessions(): Promise<void> {
    await this.sessions.deleteExpired(new Date());
  }
}
