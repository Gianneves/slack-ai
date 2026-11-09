# ADR 0013 — Somente leitura garantido pelo banco e pelo código

Status: aceita

## Contexto

O brief impõe: "a garantia de somente leitura vem do próprio banco, e não do código (imposta)"
(RNF "Restrição"). Um prompt não basta contra instruções plantadas na conversa (risco de
manipulação do agente, brief, seção "Riscos").

## Decisão

O acesso ao Banco de negócio usa um usuário só leitura criado no próprio banco e, além disso,
toda consulta gerada passa por uma conferência de somente leitura no código antes de rodar
(HLD 6.4).

## Consequências

- Positivo: defesa em duas camadas — mesmo manipulado pelo conteúdo da conversa, o agente não
  escreve nem altera dados (objetivo d do HLD, seção 1).
- Negativo: manter a conferência no código (parser de SQL) é uma peça a mais, com biblioteca a
  definir no LLD.
- Risco associado: consulta pesada de negócio disputa recursos do Postgres com o chat, pois os
  bancos dividem a mesma instância (HLD, seção 11).
