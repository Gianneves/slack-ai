# ADR 0021 — Contadores de não lidas e de menções gravados na transação

Status: aceita

## Contexto

A contagem de não lidas e de menções precisa estar certa para todo mundo a cada mensagem
(escopo item 4), inclusive para quem chega depois de uma queda. Recalcular na leitura ou contar
fora da transação pode dessincronizar. Opções consideradas: contadores em Redis, contagem sob
demanda, ou contadores gravados no Banco do chat dentro da transação da mensagem.

## Decisão

Os contadores ficam num registro por pessoa e conversa no Banco do chat e são somados de forma
atômica na transação da mensagem (incremento no próprio `UPDATE`), zerados quando a pessoa lê.
A última leitura só avança, com atualização condicional (HLD, seção 7).

## Consequências

- Positivo: contador sempre consistente com as mensagens gravadas, sem rotina de
  reconciliação; sobrevive a quedas.
- Negativo: uma escrita a mais em cada transação de mensagem; como a pessoa lê volta ao banco
  com frequência.
- Dívida: o comportamento quando a leitura avança até uma mensagem que não é a última está a
  definir (LLD, seção 12).
