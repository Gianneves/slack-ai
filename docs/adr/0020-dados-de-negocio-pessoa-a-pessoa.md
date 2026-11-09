# ADR 0020 — Mensagem de dados de negócio emitida pessoa a pessoa no WebSocket

Status: aceita

## Contexto

A resposta do agente marcada como "dados de negócio" deve mostrar o conteúdo só a quem tem
permissão, na entrega, no histórico e na reconexão (HLD 6.4, objetivo e do HLD, seção 1).
Opções consideradas: um evento só para a conversa, com o cliente pedindo o conteúdo à parte, ou
a API emitir um evento por pessoa, com a versão que cada uma pode ver.

## Decisão

A API do chat emite a mensagem de dados de negócio pessoa a pessoa pelo WebSocket: quem tem
permissão recebe o evento com o conteúdo; os outros recebem a versão bloqueada. O evento
guardado nos eventos de reconexão (Redis) segue a mesma regra, por pessoa. Mensagem sem a marca
sai num evento só para a conversa.

## Consequências

- Positivo: o conteúdo restrito nunca sai da API para quem não tem permissão, nem na queda de
  conexão; o cliente não precisa de segunda busca.
- Negativo: mais emissões e mais espaço no Redis para as conversas com dados de negócio.
- Dívida: se uma função única monta a mensagem para cada destinatário está a definir
  (LLD, seção 12).
