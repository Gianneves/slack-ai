# Plano da F01-T09: Testes de ponta a ponta da web

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** revisão humana

**Cenário:** Dado a web e a API no ar e o repositório com as dependências instaladas, quando quem
revisa sobe o serviço `e2e` pelo `profile` e roda o comando documentado no `apps/web/AGENTS.md`,
então a suíte executa dentro do contêiner `e2e`, contra `http://web:3000` e a API real, sem abrir
janela do navegador, e o relatório HTML não abre sozinho.

### CA2

**Marca:** revisão humana

**Cenário:** Dado o `apps/web/AGENTS.md` e um caso que falha, quando quem revisa segue o
procedimento de depuração, então ele usa `npx playwright test --debug=cli` em segundo plano e
`npx playwright cli attach` resolvido do `@playwright/test` do `web`; nenhuma instalação global de
`playwright-cli` é usada.

### CA3

**Marca:** documento

**Cenário:** Dado o `apps/web/AGENTS.md`, quando quem revisa procura os comandos de e2e, então
encontra como subir o serviço `e2e`, como rodar a suíte a partir do `apps/web`, o procedimento de
depuração com `--debug=cli` e `playwright-cli attach`, a exigência do `playwright-cli` local e os
fatos de Chromium headless e relatório que não abre.

### CA4

**Marca:** revisão humana

**Cenário:** Dado os arquivos de `e2e/`, quando quem revisa procura a origem dos dados de cada teste,
então cada um cria a própria Pessoa com e-mail único `e2e-…@teste.local` por um atalho que falha
sozinho, sem e-mail compartilhado nem dependência da ordem; a execução de
`npx playwright test --shuffle --repeat-each=2` passa.

### CA5

**Marca:** teste no Playwright

**Cenário:** Dado a web e a API reais, quando a suíte roda os casos da seção 8 da spec, então entrar
chega à Home, a credencial inválida mantém na tela, o bloqueio mostra o tempo que falta, o `?para=`
válido volta ao caminho e o inválido cai na Home, `/entrar` com Sessão válida vai à Home, a Sessão
persiste ao recarregar, em outra aba e em contexto novo com o mesmo `storageState`, Sair leva a
`/entrar` sem o cookie, e a Sessão revogada e a vencida são recusadas na navegação seguinte.

**Teste previsto:** e2e da web.

`e2e/session.spec.ts`:

- "entrar grava o cookie de Sessão com os atributos do LLD e leva à Home";
- "sair apaga o cookie, leva a /entrar e mantém a outra Sessão";
- "leva à Home quando o para é inválido ou começa com //";
- "redireciona a área logada sem cookie para /entrar com o para";
- "Sessão válida renderiza a Home com a Pessoa da verificação";
- "Sessão revogada apaga o cookie e leva a /entrar com o para";
- "Sessão vencida apaga o cookie e leva a /entrar com o para";
- "recarregar, abrir outra aba e reabrir em contexto novo mantêm a Sessão".

`e2e/login.spec.ts`:

- "entra com credencial válida e chega à Home";
- "entra e volta ao caminho do para válido";
- "credencial errada e e-mail sem conta mostram a mesma mensagem e permitem tentar de novo";
- "bloqueio mostra o tempo que falta e não grava a Sessão";
- "abrir /entrar com Sessão válida vai para a Home";
- "formulário funciona por teclado e anuncia o erro";
- "Sessão recusada em /entrar apaga o cookie e mostra o formulário".

`e2e/home.spec.ts`:

- "Home renderiza a casca autenticada com a Pessoa da Sessão";
- "menu da Pessoa mostra a Pessoa da Sessão e Sair leva a /entrar";
- "depois de sair, abrir a Home volta a /entrar";
- "menu da Pessoa e Sair funcionam só pelo teclado".

### CA6

**Marca:** teste no Playwright

**Cenário:** Dado a tela de entrar no estado padrão e a Home com a Sessão, quando o
`@axe-core/playwright` analisa cada tela, então nenhuma das duas tem violação.

**Teste previsto:** e2e da web, `e2e/login.spec.ts`, "login não tem violações no axe"; e
`e2e/home.spec.ts`, "Home não tem violações no axe".

### CA7

**Marca:** documento

**Cenário:** Dado o `roteiro-manual.md` da tarefa, quando quem revisa procura o que a automação não
alcança, então encontra os passos da porta de erro de sessão com a API parada, das operações da CLI
no contêiner `chat-api`, da Sessão revogada com o chat aberto e da conferência visual com o Figma
nos temas claro e escuro.

### CA8

**Marca:** revisão humana

**Cenário:** Dado o contêiner `web` com as dependências instaladas, quando quem revisa roda
`pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build`, então os três terminam com sucesso.

## Contrato

O contrato não muda. A tarefa não cria, altera nem remove rota, evento ou tabela. O serviço `e2e` do
`compose.yaml` é ambiente de desenvolvimento, não contrato. A suíte consome `POST /v1/sessions`,
`GET /v1/sessions/current`, `DELETE /v1/sessions/current`, as Server Actions `entrar` e `sair` e a
rota `GET /api/session/clear` como estão, sem mudar campos, status, cabeçalhos ou comportamento.

## Verificação do contrato

- **Nenhum item de rota, evento ou tabela a provar.** CA5 prova os fluxos pela tela sobre o contrato
  existente, e a revisão do diff confirma que a tarefa não toca `apps/chat-api/src` nem migrações.
- **As tabelas existentes não mudam de forma.** O helper grava e apaga linhas em `people`,
  `sessions` e `login_attempts` para montar e limpar as fixtures; nenhuma coluna, índice ou
  restrição nasce, e a revisão da migração confirma que não há migração nova.
- **O serviço `e2e` não muda a rede nem as portas dos outros serviços.** A revisão do
  `compose.yaml` confirma que ele entra só pelo `profile` e não expõe porta.

## Decisões

- **A suíte implementa os casos que a F01-T05, a F01-T06, a F01-T07 e a F01-T08 previram para `e2e/`.**
  Os planos anteriores adiaram cada caso para a T09, que é o único ponto de teste da web; por isso
  nascem `session.spec.ts`, `login.spec.ts` e `home.spec.ts`, com os nomes previstos lá e os casos
  novos da seção 8 da spec (bloqueio e persistência). A divisão por assunto mantém cada arquivo
  legível e evita um caso gigante.
- **Cada teste cria a própria Pessoa por uma fixture e a limpeza é por prefixo.** `e2e/support/`
  expõe um `test` estendido com a fixture `person`, que cria o e-mail único `e2e-…@teste.local` e a
  senha de fixture e falha sozinha se a preparação falhar. O `globalSetup` e o `globalTeardown`
  apagam, por prefixo, o que sobrou de uma execução interrompida; a execução pressupõe uma suíte por
  vez no ambiente local.
- **A Sessão vencida é montada com `pg`, e a revogada pelo comando de contas.** Nenhuma operação
  expõe "vencer agora" nem "apagar Pessoa": o helper de banco atualiza `expires_at` da linha cujo
  `token_hash` é o SHA-256 do cookie lido do contexto, e o `globalSetup`/`globalTeardown` apaga as
  linhas do prefixo em `sessions`, `login_attempts` e `people`. O `pg` é o mesmo driver da API, é
  JavaScript puro e não exige build; entra só na fixture, nunca no código de produção.
- **A criação e a revogação usam o comando de contas da F01-T04, não SQL; o `pg` cobre o resto.** O
  helper chama `node dist/accounts/cli.js create-person` e `revoke-sessions` com a senha e o
  `DATABASE_URL` no ambiente; assim a fixture não duplica a normalização do e-mail, o hash
  Argon2id nem a regra de revogação, e exercita a via de operação real. O `globalSetup` constrói o
  `chat-api` antes da suíte, com o `@nestjs/cli` já instalado em `apps/chat-api`, e o `healthcheck`
  espera a API responder 401 em `GET /v1/sessions/current` e a web responder em `/entrar`,
  falhando com mensagem clara quando o ambiente não está no ar. A alternativa de criar e revogar
  por SQL com um hash pronto foi descartada porque duplicaria regra de negócio na fixture. É a
  resolução da questão 4 da spec: o custo aceito é a suíte depender do `dist` do `chat-api` e de o
  Node da imagem do Playwright carregar o binding N-API do Argon2; se a implementação encontrar
  incompatibilidade no binding, isso vira uma decisão nova, não um ajuste silencioso.
- **A suíte não sobe a web nem a API.** O `e2e` roda contra os serviços reais que o
  `AGENTS.md` da raiz manda subir, como quer a spec, seção 8; um `webServer` do Playwright
  esconderia uma web que não está no ar e criaria um segundo endereço de execução. O
  `globalSetup` só confere a saúde e falha cedo.
- **O serviço `e2e` usa a imagem oficial do Playwright na versão do `@playwright/test` do `web`, só
  pelo `profile` e parado.** O `compose.yaml` ganha o serviço com `profiles: ["e2e"]`, montagem do
  repositório em `/home/node/app`, `working_dir` na raiz, `user: "1000:1000"` (o mesmo dono do
  `node_modules` do `web`), `HOME=/tmp`, `DATABASE_URL` do banco `chat`,
  `SESSION_COOKIE_NAME=session` e `PLAYWRIGHT_HTML_OPEN=never`, com `command: tail -f /dev/null` e
  `depends_on` do `postgres`. A tag da imagem é a versão exata instalada, para os navegadores da
  imagem e o `@playwright/test` combinarem; não há `npx playwright install` no contêiner `web`.
- **A configuração do Playwright é Chromium, headless, com `baseURL` fixo em `http://web:3000`.**
  Um projeto só, `timeout` de 60 s e `expect` de 10 s para absorver a primeira compilação do
  `next dev`, `trace` em `retain-on-failure`, captura de tela só na falha e `reporter` `list` mais
  `html` com `open: "never"`. `retries` fica em 0 para o teste de bloqueio não repetir a contagem.
  A base fixa, sem variável nova, segue a spec e o LLD, seção 10.
- **O `?para=` válido é provado com `/?de=canal`.** A única tela logada da F01 é a Home; um caminho
  com consulta preservada prova que o `para` foi honrado, sem inventar rota. Os casos inválidos
  (`//outro`, URL absoluta e ausente) conferem que a navegação fica em `/`, no host da web.
- **O bloqueio é provado com a quinta falha, sem esperar os 15 minutos.** Quatro tentativas erradas
  mantêm a mensagem de credencial inválida; a quinta já responde como bloqueada, e a tentativa
  seguinte com a senha certa continua recusada, sem gravar cookie. O e-mail é único do teste e a
  linha de `login_attempts` morre na limpeza, então a contagem não vaza para outro caso.
- **A persistência cobre recarregar, outra aba e um contexto novo com o mesmo `storageState`.** As
  duas primeiras usam o mesmo contexto; a terceira cria um contexto novo no mesmo navegador com o
  estado salvo depois de entrar, que é a forma que a spec, seção 8, fixa para "fechar e reabrir o
  navegador".
- **O axe roda as regras padrão, sem o overlay de desenvolvimento do Next.** O
  `@axe-core/playwright` analisa `/entrar` e a Home; o `nextjs-portal` do `next dev` é excluído por
  ser artefato do ambiente, não da tela. Uma violação real é corrigida na tarefa, sem mudar token;
  se a correção exigir mudança de design system, ela vira uma decisão nova, não um ajuste silencioso.
- **Os seletores são os acessíveis da tela real.** A suíte usa `getByRole`, `getByLabel` e o texto
  aprovado em `docs/design/README.md` e `docs/design/home/README.md`; nenhum `data-testid` nasce só
  para o teste, e o teste de teclado depende do nome acessível do gatilho do menu da Pessoa.
- **Os artefatos do Playwright e da depuração ficam fora do git.** `apps/web/.gitignore` ganha
  `test-results/`, `playwright-report/`, `blob-report/` e `.playwright-cli/`; os relatórios e as
  capturas de depuração não entram no repositório.
- **O `AGENTS.md` da raiz e o do `web` são atualizados na implementação.** O do `web` documenta os
  comandos e a skill, como pede o CA3. O da raiz passa de quatro para cinco serviços e ganha a linha
  do `e2e` com o `--profile e2e`, porque a tabela e o comando de subida ficariam errados; é memória,
  não documento de arquitetura.
## Arquivos e interfaces

- `apps/web/package.json` e `apps/web/pnpm-lock.yaml` (alterados): `devDependencies` ganham
  `@playwright/test`, `@axe-core/playwright`, `pg` e `@types/pg`; nenhum script novo, porque os
  comandos ficam no `AGENTS.md` e o Playwright é chamado por `npx`.
- `apps/web/playwright.config.ts` (novo): `testDir: "./e2e"`, `use.baseURL =
  "http://web:3000"`, `use.headless = true`, projeto `chromium`, `timeout`, `expect.timeout`,
  `trace`, `screenshot`, `reporter`, `globalSetup`, `globalTeardown` e `retries: 0`.
- `apps/web/e2e/global-setup.ts` (novo): constrói o `chat-api` pelo binário do `@nestjs/cli`,
  espera `GET /v1/sessions/current` responder 401 e `/entrar` responder 200, e apaga o lixo do
  prefixo antes da suíte.
- `apps/web/e2e/global-teardown.ts` (novo): apaga as linhas do prefixo em `sessions`,
  `login_attempts` e `people`.
- `apps/web/e2e/support/accounts.ts` (novo): `TEST_PREFIX`, `TEST_DOMAIN`, `E2E_PASSWORD`,
  `uniqueEmail()`, `createPerson()`, `revokeSessions(email)` e `ensureAccountsBuild()`.
- `apps/web/e2e/support/database.ts` (novo): pool `pg` de `DATABASE_URL`,
  `expireSessionByToken(token)`, `deleteTestDataByPrefix()` e `deleteTestData(email)`; o SHA-256 do
  token é calculado no próprio helper.
- `apps/web/e2e/support/session.ts` (novo): `signIn(page, person)`, `sessionCookie(context)` e
  `saveStorageState(context)`; concentra o caminho de entrada pela tela.
- `apps/web/e2e/support/fixtures.ts` (novo): `test` estendido com a fixture `person`, que cria a
  Pessoa única e a apaga no fim, e reexporta `expect`.
- `apps/web/e2e/session.spec.ts`, `apps/web/e2e/login.spec.ts`, `apps/web/e2e/home.spec.ts` (novos):
  os casos do CA5 e do CA6, com os nomes da seção "Critérios".
- `compose.yaml` (alterado): serviço `e2e` com `profiles: ["e2e"]`, imagem oficial do Playwright na
  versão exata do `@playwright/test`, montagem do repositório, `working_dir`, `user`, `HOME`,
  `DATABASE_URL`, `SESSION_COOKIE_NAME`, `PLAYWRIGHT_HTML_OPEN`, `command: tail -f /dev/null` e
  `depends_on` do `postgres`.
- `apps/web/.gitignore` (alterado): `test-results/`, `playwright-report/`, `blob-report/` e
  `.playwright-cli/`.
- `apps/web/AGENTS.md` (alterado, na implementação): seção de e2e com a subida do serviço, a
  execução, a depuração pela skill e a proibição de instalação global do `playwright-cli`.
- `AGENTS.md` da raiz (alterado, na implementação): cinco serviços na tabela, a linha do `e2e` e o
  `--profile e2e` no procedimento de subida.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/09-testes-ponta-a-ponta-da-web/roteiro-manual.md`
  (novo, na implementação): porta de erro de sessão com a API parada, operações da CLI, Sessão
  revogada com o chat aberto, login e Sair com a API fora e conferência visual com o Figma.

## Testes existentes que mudam

Nenhum. A web ainda não tem suíte de testes. Os casos que os planos da F01-T05, da F01-T06, da
F01-T07 e da F01-T08 previram para `e2e/` nascem nesta tarefa, com os nomes de lá; nenhum teste
existente muda de comportamento.

## Mudança de dados

Nenhuma. Não há seed nem backfill. As fixtures criam e apagam linhas nas tabelas `people`, `sessions`
e `login_attempts` do banco de desenvolvimento, sem alterar schema, e a limpeza por prefixo cobre o
que sobrar de uma execução interrompida.

## Documentos atualizados

- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9, "Questões em aberto", questão 4: marcada
  como resolvida, com a via de criação e revogação, o `pg` para a Sessão vencida e a limpeza por
  prefixo.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 8, "Ponto 2 — web": o último item deixa de
  apontar a questão 4 em aberto e passa a descrever a via decidida.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 3, "web": o delta de `package.json` ganha
  `pg` e `@types/pg`.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/09-testes-ponta-a-ponta-da-web/tarefa.md`: Status
  para "em andamento"; a linha "Decisões consumidas" continua valendo, porque a questão 4 foi
  resolvida pela via que ela já descreve.
- Nenhuma mudança no `docs/hld.md`, no `docs/lld.md` ou no `docs/design-system.md`: o LLD, seção 10,
  já descreve o serviço `e2e`, o prefixo dos dados de teste e o `PLAYWRIGHT_HTML_OPEN=never`, e o
  design system já fixa a validação visual.
- `docs/roadmap.md` não muda: a F01 já está "em andamento".
