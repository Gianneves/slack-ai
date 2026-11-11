# F01 — T08 — Testes de ponta a ponta da web

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** 04, 06 e 07 (questão em aberto 4)

## Objetivo

Provar os fluxos da F01 pela tela, contra a web e a API reais, no único ponto de teste da web.

## Escopo

- Instalar `@playwright/test` e `@axe-core/playwright` no `web`; configurar Chromium headless,
  base em `http://web:3000` e o `PLAYWRIGHT_HTML_OPEN=never`.
- Serviço `e2e` no `compose.yaml`, no `profile` e parado, na mesma imagem do Playwright do `web`
  (LLD, seção 10).
- Helper de dados que cria a Pessoa de teste com e-mail `e2e-...@teste.local` e revoga Sessões,
  conforme a decisão da questão em aberto 4; limpeza pelo prefixo.
- Casos da seção 8 da spec: entrar e chegar à Home; credencial inválida; bloqueio com o tempo;
  `?para=` válido e inválido; `/entrar` com Sessão válida; persistência ao recarregar, em outra
  aba e em contexto novo com o mesmo `storageState`; Sair; Sessão revogada e vencida; axe nas
  telas de entrar e Home.
- `roteiro-manual.md` com a porta de erro de sessão (API parada), as operações da CLI, a Sessão
  revogada com o chat aberto e a conferência visual com o Figma.

## Critérios de aceite

- [ ] A suíte roda no contêiner `e2e` e usa a web e a API reais.
- [ ] Cada teste cria os próprios dados e não depende de ordem nem de dado de outro teste.
- [ ] Os casos da seção 8 da spec passam, incluindo a recusa de Sessão revogada e vencida.
- [ ] O axe não acusa violação nas telas de entrar e Home.
- [ ] O roteiro manual cobre o que a automação não alcança.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` da web passam.

## Dependências

Tarefas 04, 06 e 07. A questão em aberto 4 precisa estar resolvida antes do plano.
