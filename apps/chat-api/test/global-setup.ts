// Base de dados dos testes de integração e e2e: o banco chat_test, criado
// pelo script de inicialização do Postgres e, se faltar, aqui no globalSetup,
// que conecta como o superusuário local para criá-lo (o papel chat não tem
// CREATEDB) e roda as migrações (LLD, "Ambiente de desenvolvimento").
import { DataSource } from 'typeorm';

export const ADMIN_DATABASE_URL: string =
  'postgresql://postgres:postgres@postgres:5432/postgres';
export const TEST_DATABASE_URL: string =
  'postgresql://chat:chat@postgres:5432/chat_test';

export default async function globalSetup(): Promise<void> {
  process.env['DATABASE_URL'] = TEST_DATABASE_URL;

  const admin = new DataSource({
    type: 'postgres',
    url: ADMIN_DATABASE_URL,
  });
  await admin.initialize();
  const existing = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = 'chat_test'`,
  );
  if (existing.length === 0) {
    await admin.query('CREATE DATABASE chat_test OWNER chat');
  }
  await admin.destroy();

  // Migrações compiladas em dist/migrations, produzidas pelo pnpm build
  // que roda antes da suíte (script test:e2e e test:int).
  const migrations = new DataSource({
    type: 'postgres',
    url: TEST_DATABASE_URL,
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
    synchronize: false,
  });
  await migrations.initialize();
  await migrations.destroy();
}
