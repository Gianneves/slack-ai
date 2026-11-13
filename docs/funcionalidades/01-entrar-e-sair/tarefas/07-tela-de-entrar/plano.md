# Plano da F01-T07: Tela de entrar

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com conta criada pela empresa, quando ela entra com e-mail e senha
válidos, então chega à Home; e, quando a tela foi aberta com um `?para=` válido, chega ao caminho
pedido.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "entra com credencial válida e chega à Home" e
"entra e volta ao caminho do para válido".

### CA2

**Marca:** teste no Playwright

**Cenário:** Dado a tela de entrar, quando a Pessoa tenta com a senha errada e, depois, com um
e-mail sem conta, então vê a mesma mensagem nas duas vezes, continua na tela e pode tentar de novo
com a credencial certa até chegar à Home.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "credencial errada e e-mail sem conta mostram
a mesma mensagem e permitem tentar de novo".

### CA3

**Marca:** teste no Playwright

**Cenário:** Dado um e-mail bloqueado por tentativas erradas, quando a Pessoa tenta de novo,
inclusive com a senha certa, então continua em `/entrar`, vê a mensagem com o tempo que falta e não
recebe o cookie de Sessão.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "bloqueio mostra o tempo que falta e não grava
a Sessão".

### CA4

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com Sessão válida no navegador, quando ela abre `/entrar`, então chega
à Home, sem ver o formulário.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "abrir /entrar com Sessão válida vai para a
Home".

### CA5

**Marca:** revisão humana

**Cenário:** Dado o `chat-api` parado e um cookie de Sessão no navegador, quando quem revisa abre
`/entrar` seguindo o roteiro manual, então vê a porta de erro com "Não foi possível verificar sua
sessão" e "Tentar de novo", não o formulário, e não é levado a `/entrar`; com a API de volta,
"Tentar de novo" refaz a verificação.

### CA6

**Marca:** teste no Playwright

**Cenário:** Dado a tela de entrar, quando a Pessoa percorre e-mail, senha e o botão só pelo
teclado e envia uma credencial inválida, então a ordem de foco é a dos campos, Enter envia, e a
mensagem aparece num contêiner `role="alert"` ligado aos campos por `aria-describedby`; o axe não
aponta violação na tela.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "formulário funciona por teclado e anuncia o
erro" e "login não tem violações no axe".

### CA7

**Marca:** revisão humana

**Cenário:** Dado a web no ar em 1440 × 900, quando quem revisa compara `/entrar` nos estados
padrão, carregando, credencial inválida, validação, bloqueio e API indisponível com os frames Login
do Figma, nos temas claro e escuro, então encontra os mesmos textos, espaçamento, tipografia,
cores, raios, elevação e estados; o registro fica no `validacao-visual.md` da tarefa.

### CA8

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web` com as dependências instaladas, quando quem revisa roda
`pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com sucesso.

### CA9

**Marca:** teste no Playwright

**Cenário:** Dado um navegador com um cookie de Sessão que a API recusa com 401 (vencido, revogado
ou desconhecido), quando a Pessoa abre `/entrar`, então o cookie é apagado pela rota de limpeza e o
formulário aparece, sem a porta de erro.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "Sessão recusada em /entrar apaga o cookie e
mostra o formulário".

### CA10

**Marca:** revisão humana

**Cenário:** Dado o formulário aberto e o `chat-api` parado, quando a Pessoa envia a credencial,
então continua em `/entrar`, vê a mensagem de indisponibilidade, o botão volta ao normal e, com a
API de volta, a nova tentativa entra e chega à Home.

## Contrato

O contrato não muda. A tarefa cria a página `/entrar`, que é uma tela e não uma rota de API, do BFF
ou um evento; a Server Action `entrar` e a rota `GET /api/session/clear` são consumidas como estão,
sem alteração de campos, status ou comportamento. Nenhum evento de WebSocket e nenhuma tabela são
tocados.

## Verificação do contrato

- **Nenhum item novo de rota, evento ou tabela:** a revisão do diff confirma que a tarefa só cria a
  página e o formulário; a ação e a rota de limpeza continuam com o contrato provado na F01-T05 e
  na F01-T06.
- **A página usa as interfaces existentes sem ampliá-las:** CA1 a CA6 e CA9 provam o caminho pela
  tela, e a revisão confere que `entrar` recebe só `email`, `password` e `para`, e que
  `GET /api/session/clear` é chamada sem parâmetro quando o 401 deve apagar o cookie (CA9).

## Decisões

- **A página `/entrar` é Server Component e o formulário é o único Client Component.** O
  `page.tsx` lê `searchParams`, o cookie e a Sessão, e decide entre formulário, Home e porta de
  erro; `LoginForm` usa `useActionState`, porque precisa de estado de erro e de carregamento. A
  regra de Server Component do `apps/web/AGENTS.md` fica satisfeita: só o formulário tem motivo
  para `"use client"`.
- **`/entrar` declara `instant = false`.** A página lê cookie e `searchParams` e precisa bloquear
  a navegação até saber se mostra o formulário, a Home ou a porta de erro; é o mesmo motivo que a
  F01-T06 usou no layout autenticado. A casca estática não é prometida para essa tela.
- **A presença do cookie separa "sem Sessão" de "Sessão recusada".** A página lê `cookies()` antes
  de `getSession()`: sem cookie, mostra o formulário; com cookie e `unauthenticated` (401), vai para
  `clearSessionUrl()`, a rota da F01-T06, que apaga o cookie e volta a `/entrar` sem `para`; com
  cookie e `authenticated` (200), vai para a Home. `getSession()` devolve `unauthenticated` para
  ausência de token e para 401, por isso a distinção é feita na página e a interface da F01-T06 não
  muda.
- **Sessão válida em `/entrar` vai para a Home, mesmo com `para`.** A spec, seção 6.2, e o CA4
  mandam a Home; o `para` só governa o destino depois do envio do formulário, quando a ação da
  F01-T05 grava o cookie e redireciona (CA1).
- **O `para` é validado no servidor e só chega ao formulário quando é seguro.** A página usa
  `isSafeRedirectPath` da F01-T05; um valor inválido não vira campo escondido. A ação `entrar`
  valida de novo com `safeRedirectPath`, então o formulário não é a autoridade do destino.
- **A ação faz o sucesso; a página não grava cookie nem redireciona no envio.** `LoginForm` só
  chama `entrar(previous, formData)`; o cookie e o `redirect` continuam na Server Action da
  F01-T05, sem duplicação.
- **Os erros usam um único `role="alert"`, com o texto do frame Login.** `invalid_credentials` e
  e-mail sem conta compartilham a mesma constante, o que garante a mensagem idêntica do CA2. Em
  `invalid_credentials` e `validation_error`, os dois campos recebem `aria-invalid` e
  `aria-describedby` apontando para o alerta; nos demais estados, só o alerta é anunciado. As
  frases ficam em `LOGIN_MESSAGES`, preenchidas com o Figma, sem texto inventado no código.
- **O formulário usa `noValidate`.** A validação é a da API, que devolve `validation_error`; assim
  a mensagem sai no desenho do produto, não no balão do navegador. Os campos obrigatórios não
  bloqueiam o envio no cliente.
- **O foco nasce no e-mail e a ordem é nativa.** `autoFocus` no primeiro campo e os controles
  nativos bastam para o CA6; não há tratamento de teclado próprio. O botão usa `pending` do
  `useActionState` como `loading` do `Button`: mostra o `Spinner` e fica desabilitado durante o
  envio, e só ele.
- **O bloqueio mostra o tempo e mantém o servidor como autoridade.** `formatRetryAfter` converte os
  `retryAfterSeconds` do `Retry-After`: minutos arredondados para cima a partir de 60 s, segundos
  abaixo disso, e a frase do frame recebe o valor. Não há contagem regressiva no cliente nem
  reabilitação automática; o formulário continua disponível e a próxima tentativa é recusada pelo
  servidor, sem parecer bem-sucedida.
- **API indisponível no envio é erro do formulário, não a porta de sessão.** O resultado
  `unavailable` da ação mantém a Pessoa na tela de entrar com a mensagem do frame Login; a porta de
  erro da F01-T06 é só da falha de verificação da Sessão (spec, seções 6.1 e 6.2).
- **"Tentar de novo" da porta de erro volta para `/entrar` com o `para` seguro.** A página monta o
  `retryHref` com `appendRedirectParam` quando o `para` é válido e usa `/entrar` quando não é; com a
  Sessão válida, a nova verificação leva à Home, como no CA4.
- **Sem dependência nem primitivo novo.** A tela usa `Field`, `Input`, `Button` e `Spinner` da
  F01-T02, `SessionError` da F01-T06 e os tokens da F01-T01; nenhuma biblioteca entra nesta tarefa.
- **A suíte Playwright continua na F01-T09.** A spec, seção 8, define um único ponto de teste da
  web, a suíte da T09. Por isso CA1 a CA4, CA6 e CA9 são previstos para `e2e/login.spec.ts`, e CA5,
  CA7, CA8 e CA10 ficam no roteiro manual, na validação visual e na revisão; esta tarefa não monta
  a infraestrutura de e2e.
- **Os textos e o desenho vêm dos frames Login do Figma, buscados na implementação.** A sessão de
  planejamento só tem o link e o `docs/design-system.md`, então o plano fixa a fonte, não as
  frases: quem implementa abre a sessão do Figma conforme o design system e preenche
  `LOGIN_MESSAGES` e a composição do cartão a partir dos frames. Se a ferramenta do Figma não
  estiver disponível ou um estado (por exemplo, API indisponível) não tiver frame, a implementação
  para e pede o texto, em vez de inventar.
- **O CA9 foi acrescentado à tarefa e ao plano.** O 401 no `/entrar` usa a rota de limpeza da
  F01-T06 sem `para`, como a spec, seção 6.2, manda; o teste do Playwright usa um token que a API
  recusa para provar o caminho sem esperar os 30 dias da `Duração da Sessão`. A distinção entre
  "sem cookie" e "cookie recusado" é a decisão acima de ler `cookies()` antes de `getSession()`.
- **O CA10 foi acrescentado à tarefa e ao plano.** O resultado `unavailable` da ação mantém a
  Pessoa no formulário com a mensagem do frame Login; o teste é manual no `roteiro-manual.md`
  porque derrubar a API no meio do envio não é roteável pelo Playwright. A porta de erro da
  F01-T06 continua reservada à falha de verificação da Sessão.

## Arquivos e interfaces

- `apps/web/src/app/entrar/page.tsx` (novo): `export const instant = false`; `EntrarPage({
  searchParams }: PageProps<"/entrar">)`; lê o `para`, confere a presença do cookie, chama
  `getSession()`, redireciona para `/` no 200, para `clearSessionUrl()` no 401 com cookie, renderiza
  `SessionError` com o `retryHref` no `unavailable` e o cartão com `LoginForm` sem cookie.
- `apps/web/src/app/components/auth/login-form.tsx` (novo): `"use client"`; `LoginForm({ para }:
  { para: string | null })`; `useActionState(entrar, null)`; `LOGIN_MESSAGES` com as frases do
  frame Login; `formatRetryAfter(seconds: number): string`; `Field`, `Input` e `Button` com os
  atributos de acessibilidade; o alerta único e o campo escondido do `para`.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/07-tela-de-entrar/roteiro-manual.md` (novo, na
  implementação): passos do CA5 e do CA10 com o `chat-api` parado.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/07-tela-de-entrar/validacao-visual.md` (novo, na
  implementação): registro do CA7 nos dois temas.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/07-tela-de-entrar/tarefa.md`: Status para "em
  andamento".

Nenhuma mudança em `apps/web/src/app/actions/session.ts`, `services/sessions.ts`,
`queries/session.ts`, `components/session/session-error.tsx`, `proxy.ts`, `globals.css` ou no
`package.json`.

## Testes existentes que mudam

Nenhum. A web ainda não tem suíte de testes; a suíte Playwright nasce na F01-T09. A ação `entrar` e
a porta de sessão da F01-T06 são reaproveitadas sem mudança de comportamento.

## Mudança de dados

Nenhuma. Não há seed nem backfill; a Sessão criada ao entrar é a mesma da API.

## Documentos atualizados

- Nenhum documento de regra muda no commit de plano. O HLD e o LLD já descrevem a tela de entrar e
  a verificação da Sessão na seção 8; a spec já fixa o fluxo na seção 6.2.
- `docs/lld.md`, seção 8, "Telas": a situação de `/entrar` passa de "planejada" para "existe" no
  fim da implementação, porque a tabela é uma foto do estado, não uma regra.
- `docs/design-system.md`, seção "Estado atual": a linha "Telas" passa a incluir a tela de entrar
  no fim da implementação, também como foto do estado.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/07-tela-de-entrar/tarefa.md`: CA9 e CA10
  acrescentados aos critérios, e Status para "em andamento" no commit de plano.
