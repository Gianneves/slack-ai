// Tipos compartilhados dos testes. O subpath 'supertest/types' não resolve
// com @types/supertest 7 no TS nodenext; o tipo vem do próprio types.d.ts.
import type { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import type { Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import type { Server } from 'node:net';

export type App =
  | Server
  | RequestListener<typeof IncomingMessage, typeof ServerResponse>
  | ((request: Http2ServerRequest, response: Http2ServerResponse) => void | Promise<void>);
