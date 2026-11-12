# Plano da F01-T05: Cliente de Sessão no BFF

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com conta criada pela empresa e a web apontando para a API real, quando
ela entra com e-mail e senha válidos e um `para` válido, então o navegador recebe o cookie de Sessão
com `HttpOnly`, `Secure` conforme a variável, `SameSite=Lax`, `Path=/`, `Max-Age` de 400 dias e o
`Domain` da variável, e é levada ao `para` ou à Home.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "entrar grava o cookie de Sessão com os
atributos do LLD e leva ao destino".

### CA2

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa com duas Sessões abertas em navegadores diferentes, quando ela sai por
um deles, então o cookie daquele navegador é apagado, ela volta a `/entrar` e a outra Sessão
continua valendo.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "sair apaga o cookie, leva a /entrar e mantém
a outra Sessão".

### CA3

**Marca:** teste no Playwright

**Cenário:** Dado `?para=` ausente, inválido, `//outro` ou uma URL absoluta, quando a Pessoa entra,
então ela vai para a Home; e a validação é refeita no servidor, não só na tela.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "leva à Home quando o para é inválido ou
começa com //"; a revisão do diff confere que a Server Action chama o mesmo validador do proxy.

### CA4

**Marca:** revisão humana

**Cenário:** Dado o serviço de Sessão e o roteiro manual com o `chat-api` parado, quando quem revisa
olha as três respostas, então 200 devolve a Pessoa, 401 vira `unauthenticated`, e rede, 5xx e os 5
segundos esgotados viram `unavailable`; nenhum desses casos é transformado em redirecionamento pelo
serviço.

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado uma Pessoa sem cookie, quando ela abre uma tela logada, então o proxy a leva a
`/entrar?para=<caminho>` sem chamar a API; com o cookie presente, o proxy deixa a requisição passar.
A ausência de `fetch` no proxy é conferida no diff.

**Teste previsto:** e2e da web, `e2e/session.spec.ts`, "redireciona a área logada sem cookie para
/entrar com o para".

### CA6

**Marca:** revisão humana

**Cenário:** Dado o diff e a execução do Playwright, quando quem revisa procura o token nos logs, nas
respostas de erro, no retorno das Server Actions e no `document.cookie`, então ele só aparece no
cookie `HttpOnly`; nenhum log, mensagem de erro ou retorno de ação o contém.

### CA7

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web` com o `.env` local criado a partir do `.env.example`, quando quem
revisa roda `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com
sucesso.

## Contrato

O contrato não muda. A tarefa não cria nem altera rota, evento ou tabela. As Server Actions `entrar`
e `sair` são interfaces do BFF descritas na spec, seção 5, e não rotas HTTP; não há evento nem
tabela.

## Verificação do contrato

- Nenhum item de contrato a provar. As interfaces do BFF são provadas por CA1 a CA3, e a ausência
  de rota, evento ou tabela é conferida na revisão do diff.

## Decisões

- **Configuração validada na subida:** `src/config/env.ts` usa zod e exporta `ENV` já tipado.
  `CHAT_API_URL` e `SESSION_COOKIE_SECURE` são obrigatórias; `SESSION_COOKIE_NAME` tem o padrão
  `session` e `SESSION_COOKIE_DOMAIN` pode ser vazio (cookie só de host). O `.env.example` traz
  valores falsos; o `.env` local, ignorado, é criado a partir dele para rodar e compilar. Faltou
  variável obrigatória: o processo falha na subida com o nome dela (LLD, seção 3).
- **`zod` entra no `package.json` nesta tarefa:** a spec, seção 3, já lista `zod` no delta do
  `package.json`, mas o arquivo atual não o tem. A instalação é feita no contêiner `web`, como manda
  o `AGENTS.md` da raiz.
- **Cookie gravado e apagado com os mesmos atributos:** a Server Action usa `cookies()` com
  `httpOnly`, `secure` vindo de `SESSION_COOKIE_SECURE`, `sameSite: 'lax'`, `path: '/'` e `maxAge`
  de 400 dias; `domain` só entra quando a variável não é vazia. A remoção usa
  `set(nome, '', { maxAge: 0, ...os mesmos atributos })`, e não `delete(nome)`, para o navegador
  apagar o cookie com o mesmo `Domain` e `Path` (LLD, seção 3).
- **Serviço HTTP sem regra de negócio:** `src/app/services/sessions.ts` expõe `login`,
  `verifySession` e `logout`; `login` recebe as credenciais, e `verifySession` e `logout` recebem o
  token que a ação leu do cookie e montam o cabeçalho
  `Cookie: <SESSION_COOKIE_NAME>=<token>`. A verificação usa `cache: 'no-store'` e
  `AbortSignal.timeout(5000)`; entrar e sair não ganham esse limite porque a spec, seção 6.5, fixa
  os 5 segundos só para a verificação. O serviço devolve resultado discriminado para os casos
  esperados, não lança erro de negócio e não registra token, cookie nem corpo.
- **Tradução dos erros:** entrar trata 201 como sucesso; 401 `invalid_credentials`; 429
  `too_many_login_attempts` com os segundos do `Retry-After`; 400 `validation_error`; rede, tempo
  esgotado, 5xx e corpo ilegível como `unavailable`. Verificar trata 200 como autenticada, 401 como
  `unauthenticated` e o resto como `unavailable`. Sair trata 204 como concluído, 401 como
  `unauthenticated` e o resto como `unavailable`. O LLD ainda não fixa a tradução de erro do BFF; a
  spec, decisão 5, fixa a tradução para as ações de Sessão.
- **Assinatura das ações para a tarefa 07:** `entrar(previous, formData)` é compatível com
  `useActionState` e lê `email`, `password` e `para` do `FormData`; devolve o tipo discriminado com
  `invalid_credentials`, `too_many_attempts`, `validation_error` ou `unavailable`. `sair()` não
  recebe argumento e serve a um `<form action={sair}>`. O sucesso de entrar grava o cookie e chama
  `redirect`; o sucesso de sair apaga o cookie e chama `redirect('/entrar')`.
- **`?para=` validado no servidor:** `safeRedirectPath(value)` devolve o valor só quando ele começa
  com `/` e não com `//`; qualquer outro valor vira `/`. O proxy usa a função para montar o
  redirecionamento e a Server Action usa de novo para decidir o destino, sem confiar no formulário
  (LLD, seção 8).
- **Proxy só confere a existência do cookie:** o `matcher` exclui `_next/static`, `_next/image`,
  `favicon.ico`, arquivos com extensão e `/entrar`; sem o cookie, redireciona para
  `/entrar?para=<caminho e busca>`, com o valor codificado. Não há `fetch` no proxy; a validação de
  verdade continua na API (LLD, seção 8; CA5).
- **Sem teste próprio nesta tarefa:** a especificação, seção 8, define a web com um único ponto de
  teste, o Playwright da tarefa 09, e diz que a falha de verificação fica no roteiro manual. Por
  isso CA1, CA2, CA3 e CA5 são previstos para a suíte da tarefa 09, e CA4 e CA6 ficam na revisão
  humana; esta tarefa não monta a infraestrutura de e2e.
- **Sair com a API indisponível:** a ação `sair` apaga o cookie e leva a `/entrar` mesmo quando o
  `DELETE` falha por rede, 5xx ou 401, sem registrar token, cookie ou corpo. A Sessão continua no
  banco até vencer ou ser revogada, mas deixa de existir naquele navegador, que é o que a pessoa
  pediu; manter a Sessão deixaria a pessoa sem conseguir sair. A decisão vai para a spec, seção 6.3
  e questão 8, e para o LLD, seção 6.2.

## Arquivos e interfaces

- `apps/web/package.json`: dependência `zod`.
- `apps/web/.env.example` (novo): `CHAT_API_URL`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_DOMAIN` e
  `SESSION_COOKIE_SECURE`, com valores falsos.
- `apps/web/src/config/env.ts` (novo): `ENV`, objeto tipado com as quatro variáveis, validado por
  zod na importação.
- `apps/web/src/app/services/sessions.ts` (novo): `Person`, `LoginResult`, `VerifyResult` e
  `LogoutResult`; `login({ email, password })`, `verifySession(token)` e `logout(token)`.
- `apps/web/src/app/actions/session.ts` (novo): `"use server"`; `EntrarResult`; `entrar(previous,
  formData)` e `sair()`.
- `apps/web/src/app/utils/redirect-path.ts` (novo): `safeRedirectPath(value: string | null |
  undefined): string`.
- `apps/web/src/proxy.ts` (novo): `proxy(request: NextRequest)` e `config.matcher`; lê
  `ENV.SESSION_COOKIE_NAME` e redireciona sem chamar a API.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/05-cliente-de-sessao-no-bff/tarefa.md`: Status para
  "em andamento".

## Testes existentes que mudam

Nenhum. A web ainda não tem suíte de testes; a API não é tocada por esta tarefa.

## Mudança de dados

Nenhuma. Não há seed nem backfill; a Sessão criada ao entrar é a mesma da API, sem tabela nova.

## Documentos atualizados

- `docs/lld.md`, seção 3, "Erros": no BFF, as Server Actions de Sessão traduzem os erros da API em
  resultado discriminado; a tradução de erro do BFF em geral permanece a definir.
- `docs/lld.md`, seção 9, "Valores de regra": nova linha "Tempo limite da verificação da Sessão no
  BFF" com 5 segundos, no BFF, como constante.
- `docs/lld.md`, seção 6.2, "Sair e revogar": o Sair apaga o cookie e leva a `/entrar` mesmo com
  falha na API, mantendo a Sessão no banco até vencer ou ser revogada.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 6.3: o mesmo comportamento no lugar da
  remissão à questão 8.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9, questão 8: marcada como resolvida.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/05-cliente-de-sessao-no-bff/tarefa.md`: Status para
  "em andamento".
