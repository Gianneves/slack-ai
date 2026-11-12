# Plano da F01-T03: Verificação e saída da Sessão na API

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com uma Sessão aberta, quando ela pede a Sessão atual sem ter
passado 1 dia desde o último uso, então recebe 200 com `person.id`, `person.name` e `person.email`,
e `last_used_at` e `expires_at` continuam iguais; quando já passou 1 dia desde o último uso, então
os dois avançam para agora e agora + `SESSION_TTL_DAYS`.

**Teste previsto:** e2e da API, `test/sessions.e2e-spec.ts`, "devolve a pessoa e não renova a
sessão antes de 1 dia" e "renova a sessão depois de 1 dia desde o último uso".

### CA2

**Marca:** teste HTTP

**Cenário:** Dado uma requisição ao `GET` sem cookie, com token desconhecido e com Sessão vencida,
quando a API responde, então os três recebem o mesmo 401 `unauthenticated`, e a linha da Sessão
vencida deixa de existir.

**Teste previsto:** e2e da API, `test/sessions.e2e-spec.ts`, "responde o mesmo 401 unauthenticated
a cookie ausente, token desconhecido e sessão vencida" e "apaga a sessão vencida apresentada";
unidade, `src/sessions/cookies.spec.ts`, "lê o cookie pelo nome e devolve null quando ele falta".

### CA3

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com duas Sessões abertas, quando ela sai com uma delas, então recebe
204 sem corpo, a Sessão usada recebe 401 na requisição seguinte e a outra continua respondendo 200.

**Teste previsto:** e2e da API, `test/sessions.e2e-spec.ts`, "sai apagando só a sessão apresentada
e mantém a outra".

### CA4

**Marca:** teste HTTP

**Cenário:** Dado uma Sessão apagada fora do produto, quando ela é apresentada ao `GET` e ao
`DELETE`, então as duas requisições recebem 401 `unauthenticated`.

**Teste previsto:** e2e da API, `test/sessions.e2e-spec.ts`, "recusa com 401 uma sessão revogada
por apagar a linha".

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa e os testes, quando quem revisa procura o token no `Logger`, no
corpo do 401 e no corpo do 204, então nenhum deles contém o token; o guard não registra o cabeçalho
`Cookie`, e o 204 sai sem corpo.

### CA6

**Marca:** revisão humana

**Cenário:** Dado o contêiner `chat-api`, quando quem revisa roda `pnpm lint`,
`pnpm exec tsc --noEmit`, `pnpm test`, `pnpm test:int`, `pnpm test:e2e` e `pnpm build`, então os
seis terminam com sucesso.

### CA7

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa olha `apps/chat-api/src/migrations/` e o
schema de `sessions`, então não há migração nova e nenhuma coluna, índice ou restrição muda; a
renovação só escreve `last_used_at` e `expires_at`.

## Contrato

### GET /v1/sessions/current · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Protegida pelo `AuthGuard`; o token vem no cookie de Sessão, cujo nome é `SESSION_COOKIE_NAME` (padrão `session`) |
| Parâmetros de caminho e de consulta | Nenhum |
| Corpo da requisição | Nenhum |
| Cabeçalhos de entrada | `Cookie`, com o cookie de Sessão |
| Resposta de sucesso | `200` com `{ "person": { "id": "uuid", "name": "texto", "email": "texto" } }` |
| Cabeçalhos de resposta | Nenhum |
| Erros | `401 unauthenticated` para cookie ausente, token desconhecido ou Sessão vencida, sem distinguir os casos; `500 internal_error` |

### DELETE /v1/sessions/current · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Protegida pelo `AuthGuard`; o token vem no cookie de Sessão, cujo nome é `SESSION_COOKIE_NAME` (padrão `session`) |
| Parâmetros de caminho e de consulta | Nenhum |
| Corpo da requisição | Nenhum |
| Cabeçalhos de entrada | `Cookie`, com o cookie de Sessão |
| Resposta de sucesso | `204`, sem corpo |
| Cabeçalhos de resposta | Nenhum |
| Erros | `401 unauthenticated` para cookie ausente, token desconhecido ou Sessão vencida, sem distinguir os casos; `500 internal_error` |

### Tabelas

Nenhuma tabela criada, alterada ou removida. A tarefa só passa a escrever `last_used_at` e
`expires_at` da tabela `sessions` existente, sem mudança de schema.

## Verificação do contrato

- `GET /v1/sessions/current` com 200 e a Pessoa: CA1.
- `GET /v1/sessions/current` com 401 `unauthenticated`: CA2.
- `GET /v1/sessions/current` com 500 `internal_error`: não precisa de teste próprio; é a resposta
  global do `DomainExceptionFilter` para erro inesperado, sem regra desta tarefa.
- `DELETE /v1/sessions/current` com 204 sem corpo: CA3.
- `DELETE /v1/sessions/current` com 401 `unauthenticated`: CA4.
- `DELETE /v1/sessions/current` com 500 `internal_error`: mesmo motivo do `GET`.
- Leitura do cookie de Sessão pelo nome configurado, e ausência dele: CA1 e CA2; os testes enviam o
  cookie com o nome padrão e fazem uma requisição sem ele.
- Token fora do corpo do erro e fora do log: CA5.
- Nenhuma tabela alterada: CA7.

## Decisões

- **Questão em aberto 1 resolvida com o usuário:** a API do chat passa a ler `SESSION_COOKIE_NAME`,
  com o padrão `session`, a mesma variável e o mesmo padrão do BFF. Uma variável só nas duas pontas
  evita o nome divergente, que recusaria toda Sessão; a decisão foi para o LLD, seção 9, e para a
  spec.
- O nome do cookie entra no `SessionConfig` como `cookieName`, no mesmo padrão de `ttlDays`: o
  schema Joi valida o formato e a fábrica aplica o padrão `session`, porque ela lê `process.env`
  direto. Nenhum outro arquivo lê a variável.
- O guard lê o cabeçalho `Cookie` com um leitor próprio, em `src/sessions/cookies.ts`, sem
  `cookie-parser`: a dependência não existe no projeto e o token é base64url, então não há
  codificação a decodificar. A função é pura e ganha teste de unidade, como o `AGENTS.md` da API
  pede.
- A política de 1 dia fica no service, não no repositório: o service calcula o limite
  (`agora - intervalo`) e passa `lastUsedAt`, `expiresAt` e esse limite; o repositório faz um
  `UPDATE` condicional em `expires_at > agora` e `last_used_at <= limite`. Duas abas não gravam
  duas vezes, e o repositório não conhece a regra.
- A constante do intervalo de renovação fica em `src/sessions/session-limits.ts`, ao lado das do
  limite de login, com o valor de 1 dia em segundos (LLD, seção 9). A duração continua em
  `SESSION_TTL_DAYS`.
- `logout` recebe o `sessionId` que o guard anexou ao request, não o token: o token só existe dentro
  do guard, não é recalculado e não corre risco de ir para o log.
- O `GET` devolve o `person` que o guard anexou; não repete a consulta ao banco. O `DELETE` usa o
  `session.id` anexado.
- Sessão cuja Pessoa não existe mais é tratada como não autenticada: a linha órfã é apagada e o
  erro é `unauthenticated`. A tabela `sessions` não tem chave estrangeira para `people`, e a CA7
  proíbe uma migração nova para criá-la.
- O detalhe do 401 é sempre `Não autenticado.`, sem distinguir cookie ausente, token desconhecido e
  Sessão vencida (LLD, seção 6.2).
- `deleteExpired` também entra no repositório: a spec, seção 3, lista "apagar vencidas" no delta
  deste componente e a tarefa 04 o consome na operação `purge-expired-sessions`; a prova fica no
  teste do comando, na T04. `deleteByPersonId`, que o escopo da tarefa já pede, é provado lá
  também.
- CA6 é a definição de pronto do projeto, e CA7 é uma invariante de schema; nenhum dos dois vira
  teste próprio, e os dois ficam na revisão humana.

## Arquivos e interfaces

- `apps/chat-api/src/sessions/unauthenticated.error.ts` (novo): `UnauthenticatedError extends
  DomainError`, com o code `unauthenticated` e a mensagem `Não autenticado.`.
- `apps/chat-api/src/common/errors/error-code.ts`: `ErrorCode` ganha `'unauthenticated'`.
- `apps/chat-api/src/common/errors/domain-exception.filter.ts`: `unauthenticated` entra no
  `DOMAIN_STATUS` como `401`.
- `apps/chat-api/src/sessions/session-limits.ts` (novo): `SESSION_RENEWAL_INTERVAL_SECONDS`.
- `apps/chat-api/src/sessions/cookies.ts` (novo): `readCookie(header: string | undefined, name:
  string): string | null`.
- `apps/chat-api/src/sessions/auth.guard.ts` (novo): `AuthGuard implements CanActivate`, que lê o
  cookie, chama `SessionsService.authenticate` e anexa ao request; `AuthenticatedRequest`, com
  `session` e `person`; `AuthenticatedPerson`, com `id`, `name` e `email`.
- `apps/chat-api/src/sessions/sessions.service.ts`: `AuthenticatedSession` (`session` com `id`,
  `personId` e `expiresAt`; `person`); `authenticate({ token })`; `logout({ sessionId })`.
- `apps/chat-api/src/sessions/sessions.repository.ts`: `findByTokenHash`, `renew`, `deleteById`,
  `deleteByPersonId` e `deleteExpired`.
- `apps/chat-api/src/people/people.repository.ts`: `findById(id): Promise<Person | null>`.
- `apps/chat-api/src/sessions/sessions.controller.ts`: `GET /v1/sessions/current` e
  `DELETE /v1/sessions/current`, os dois com `@UseGuards(AuthGuard)`.
- `apps/chat-api/src/sessions/sessions.module.ts`: `AuthGuard` entra em `providers`.
- `apps/chat-api/src/config/session-config.ts`: `SessionConfig.cookieName`; a fábrica lê
  `SESSION_COOKIE_NAME`, com o padrão `session`.
- `apps/chat-api/src/config/config.module.ts`: `SESSION_COOKIE_NAME` entra no schema Joi.
- `apps/chat-api/.env.example`: `SESSION_COOKIE_NAME=session`.
- `apps/chat-api/test/sessions.e2e-spec.ts`: um `describe` novo para `GET` e `DELETE
  /v1/sessions/current`, com os casos do CA1 ao CA4.
- `apps/chat-api/src/sessions/cookies.spec.ts` (novo): unidade de `readCookie`.

## Testes existentes que mudam

Nenhum. Os casos de `POST /v1/sessions` continuam iguais; os testes novos entram num `describe`
separado, e o `createTestApp()` existente já sobe o `SessionsModule` com o guard.

## Mudança de dados

Nenhuma.

## Documentos atualizados

- `docs/lld.md`, seção 3, "Segurança", item "Cookie de sessão": o nome vem de
  `SESSION_COOKIE_NAME`, a mesma variável no BFF e na API do chat.
- `docs/lld.md`, seção 9, "Variáveis de ambiente": nova linha `SESSION_COOKIE_NAME` para a API do
  chat e o padrão `session` nas duas linhas.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seções 2 (decisão 4), 3 (delta de
  `src/config/`) e 9 (questão em aberto 1 e tabela de riscos): a questão 1 fica resolvida, com a
  variável na API.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/03-verificacao-e-saida-da-sessao-na-api/tarefa.md`:
  Status para "em andamento" e a nota da dependência da questão 1 sai do campo "Depende de".
