import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module.js';
import { Person } from '../people/person.entity.js';
import { PeopleRepository } from '../people/people.repository.js';
import { LoginAttempt } from './login-attempt.entity.js';
import { LoginAttemptsRepository } from './login-attempts.repository.js';
import { AuthGuard } from './auth.guard.js';
import { Session } from './session.entity.js';
import { SessionsController } from './sessions.controller.js';
import { SessionsRepository } from './sessions.repository.js';
import { SessionsService } from './sessions.service.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Person, Session, LoginAttempt]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, PeopleRepository, SessionsRepository, LoginAttemptsRepository, AuthGuard],
})
export class SessionsModule {}
