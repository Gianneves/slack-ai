# ADR 0019 — Socket.IO no tempo real

Status: aceita

## Contexto

O tempo real é WebSocket (ADR 0005), com reconexão que reenvia os eventos desde o último
confirmado (HLD 6.2). Opções consideradas: WebSocket cru (biblioteca `ws`) ou Socket.IO, no
servidor (API do chat) e no cliente (`web`).

## Decisão

Socket.IO dos dois lados. Os tipos dos eventos ficam em `packages/chat-events/`, consumidos por
`chat-api` e `web` (LLD, seção 5).

## Consequências

- Positivo: reconexão automática, salas por conversa e reconexão com retomada de perto do que o
  fluxo de eventos por pessoa (HLD 6.2) precisa; tipos compartilhados dão o contrato do
  WebSocket dos dois lados.
- Negativo: protocolo próprio sobre o WebSocket — o cliente precisa ser Socket.IO também, sem
  interoperabilidade com WebSocket cru; um pouco mais de peso na conexão.
