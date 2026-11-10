// DataSource das migrações (CLI do TypeORM e globalSetup dos testes), fora
// do Nest: lê o DATABASE_URL direto do ambiente e compila para
// dist/database/data-source.js com os scripts migration:* do package.json.
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENTITIES } from './entities.js';
import { SnakeNamingStrategy } from './snake-naming-strategy.js';

export function createDataSource(url: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url,
    entities: ENTITIES,
    namingStrategy: new SnakeNamingStrategy(),
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
  });
}

export default new DataSource({
  type: 'postgres',
  url: process.env['DATABASE_URL']!,
  entities: ENTITIES,
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
