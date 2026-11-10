import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from './types.js';
import { AppModule } from '../src/app.module.js';

// O teste e2e interage só pelo HTTP, e usa createTestApp() para subir a
// aplicação e app.close() para fechá-la (.opencode/rules/nest-api-testing.md).
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app: INestApplication<App> = moduleFixture.createNestApplication();
  app.setGlobalPrefix('v1');
  await app.init();
  return app;
}
