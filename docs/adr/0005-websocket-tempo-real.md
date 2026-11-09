# ADR 0005 — WebSocket para o tempo real

Status: aceita

## Contexto

Mensagens, edição, exclusão, "digitando", presença e notificações precisam aparecer na hora
(brief, escopo itens 4 a 6). Opções consideradas: polling periódico, SSE (servidor → cliente) e
WebSocket bidirecional.

## Decisão

WebSocket bidirecional para o tempo real, servido pela própria API do chat (ADR 0002), com o
cliente informando o último evento confirmado para recuperar o que perdeu.

## Consequências

- Positivo: uma conexão carrega todos os eventos, inclusive os que vão do cliente ao servidor
  ("digitando", presença); latência baixa sem requisições repetidas.
- Negativo: conexão de longa duração exige reconexão com recuperação de eventos (HLD 6.2) e,
  enquanto não houver publicação entre instâncias, limita a API do chat a uma instância só
  (risco no HLD, seção 11).
