# ADR 0006 — Worker separado para pedidos demorados

Status: aceita

## Contexto

Um relatório em PDF não pode travar a conversa nem atrasar o p95 de 5 s dos pedidos comuns
(brief, escopo item 13 e RNF "Desempenho"). Opções consideradas: processar no próprio Serviço
de agentes, ou separar em um worker que consome uma fila.

## Decisão

Um Worker separado, do mesmo projeto Python do Serviço de agentes mas outro processo, consome a
fila de pedidos demorados e não chama o modelo de IA: executa a consulta já conferida, confere
o lastro, monta o PDF e entrega na conversa (HLD 6.5).

## Consequências

- Positivo: o pedido demorado fica isolado do comum; o Worker sem chave do modelo reduz a
  superfície de segredos e o custo acidental de chamadas.
- Negativo: mais um processo para implantar e observar; o Worker depende da fila e da
  idempotência da entrega por identificador de pedido (HLD, seção 8).
- Dívida: número de instâncias do Worker e tentativas, a definir com o dimensionamento
  (HLD, seção 9).
