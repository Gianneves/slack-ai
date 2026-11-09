# ADR 0007 — Redis gerenciado para fila, eventos de reconexão e contadores

Status: aceita

## Contexto

Três necessidades pedem um armazenamento rápido e compartilhado: a fila de pedidos demorados
(escopo item 13), os eventos recentes por pessoa para a recuperação após queda de conexão
(escopo item 4) e os contadores de limite de pedidos e teto de custo (RNF "Custo"). Opções
consideradas: tudo no Postgres, Redis, ou serviços gerenciados dedicados de fila.

## Decisão

Um Redis gerenciado guarda a fila, os eventos recentes por pessoa e os contadores de limite e
custo.

## Consequências

- Positivo: primitivas práticas (fila, TTL, incremento atômico) e alívio do Postgres, que fica
  com os dados de verdade.
- Negativo: ponto único de falha — com o Redis fora, os pedidos aos agentes são recusados até
  ele voltar, para o custo não escapar do teto (HLD, seção 8).
- Aceito: perder os eventos de reconexão só obriga o cliente a recarregar pelo histórico
  paginado (HLD 6.2 e seção 7).
