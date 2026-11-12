import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { generateUuidV7 } from '../common/uuid/uuid-v7.js';
import { Session } from './session.entity.js';

// Dados de uma sessão nova, com o token já no SHA-256.
export interface NewSession {
  personId: string;
  tokenHash: string;
  lastUsedAt: Date;
  expiresAt: Date;
}

@Injectable()
export class SessionsRepository extends Repository<Session> {
  constructor(dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  // Busca a Sessão apresentada pelo SHA-256 do token. Token desconhecido é
  // resultado de negócio e devolve null.
  findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.findOneBy({ tokenHash });
  }

  // Sair e Sessão vencida apagam a linha apresentada (LLD, seção 6.2).
  async deleteById(sessionId: string): Promise<void> {
    await this.delete({ id: sessionId });
  }

  // Renovação condicional: duas abas não gravam duas vezes, e uma Sessão que
  // venceu entre a leitura e a escrita não é renovada (LLD, seção 6.2).
  async renew(
    sessionId: string,
    now: Date,
    expiresAt: Date,
    dueBefore: Date,
  ): Promise<boolean> {
    const updated: Array<{ id: string }> = await this.query(
      `UPDATE sessions
       SET last_used_at = $2, expires_at = $3, updated_at = $2
       WHERE id = $1 AND expires_at > $2 AND last_used_at <= $4
       RETURNING id`,
      [sessionId, now, expiresAt, dueBefore],
    );
    return updated.length > 0;
  }

  // Revogar pelo comando de contas apaga as Sessões da Pessoa (LLD, seção 6.2).
  async deleteByPersonId(personId: string): Promise<void> {
    await this.delete({ personId });
  }

  // Limpeza de Sessões vencidas pelo comando de contas (LLD, seção 7).
  async deleteExpired(now: Date): Promise<void> {
    await this.query('DELETE FROM sessions WHERE expires_at <= $1', [now]);
  }

  // Criação dentro de transação recebe o manager, para o login gravar a
  // sessão e apagar a contagem de tentativas de forma atômica.
  async createSession(
    newSession: NewSession,
    manager?: EntityManager,
  ): Promise<Session> {
    const session = new Session();
    // Id em UUID v7, gerado na aplicação (ADR 0022).
    session.id = generateUuidV7();
    session.personId = newSession.personId;
    session.tokenHash = newSession.tokenHash;
    session.lastUsedAt = newSession.lastUsedAt;
    session.expiresAt = newSession.expiresAt;

    return (manager ?? this.manager).save(session);
  }
}
