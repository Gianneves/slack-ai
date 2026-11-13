<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Comandos

Todos rodam no contêiner `web`, a partir da raiz do repositório:

```bash
docker compose -f compose.yaml exec web <comando>
```

| Comando | O que faz |
| --- | --- |
| `pnpm dev --hostname 0.0.0.0` | Sobe o servidor de desenvolvimento (`http://localhost:3000`) |
| `pnpm lint` | ESLint com as regras do `eslint-config-next` |
| `pnpm exec tsc --noEmit` | Checagem de tipos |
| `pnpm build` | Compila a aplicação para produção |

## Verificação completa

1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm build`

## Testes de ponta a ponta

A suíte fica em `e2e/`, com o Playwright do próprio `web` (`@playwright/test`), e roda no contêiner `e2e`, contra a web em `http://web:3000` e a API real. O navegador é só o Chromium, em modo headless, e o relatório HTML não abre sozinho (`PLAYWRIGHT_HTML_OPEN=never`).

1. Suba a web e a API, como no `AGENTS.md` da raiz.
2. Suba o `e2e`, só pelo `profile` e parado:

   ```bash
   docker compose -f compose.yaml --profile e2e up -d --wait e2e
   ```

3. Rode a suíte a partir do `apps/web`, dentro do contêiner:

   ```bash
   docker compose -f compose.yaml exec e2e sh -c 'cd apps/web && npx playwright test'
   ```

O `globalSetup` constrói o `chat-api` com o `@nestjs/cli` e confere a saúde da web e da API; sem elas no ar, a suíte falha com a mensagem do que falta. Cada teste cria a própria Pessoa `e2e-…@teste.local` pelo comando de contas; a limpeza é por prefixo, no setup e no teardown.

**Depuração.** Um caso que falha é depurado com a skill `playwright-cli`: rode `npx playwright test --debug=cli` em segundo plano, dentro do `e2e`, e, quando o comando imprimir o nome da sessão, conecte com `npx playwright cli attach <sessão>`. O `playwright-cli` é o do `@playwright/test` do `web`, chamado por `npx`; não instale o `playwright-cli` globalmente.

Os artefatos (`test-results/`, `playwright-report/`, `blob-report/` e `.playwright-cli/`) ficam fora do git.

## Server Components

Todo componente nasce como Server Component. O `"use client"` precisa de um motivo: estado ou efeito, manipulador de evento, API do navegador ou hook que só existe no cliente. Buscar dados, ler cookies, formatar valores e montar layout não são motivo.

## Estrutura de pastas

O código fica em `src/`.

```
src/
  app/          Server Components, páginas, layouts e rotas da aplicação; o CSS global fica em `globals.css`.
    queries/    Arquivos de consultas (queries) da aplicação.
    actions/    Arquivos de ações do servidor (Server Actions) da aplicação.
    components/ Componentes reutilizáveis da aplicação.
    hooks/      Hooks personalizados da aplicação.
    utils/      Funções utilitárias da aplicação.
    services/   Arquivos de serviços da aplicação.
public/         Arquivos estáticos, como imagens e fontes (fora de `src/`).
```

## API Externas

A comunicação com APIs será feita através do `fetch`, mas, não deve ser feita diretamente nos componentes ou Server Actions. Em vez disto, crie serviços http dedicados na pasta `app/services/` e utilize-os nos componentes ou Server Actions.



