import { Person } from '../people/person.entity.js';
import { LoginAttempt } from '../sessions/login-attempt.entity.js';
import { Session } from '../sessions/session.entity.js';

// Lista de entidades da API do chat, para o TypeORM (módulo e migrações).
export const ENTITIES = [Person, Session, LoginAttempt];
