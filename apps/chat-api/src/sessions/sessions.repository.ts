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
