# Validação visual da F01-T01

Medição feita depois do build, em 11/11/2026, para os critérios CA3 e CA4, que pedem conferência no
navegador. O contexto do teste foi o CSS compilado do `web` carregado numa página local, sem a
aplicação, porque a página da F01 ainda é o esqueleto e não usa os utilitários de cor.

## CA3 — tema escuro

Com `data-theme="dark"` no `<html>`, os valores resolvidos passaram aos do bloco escuro; sem o
atributo, ficaram nos do claro.

| Token | Claro | Escuro |
| --- | --- | --- |
| `--surface` | `#ffffff` | `#1a1d21` |
| `--fg` | `#1d1c1d` | `#d1d2d3` |
| `--border` | `#dddddd` | `#3b3d42` |
| `--sidebar` | `#3f0e40` | `#19171d` |
| `--chrome` | `#350d36` | `#121016` |
| `--elevation-2` | `0 4px 12px #0000001f, 0 0 0 1px #1d1c1d21` | `0 4px 12px #00000066, 0 0 0 1px #3b3d42` |

O `data-theme` só aparece no `globals.css`, no `@custom-variant` e no bloco escuro; nenhum código da
aplicação escreve o atributo.

## CA4 — foco global

Com o botão focado por teclado (`:focus-visible` casando), o estilo computado foi
`outline: rgb(29, 155, 209) solid 2px` e `outline-offset: 2px`, que é o `--focus` (`#1d9bd1`) do
design system. O projeto não tem nenhum `outline: none`.
