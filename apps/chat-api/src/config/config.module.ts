import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SESSION_CONFIG, sessionConfigFactory } from './session-config.js';

// Módulo de config único: lê e valida as variáveis uma vez na subida
// (LLD, "Configuração"). Faltou uma variável obrigatória: o processo falha
// na subida, com o nome da variável na mensagem.
const envSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().integer().port().default(3000),
  SESSION_TTL_DAYS: Joi.number().integer().min(1),
  SESSION_COOKIE_NAME: Joi.string().trim().min(1),
}).unknown(true);

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
  ],
  providers: [{ provide: SESSION_CONFIG, useFactory: sessionConfigFactory }],
  exports: [SESSION_CONFIG],
})
export class ConfigModule {}
