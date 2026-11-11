# F01 — T02 — Componentes de UI da F01

Status: a fazer

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **Design system:** [design-system.md](../../../../design-system.md)
- **Depende de:** 01 — Tokens e fundação de UI

## Objetivo

Implementar os primitivos que a tela de entrar e a Home usam, com os variants, tamanhos e estados
descritos no design system.

## Escopo

- Instalar, no contêiner `web`, o que o primeiro componente precisar: `lucide-react`, `radix-ui`,
  `class-variance-authority`, `clsx` e `tailwind-merge`.
- `src/app/utils/cn.ts`.
- Em `src/app/components/ui/`, um arquivo por componente: `button.tsx`, `input.tsx`, `field.tsx`,
  `spinner.tsx`, `avatar.tsx`, `empty-state.tsx` e `dropdown-menu.tsx`.
- Server Components por padrão; `"use client"` só no `dropdown-menu.tsx`, que embrulha o Radix.
- Sem componentes de domínio (`user/`, `workspace-nav/`, `auth/`), que ficam nas tarefas 06 e 07.
- Microtexto de exemplo nos componentes não é o texto final da tela; o texto vem do Figma.

## Critérios de aceite

- [ ] Cada componente segue os variants, tamanhos e estados do design system e do Figma.
- [ ] Input e Field têm estado inválido por `aria-invalid`, borda `danger` e anel de erro.
- [ ] Button tem `loading` com Spinner, texto mantido e controle desabilitado.
- [ ] DropdownMenu funciona por teclado e tem item destacado como o design system descreve.
- [ ] Avatar usa as iniciais e as cores `avatar-1` a `avatar-6`; EmptyState tem o quadro de 48.
- [ ] Nenhuma cor solta; tudo por token.
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` e `pnpm build` passam.

## Dependências

Tarefa 01. As telas 06 e 07 dependem desta.
