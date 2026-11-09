# ADR 0017 — Três projetos pnpm independentes, sem workspace

Status: aceita

## Contexto

O monorepo tem três aplicações implantadas separadamente (ADR 0001) e um pacote de tipos
compartilhado (`chat-events`), usado pela API do chat e pelo Frontend/BFF. Opções consideradas:
um workspace pnpm único, com um lockfile na raiz, ou projetos pnpm independentes, cada um com o
seu lockfile. O projeto `agents` é Python e fica fora de qualquer escolha pnpm.

## Decisão

`web`, `chat-api` e `chat-events` são projetos pnpm independentes, cada um com o seu lockfile,
sem workspace. `chat-events` entra em `web` e em `chat-api` como dependência
`file:../../packages/chat-events`; uma mudança nele exige reinstalar nos dois projetos. O store
do pnpm fica em `.pnpm-store/` na raiz, ignorado pelo git e compartilhado pelos dois apps, e a
versão do pnpm é a do `packageManager` de cada projeto, igual nos dois.

## Consequências

- Positivo: cada aplicação instala e versiona as suas dependências isoladamente; um `pnpm
  install` num app não toca no lockfile do outro.
- Negativo: a dependência `file:` não atualiza sozinha — mudou `chat-events`, é preciso
  reinstalar em `web` e em `chat-api`; o `node_modules` compartilhado exige que o Node do host
  seja do mesmo major do contêiner (LLD, seção 10).
