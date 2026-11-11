import { afterEach, beforeEach, describe, it } from 'vitest';
import request from 'supertest';
import type { App } from './types.js';
import type { INestApplication } from '@nestjs/common';
import { createTestApp } from './create-test-app.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect('Hello World!');
  });
});
