import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { ConfigModule } from './config/config.module.js';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [ConfigModule, DatabaseModule, SessionsModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Filtro de erros e validação de entrada registrados no AppModule, para
    // valerem também nos testes (apps/chat-api/AGENTS.md).
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
