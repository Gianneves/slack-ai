# F01 — T01 — Tokens e fundação de UI

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** —

## Objetivo

Deixar a base visual do design system no `web`, para as telas da F01 usarem só tokens semânticos,
tipografia e estados de foco já definidos.

## Escopo

- `src/app/globals.css`: tokens de cor semânticos nos temas claro e escuro, `@theme inline`,
  escala de tipografia, espaçamento, raios, elevação, camadas e movimento, com
  `prefers-reduced-motion`.
- `src/app/layout.tsx`: Lato pelo `next/font/google`, `lang="pt-BR"` e a base de corpo do design
  system; remover Geist e o CSS do esqueleto.
- Sem `data-theme` na F01: sem o atributo vale o claro; a escolha de tema é da F02.
- Nenhum componente de UI ainda; eles entram na tarefa 02.

## Critérios de aceite

- [ ] **CA1** · O `globals.css` tem os mesmos nomes e valores da seção "Cores semânticas",
      "Tipografia", "Raios", "Elevação", "Tamanhos do shell" e "Movimento" do design system.
- [ ] **CA2** · Não há hex, `rgb()` nem cor da paleta padrão do Tailwind fora dos valores dos
      tokens.
- [ ] **CA3** · O tema escuro funciona com `data-theme="dark"` no `<html>`, conferido no
      navegador.
- [ ] **CA4** · O foco global é visível por teclado.
- [ ] **CA5** · `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam no contêiner `web`.

## Dependências

Nenhuma. É a base das tarefas 02, 07 e 08.
