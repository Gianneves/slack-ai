# Plano da F01-T04: Comando de contas e Sessões

Tarefa: [tarefa.md](tarefa.md) · Spec: [spec.md](../../spec.md) · PRD: [prd.md](../../prd.md)

## Critérios

### CA1

**Marca:** teste HTTP

**Cenário:** Dado um operador com acesso ao contêiner `chat-api` e ao banco do chat, quando ele
roda `pnpm accounts create-person` com um e-mail com espaços nas pontas e letras maiúsculas, um
nome e a senha lida da entrada padrão, então a linha em `people` fica com o e-mail normalizado, o
nome e um hash Argon2id, e a Pessoa entra pelo `POST /v1/sessions` com a senha informada.

**Teste previsto:** e2e da API, `test/accounts.e2e-spec.ts`, "entra com a Pessoa criada pelo comando
de contas"; integração, `test/accounts.int-spec.ts`, "cria a Pessoa com e-mail normalizado e senha
Argon2id".

### CA2

**Marca:** teste HTTP

**Cenário:** Dado uma Pessoa com duas Sessões abertas e outra Pessoa com uma Sessão, quando o
operador roda `pnpm accounts revoke-sessions` com o e-mail da primeira, então as Sessões dela são
apagadas, a da outra continua, e a próxima requisição com uma Sessão revogada recebe 401
`unauthenticated`.

**Teste previsto:** e2e da API, `test/accounts.e2e-spec.ts`, "recusa com 401 a Sessão revogada pelo
comando de contas"; integração, `test/accounts.int-spec.ts`, "revoga todas as Sessões da Pessoa e
mantém as das outras".

### CA3

**Marca:** teste de integração

**Cenário:** Dado uma Pessoa com uma senha e duas Sessões abertas, e outra Pessoa com uma Sessão,
quando o operador roda `pnpm accounts reset-password` com uma senha nova, então o hash gravado
verifica a senha nova e recusa a antiga, as duas Sessões da primeira Pessoa são apagadas e a Sessão
da outra continua.

**Teste previsto:** integração, `test/accounts.int-spec.ts`, "troca a senha e apaga todas as Sessões
da Pessoa na mesma transação".

### CA4

**Marca:** teste de integração

**Cenário:** Dado três Sessões, uma com `expires_at` no passado, uma no futuro e uma de outra
Pessoa também no passado, quando o operador roda `pnpm accounts purge-expired-sessions`, então só
as Sessões vencidas são apagadas, de qualquer Pessoa, e a Sessão no futuro continua.

**Teste previsto:** integração, `test/accounts.int-spec.ts`, "apaga só as Sessões vencidas".

### CA5

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa e o roteiro manual, quando quem revisa procura a senha nos
argumentos do comando, no `stdout`, no `stderr`, nos logs e nos arquivos versionados, então ela não
aparece em nenhum deles; nos testes, só existem senhas de fixture. O comando lê a senha da entrada
padrão, não a ecoa no terminal e não a imprime.

### CA6

**Marca:** revisão humana

**Cenário:** Dado o contêiner `chat-api`, quando quem revisa roda `pnpm lint`,
`pnpm exec tsc --noEmit`, `pnpm test`, `pnpm test:int`, `pnpm test:e2e` e `pnpm build`, então os
seis terminam com sucesso.

### CA7

**Marca:** revisão humana

**Cenário:** Dado o diff da tarefa, quando quem revisa olha `apps/chat-api/src/migrations/` e o
schema de `people` e `sessions`, então não há migração nova e nenhuma coluna, índice ou restrição
muda; o comando só lê e escreve nas tabelas existentes.

## Contrato

O contrato não muda. A tarefa não cria nem altera rota, evento ou tabela: o comando de contas é uma
via de operação local, descrita na spec, seção 5, e não uma rota HTTP; as tabelas `people`,
`sessions` e `login_attempts` continuam com a forma da migração `001-LoginTables`.

## Verificação do contrato

- Nenhuma rota, evento ou tabela nova; CA7 prova que o schema e as migrações ficam iguais.
- Os efeitos de escrita em `people` e `sessions` são provados por CA1 a CA4, sem mudar a forma das
  tabelas.
- O erro `unauthenticated` que uma Sessão revogada recebe já é o contrato da rota existente,
  provado em CA2.

## Decisões

- **Questão em aberto 3 resolvida com o usuário:** revogar todas as Sessões da Pessoa identificada
  pelo e-mail normalizado, e não uma Sessão específica. O comando de operação conhece o e-mail, não
  o token (o banco guarda só o SHA-256), e revogar por Pessoa é o que corta o acesso de quem perdeu
  a conta; o `reset-password` já revoga todas. Revogar uma Sessão específica exigiria um
  identificador de Sessão que a operação não tem. A decisão entrou na spec, seções 5, 6.3 e 9.
- **Correção da dependência da T03:** a tarefa dizia que os métodos do repository para "apagar
  Sessões e trocar a senha" vinham da T03, mas a T03 entregou só os de apagar (`deleteById`,
  `deleteByPersonId` e `deleteExpired`); não há método de trocar a senha. A T04 cria
  `PeopleRepository.updatePasswordHash` e corrige a nota "Decisões consumidas de outras tarefas".
- **Falhas esperadas do comando:** para e-mail sem Pessoa em `revoke-sessions` e `reset-password`, e
  para e-mail repetido em `create-person`, o comando falha com mensagem no `stderr` e código de
  saída 1, sem alterar dados; revogar uma Pessoa sem Sessões conclui com sucesso (idempotente).
  Tratar e-mail sem Pessoa como sucesso silencioso esconderia o erro de digitação do operador.
- O comando fica em `src/accounts/`, com `AccountsService` sem módulo do Nest e um `cli.ts` que
  monta o `DataSource`, os repositories e o service. O teste de integração constrói as peças com
  `new`, sem `Test.createTestingModule`.
- Os resultados de negócio esperados são uniões discriminadas (`person_not_found` e
  `person_already_exists`), não `DomainError`: o comando não tem contrato HTTP e não deve
  acrescentar códigos ao catálogo de erro da API. Erros inesperados o `cli.ts` captura e imprime
  sem stack.
- A senha é lida da entrada padrão: no terminal, sem eco; com entrada canalizada, a primeira linha.
  Ela nunca vai em argumento, saída ou log. `create-person` e `reset-password` exigem senha não
  vazia.
- Sintaxe: `create-person <email> <nome>`, `revoke-sessions <email>`, `reset-password <email>` e
  `purge-expired-sessions`. A saída de sucesso é uma linha de confirmação no `stdout`; uso errado
  sai no `stderr` com código 2; falha de negócio ou inesperada com código 1; sucesso com código 0.
- O script `accounts` roda `node dist/accounts/cli.js`, sem recompilar: o deploy e a verificação já
  rodam `pnpm build`, e recompilar no comando apagaria o `dist` em uso pela API e exigiria o
  `@nestjs/cli`, que é devDependency, em produção. O roteiro manual começa com `pnpm build` no
  desenvolvimento.
- O CLI usa o mesmo `data-source.ts` das migrações, que lê `DATABASE_URL` do ambiente, e não sobe o
  Nest. Antes de conectar, ele confere se `DATABASE_URL` existe e falha como erro de uso se faltar.
- `normalizeEmail` sai de `sessions.service.ts` para `src/common/email.ts`, usado pelo login e pelo
  comando, para a regra de normalização ser uma só.
- `createPerson` consulta o e-mail normalizado antes de inserir, para dar a mensagem amigável; o
  índice único de `people.email` continua sendo a autoridade, e uma corrida vira erro inesperado.
- `reset-password` atualiza `password_hash` e apaga as Sessões na mesma transação, com o `manager`
  passado aos dois repositories, como o login faz com a contagem de tentativas.
- `purge-expired-sessions` usa `expires_at <= agora`, a mesma condição do `deleteExpired` da T03;
  `expires_at` igual ao instante da limpeza já é considerado vencido.
- Testes: `test/accounts.int-spec.ts` (banco real, sem Nest) prova as quatro operações;
  `test/accounts.e2e-spec.ts` prova os elos HTTP de CA1 e CA2; a entrada da CLI (argumentos, leitura
  da senha e erros de uso) fica no roteiro manual.
- O comando exige argumentos não vazios, mas não repete a validação de formato de e-mail do login:
  o cadastro é uma operação da empresa e a validação de formato pertence ao `POST /v1/sessions`.

## Arquivos e interfaces

- `apps/chat-api/package.json`: script `"accounts": "node dist/accounts/cli.js"`.
- `apps/chat-api/src/common/email.ts` (novo): `normalizeEmail(email: string): string`.
- `apps/chat-api/src/sessions/sessions.service.ts`: passa a importar `normalizeEmail` de
  `src/common/email.ts`; o comportamento do login não muda.
- `apps/chat-api/src/people/people.repository.ts`: `NewPerson` (`email`, `name`, `passwordHash`);
  `createPerson(newPerson, manager?)`; `updatePasswordHash(personId, passwordHash, manager?)`.
- `apps/chat-api/src/sessions/sessions.repository.ts`: `deleteByPersonId(personId, manager?)`, com
  `manager` opcional para a transação do `reset-password`.
- `apps/chat-api/src/accounts/accounts.service.ts` (novo): `AccountsService` com `createPerson`,
  `revokeSessions`, `resetPassword` e `purgeExpiredSessions`, e os tipos de entrada e de resultado.
- `apps/chat-api/src/accounts/password-input.ts` (novo): `readPassword(prompt: string):
  Promise<string>`, sem eco no terminal e com leitura da primeira linha na entrada canalizada.
- `apps/chat-api/src/accounts/cli.ts` (novo): `main()`, com a leitura dos argumentos, o despacho das
  operações, o controle de código de saída e a impressão das mensagens.
- `apps/chat-api/test/accounts.int-spec.ts` (novo): as quatro operações com o banco real, sem módulo
  do Nest.
- `apps/chat-api/test/accounts.e2e-spec.ts` (novo): CA1 e CA2 pela rota, com `createTestApp()` e
  `app.close()`.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/04-comando-de-contas-e-sessoes/roteiro-manual.md`
  (novo, escrito na implementação): argumentos, leitura da senha, entrada canalizada, erros de uso e
  conferência de que a senha não aparece nos argumentos nem na saída.

## Testes existentes que mudam

Nenhum. Os casos de `test/sessions.e2e-spec.ts` e `test/login-attempts.repository.int-spec.ts`
continuam iguais; a extração de `normalizeEmail` não muda o comportamento do login, e o `manager`
opcional em `deleteByPersonId` preserva o uso atual.

## Mudança de dados

Nenhuma. Não há seed nem backfill; os testes criam e limpam os próprios dados com `clearData`.

## Documentos atualizados

- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seção 9, "Questões em aberto", questão 3:
  marcada como resolvida, com a revogação por Pessoa identificada pelo e-mail normalizado.
- `docs/funcionalidades/01-entrar-e-sair/spec.md`, seções 5, "Comando de contas", e 6.3, "Sair e
  revogar": `revoke-sessions` apaga todas as Sessões da Pessoa identificada pelo e-mail
  normalizado.
- `docs/funcionalidades/01-entrar-e-sair/tarefas/04-comando-de-contas-e-sessoes/tarefa.md`: Status
  para "em andamento", a nota da dependência da T03 corrigida para incluir o método de troca de
  senha e o escopo de `revoke-sessions` com a granularidade aprovada.
- `docs/hld.md` e `docs/lld.md`: sem mudança. O HLD, seção 2, já registra as contas por script, e o
  LLD, seções 6.2 e 7, já registra revogar, redefinir a senha e limpar Sessões vencidas; o detalhe
  do comando é da spec.
