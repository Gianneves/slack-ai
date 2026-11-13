# F01 — T09 — Testes de ponta a ponta da web

Status: em andamento

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** 04, 07 e 08

## Objetivo

Provar os fluxos da F01 pela tela, contra a web e a API reais, no único ponto de teste da web.

## Decisões consumidas de outras tarefas

- A criação e a revogação de Pessoas nos testes usam as operações do comando de contas da tarefa
  04.

## Escopo

- Instalar `@playwright/test` e `@axe-core/playwright` no `web`; configurar Chromium headless,
  base em `http://web:3000` e o `PLAYWRIGHT_HTML_OPEN=never`.
- Seguir a skill `playwright-cli` na escrita, execução e depuração: `npx playwright test` em modo
  headless, sem abrir janela do navegador, e `--debug=cli` em segundo plano com
  `playwright-cli attach` quando um caso falhar. O `playwright-cli` é o do `@playwright/test` do
  `web`, não uma instalação global.
- Serviço `e2e` no `compose.yaml`, no `profile` e parado, na mesma imagem do Playwright do `web`
  (LLD, seção 10).
- `apps/web/AGENTS.md`: comandos de e2e e o uso da skill `playwright-cli`.
- Helper de dados que cria a Pessoa de teste com e-mail `e2e-...@teste.local` e revoga Sessões,
  conforme a decisão da questão em aberto 4; limpeza pelo prefixo.
- Casos da seção 8 da spec: entrar e chegar à Home; credencial inválida; bloqueio com o tempo;
  `?para=` válido e inválido; `/entrar` com Sessão válida; persistência ao recarregar, em outra
  aba e em contexto novo com o mesmo `storageState`; Sair; Sessão revogada e vencida; axe nas
  telas de entrar e Home.
- `roteiro-manual.md` com a porta de erro de sessão (API parada), as operações da CLI, a Sessão
  revogada com o chat aberto e a conferência visual com o Figma.

## Critérios de aceite

- [ ] **CA1** · A suíte roda no contêiner `e2e`, usa a web e a API reais e roda em modo headless,
      sem abrir janela do navegador.
- [ ] **CA2** · A escrita e a depuração seguem a skill `playwright-cli`, com o `playwright-cli` do
      `@playwright/test` do `web`.
- [ ] **CA3** · O `apps/web/AGENTS.md` documenta os comandos de e2e e a skill.
- [ ] **CA4** · Cada teste cria os próprios dados e não depende de ordem nem de dado de outro
      teste.
- [ ] **CA5** · Os casos da seção 8 da spec passam, incluindo a recusa de Sessão revogada e
      vencida.
- [ ] **CA6** · O axe não acusa violação nas telas de entrar e Home.
- [ ] **CA7** · O roteiro manual cobre o que a automação não alcança.
- [ ] **CA8** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` da web passam.

## Dependências

Tarefas 04, 07 e 08. A questão em aberto 4 precisa estar resolvida antes do plano.
