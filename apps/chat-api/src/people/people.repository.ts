import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Person } from './person.entity.js';

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
}
