# ADR 0011 — Identificador de pedido limita as ações dos bots

Status: aceita

## Contexto

Um bot com credencial válida poderia agir fora de um pedido real: gravar mensagens arbitrárias
ou criar tarefas falsas. O objetivo f do HLD (seção 1) exige que todo número entregue seja
rastreável até o pedido que o produziu. Opções consideradas: confiar só na credencial, ou
limitar cada ação a um pedido.

## Decisão

Cada pedido a um agente recebe um identificador emitido pela API do chat. Toda ação de bot
(resposta, pergunta ao usuário, aviso de início, entrega do PDF, criação de tarefa) leva esse
identificador, e a API do chat só a aceita ligada a um pedido real, em nome de quem fez aquele
pedido (HLD 6.6).

## Consequências

- Positivo: ação de bot sempre rastreável ao pedido de origem; idempotência por pedido — a
  mesma ação vale uma vez (HLD, seção 8).
- Negativo: a API do chat guarda os pedidos e valida cada ação, com um custo a mais em cada
  chamada de bot.
- Dívida: a validade do identificador de pedido está a definir (LLD, seção 9).
