import { Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { ENTITIES } from './entities.js';
import { SnakeNamingStrategy } from './snake-naming-strategy.js';

// O Banco do chat é a fonte da verdade da sessão e de todas as operações
// da API do chat, com controle transacional explícito (HLD, "Componentes").
// A conexão usa a variável DATABASE_URL, validada na subida pelo módulo
// de config (LLD, "Configuração"). O `@Injectable` também faz o compilador
// emitir os metadados que o Nest usa para injetar o ConfigService.
@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const url = this.config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error('DATABASE_URL não definido.');
    }

    return {
      type: 'postgres' as const,
      url,
      entities: ENTITIES,
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    };
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
  ],
})
export class DatabaseModule {}
