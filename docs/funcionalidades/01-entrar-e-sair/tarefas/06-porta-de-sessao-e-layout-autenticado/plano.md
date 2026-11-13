# Plano da F01-T06: Porta de sessão e layout autenticado

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão válida e a web apontando para a API real, quando ela abre a
Home, então a tela logada renderiza e mostra o nome da Pessoa devolvido pela verificação da Sessão.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "Sessão válida renderiza a Home com a Pessoa
da verificação".

### CA2

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão vencida ou revogada e o cookie ainda no navegador, quando
ela abre uma tela logada, então o BFF apaga o cookie e a leva a `/entrar?para=<caminho>` na
renderização seguinte.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "Sessão vencida ou revogada apaga o cookie e
leva a /entrar com o para".

### CA3

**Marca:** revisão humana

**Cenário:** Dado o `chat-api` parado e a web no ar, quando quem revisa abre uma tela logada e
executa o roteiro manual, então vê a porta de erro com "Não foi possível verificar sua sessão" e
"Tentar de novo", continua na tela logada e não é levada a `/entrar`; a revisão do serviço confere
que 5xx e a verificação acima de 5 segundos caem no mesmo resultado `unavailable` que renderiza
essa porta.

### CA4

**Marca:** revisão humana

**Cenário:** Dado o diff da porta de sessão, quando quem revisa procura as chamadas de verificação,
então encontra uma única função embrulhada no `cache()` do React, chamada pelo layout e pela página,
sem `fetch` direto em componente; um render faz uma verificação só.

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff, quando quem revisa procura o microtexto e o componente da porta de erro,
então encontra um único `SessionError` em `src/app/components/session/`, sem cópia em `(app)` nem em
`/entrar`; as telas seguintes importam esse componente.

### CA6

**Marca:** revisão humana

**Cenário:** Dado a web no ar e uma Pessoa com Sessão, quando quem revisa inspeciona a resposta de
uma tela logada, então encontra `Cache-Control: no-store`; e, depois de sair, voltar pelo histórico
recarrega a página e não mostra o conteúdo da Sessão encerrada.

### CA7

**Marca:** revisão humana

**Cenário:** Dado a porta de erro renderizada com o `chat-api` parado, quando quem revisa percorre a
tela só pelo teclado, então alcança "Tentar de novo", ativa com Enter e a falha é anunciada por
`role="alert"`; a execução do axe nesse estado não aponta violação.

### CA8

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web` com as dependências instaladas, quando quem revisa roda
`pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com sucesso.

## Contrato

### GET /api/session/clear · nova

| Item | O que descreve |
| --- | --- |
| Autenticação | Pública; não exige Sessão e não chama a API do chat |
| Parâmetros de consulta | `para` (string, opcional): caminho relativo que começa com `/` e não com `//`; qualquer outro valor é tratado como ausente |
| Corpo da requisição | Nenhum |
| Cabeçalhos de entrada | Nenhum além dos padrões do navegador; o cookie não é lido |
| Resposta de sucesso | `303 See Other`, sem corpo, com `Location` apontando para `/entrar?para=<caminho codificado>` quando `para` é válido, ou para `/entrar` quando ausente ou inválido |
| Cabeçalhos de resposta | `Set-Cookie: <SESSION_COOKIE_NAME>=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`, mais `Secure` quando `SESSION_COOKIE_SECURE` for verdadeiro e `Domain` quando `SESSION_COOKIE_DOMAIN` não for vazio; `Cache-Control: no-store`; `Location` |
| Erros | Nenhum erro de negócio; `para` inválido não gera 4xx e cai no destino padrão. Uma falha inesperada segue o tratamento padrão do Next, sem código de erro de negócio |
| Rota da API chamada | Nenhuma; a Sessão já foi recusada com 401 |
| O que acrescenta ou tira no caminho | Apaga o cookie de Sessão e redireciona; não repassa token, não lê corpo e não expõe token |

O contrato não muda em eventos nem em tabelas. A tarefa não cria nem altera evento de WebSocket ou
tabela.

## Verificação do contrato

- **`303` e `Location` com `para` válido:** CA2 prova que a Sessão vencida ou revogada leva de volta
  ao caminho pedido.
- **`Location: /entrar` com `para` inválido:** a revisão do diff confere o uso do `safeRedirectPath`,
  o mesmo validador já provado na F01-T05 CA3; a rota não introduz um caminho novo de validação.
- **`Set-Cookie` com `Max-Age=0` e os atributos do LLD:** CA2 prova que o cookie deixa de existir no
  navegador; a revisão confere que os atributos são os mesmos da F01-T05.
- **`Cache-Control: no-store` da rota:** a revisão do diff confere o cabeçalho; não é uma tela
  logada coberta por CA6.
- **Nenhum erro de negócio:** não há status de erro a provar; a rota trata `para` inválido como
  ausência e não chama a API.
- **Nenhum evento ou tabela:** não há item a provar; a revisão do diff confirma que a tarefa não
  toca `packages/chat-events` nem migrações.

## Decisões

- **A limpeza do cookie no 401 é uma rota do BFF, não uma ação no cliente.** O layout e a tela de
  entrar chamam `GET /api/session/clear?para=` por `redirect`, que funciona sem JavaScript e mantém
  a decisão no servidor. A rota não chama a API, porque a Sessão já foi recusada (spec, decisão 11;
  questão 2 resolvida). É `GET` porque um Server Component só redireciona por navegação; o efeito
  se limita a apagar o cookie e o `para` é validado, então não há mutação de dados nem destino
  externo.
- **A rota fica fora do proxy.** O `matcher` do proxy passa a excluir `api`; assim a rota de
  limpeza não é interceptada e um pedido sem cookie não vira `/entrar?para=/api/session/clear`.
- **O caminho pedido chega ao layout por `x-pathname`.** O proxy escreve o caminho e a busca no
  cabeçalho de requisição `x-pathname` com `NextResponse.next({ request: { headers } })`; o layout
  lê por `headers()` e valida com `safeRedirectPath` antes de montar a URL da rota e o `retryHref`
  da porta de erro. Não usa `Referer` e não confia em cabeçalho vindo do cliente, porque o proxy
  sobrescreve o valor.
- **O layout autenticado usa `instant = false`.** Com `cacheComponents: true`, ler `cookies()` ou
  `headers()` fora de uma fronteira de `Suspense` impede a pré-renderização; a porta de sessão
  precisa bloquear a navegação até saber se a Sessão vale, em vez de transmitir a casca antes.
  O layout raiz continua como está.
- **`Cache-Control: no-store` é acrescentado pelo proxy.** A página dinâmica já tende a sair sem
  cache, mas o LLD exige o cabeçalho explícito; o proxy o define em `NextResponse.next()` para as
  rotas logadas, sem depender da classificação do Next. `/entrar` e `/api` ficam fora do `matcher`.
- **A verificação fica em `src/app/queries/`, como manda o `AGENTS.md` da web.** A consulta
  cacheada é uma query, não um componente; `src/app/components/session/` recebe a porta de erro, a
  fronteira e a recarga do bfcache. A spec, seção 3, foi ajustada para separar as duas peças.
- **A verificação é cacheada com `cache()` do React.** `getSession()` lê o cookie e chama
  `verifySession(token)` da F01-T05, devolvendo `authenticated`, `unauthenticated` ou `unavailable`.
  O layout e a página chamam a mesma função; o `cache()` deduplica dentro do render e faz uma única
  ida à API (LLD, seção 8; spec, decisão 6).
- **A Pessoa sai da verificação, não de uma prop do layout.** A página chama `getSession()` de novo
  e usa `session.person`; o layout não passa dados para `children`. Assim CA1 e CA4 são provados
  pela mesma chamada cacheada.
- **Porta protegida e porta pública compartilham as peças, não o fluxo.** `SessionBoundary` é usada
  pelo layout e pelas páginas logadas: 200 renderiza `children`, 401 redireciona para a rota de
  limpeza, falha renderiza `SessionError`. A tela de entrar, na F01-T07, usa `getSession()` e
  `SessionError` diretamente, porque nela o 401 mostra o formulário em vez de redirecionar. O
  microtexto fica num componente só.
- **O botão "Tentar de novo" é um link.** `SessionError` usa `EmptyState` da F01-T02 e um `Link`
  para o caminho atual, estilizado com `buttonVariants`, exportado de `button.tsx`. O link funciona
  por teclado e sem JavaScript; o `retryHref` é o `x-pathname` do layout ou `/entrar` na tela de
  entrar. A mensagem fica dentro de um contêiner com `role="alert"`.
- **O bfcache é tratado no cliente.** `BfcacheReload` é um Client Component mínimo que escuta
  `pageshow` e chama `window.location.reload()` quando `event.persisted`; ele não renderiza nada e
  fica dentro da porta autenticada.
- **A Home desta tarefa é uma prova, não o conteúdo final.** `src/app/page.tsx` passa para
  `src/app/(app)/page.tsx` e mostra apenas a Pessoa da verificação; a F01-T08 substitui pelo
  conteúdo do Figma. A tela de entrar continua na F01-T07.
- **Sem teste próprio nesta tarefa.** A spec, seção 8, define a web com um único ponto de teste, o
  Playwright da F01-T09, e manda a falha de verificação para o roteiro manual. Por isso CA1 e CA2
  são previstos para a suíte da T09; CA3 a CA8 ficam na revisão humana e no roteiro manual. Esta
  tarefa não monta a infraestrutura de e2e.

## Arquivos e interfaces

- `apps/web/src/app/queries/session.ts` (novo): `SessionState` e
  `getSession = cache(async (): Promise<SessionState>)`; lê o cookie e chama `verifySession`;
  `clearSessionUrl(pathname?: string): string`, que valida o caminho e monta a rota de limpeza.
- `apps/web/src/app/components/session/session-boundary.tsx` (novo): `SessionBoundary({ children })`;
  Server Component que usa `getSession`, `headers()` e a porta de erro; 401 redireciona, falha
  renderiza `SessionError`, 200 renderiza `children`.
- `apps/web/src/app/components/session/session-error.tsx` (novo): `SessionError({ retryHref })`;
  `EmptyState` com ícone de indisponibilidade, título "Não foi possível verificar sua sessão" e o
  link "Tentar de novo".
- `apps/web/src/app/components/session/bfcache-reload.tsx` (novo): `"use client"`;
  `BfcacheReload()`, que escuta `pageshow` e recarrega quando `persisted`.
- `apps/web/src/app/(app)/layout.tsx` (novo): `AuthenticatedLayout`, `export const instant = false`;
  renderiza `SessionBoundary` e `BfcacheReload` ao redor de `children`.
- `apps/web/src/app/(app)/page.tsx` (movido de `src/app/page.tsx`): Home de prova, com
  `SessionBoundary` e o nome da Pessoa vindo de `getSession()`.
- `apps/web/src/app/page.tsx` (removido): a página inicial do esqueleto sai da raiz; a rota `/`
  passa a ser servida pelo grupo `(app)`.
- `apps/web/src/app/api/session/clear/route.ts` (novo): `GET(request: NextRequest): NextResponse`;
  valida `para`, apaga o cookie com os atributos da F01-T05 e responde com `303` para `/entrar`.
- `apps/web/src/proxy.ts` (alterado): acrescenta `x-pathname` à requisição, `Cache-Control: no-store`
  à resposta e exclui `api` do `matcher`.
- `apps/web/src/app/components/ui/button.tsx` (alterado): exporta `buttonVariants` para o link da
  porta de erro.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/06-porta-de-sessao-e-layout-autenticado/roteiro-manual.md`
  (novo, na implementação): passos de CA3, CA6 e CA7 com o `chat-api` parado.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/06-porta-de-sessao-e-layout-autenticado/tarefa.md`:
  Status para "em andamento".

## Testes existentes que mudam

Nenhum teste automatizado existe na web ainda; a suíte Playwright nasce na F01-T09. O comportamento
do proxy previsto na F01-T05 CA5 continua: sem cookie, ele redireciona a `/entrar?para=<caminho>`. A
mudança desta tarefa só acrescenta os cabeçalhos `x-pathname` e `Cache-Control: no-store` e exclui
`/api` do `matcher`.

## Mudança de dados

Nenhuma. Não há seed nem backfill; a Sessão continua sendo a mesma da API.

## Documentos atualizados

- `docs/lld.md`, seção 5, "Índice das rotas": nova rota `GET /api/session/clear` do BFF, planejada,
  que apaga o cookie de Sessão no 401.
- `docs/lld.md`, seção 8, "Sessão no cliente": o 401 passa pela rota de limpeza; o proxy repassa
  `x-pathname` e acrescenta `Cache-Control: no-store`; a rota de limpeza fica fora do proxy.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 2, decisão 11: a limpeza do cookie no 401
  é a rota `GET /api/session/clear`, com o `para` validado e sem chamada à API.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 5, "BFF (web)": a linha da porta de limpeza
  vira a rota `GET /api/session/clear`.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 3, "Componentes afetados": a verificação
  cacheada sai de `components/session/` e entra em `queries/session.ts`; `components/session/` fica
  com a porta de erro e a recarga do bfcache; a Home passa a `src/app/(app)/page.tsx`.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seções 6.1, 6.2 e 6.3: o 401 passa pela rota de
  limpeza.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9: risco do 401 e questão 2 atualizados e
  resolvidos.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/06-porta-de-sessao-e-layout-autenticado/tarefa.md`:
  escopo e dependências apontam para a rota resolvida; Status para "em andamento".
