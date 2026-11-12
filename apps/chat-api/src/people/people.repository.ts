import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { generateUuidV7 } from '../common/uuid/uuid-v7.js';
import { Person } from './person.entity.js';

// Dados de uma Pessoa nova, criada fora do produto pelo comando de contas
// (HLD, seção 2; LLD, seção 6.2).
export interface NewPerson {
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class PeopleRepository extends Repository<Person> {
  constructor(dataSource: DataSource) {
    super(Person, dataSource.createEntityManager());
  }

  // Leitura de um registro: se o e-mail não tem conta, o resultado é
  // de negócio e o método devolve null ("nest-api-code-standards.md").
  findByEmail(email: string): Promise<Person | null> {
    return this.findOneBy({ email });
  }

  // Pessoa da Sessão autenticada. Pessoa apagada fora do produto é resultado
  // de negócio e devolve null.
  findById(id: string): Promise<Person | null> {
    return this.findOneBy({ id });
  }

  // Criar Pessoa pelo comando de contas (LLD, seção 6.2).
  async createPerson(
    newPerson: NewPerson,
    manager?: EntityManager,
  ): Promise<Person> {
    const person = new Person();
    // Id em UUID v7, gerado na aplicação (ADR 0022).
    person.id = generateUuidV7();
    person.email = newPerson.email;
    person.name = newPerson.name;
    person.passwordHash = newPerson.passwordHash;

    return (manager ?? this.manager).save(person);
  }

  // Troca do hash pelo reset-password do comando de contas, dentro da
  // transação que também apaga as Sessões (LLD, seção 6.2).
  async updatePasswordHash(
    personId: string,
    passwordHash: string,
    manager?: EntityManager,
  ): Promise<void> {
    await (manager ?? this).query(
      'UPDATE people SET password_hash = $2, updated_at = now() WHERE id = $1',
      [personId, passwordHash],
    );
  }
}
