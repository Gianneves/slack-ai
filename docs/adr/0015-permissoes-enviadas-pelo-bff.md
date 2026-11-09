# ADR 0015 — O BFF envia identidade e permissões no pedido ao agente

Status: aceita

## Contexto

O Serviço de agentes não acessa o Banco do chat (ADR 0010), mas precisa saber quem pediu, o
que essa pessoa pode (permissão de dados) e o fuso dela para o recorte "hoje" (RNF "Idioma e
fuso"). Opções consideradas: os agentes consultarem a API do chat a cada pedido, ou o BFF
enviar o contexto junto com o pedido.

## Decisão

O BFF envia identidade, permissões e fuso de quem pediu na chamada ao Serviço de agentes,
autenticada com credencial de serviço (HLD 6.3 e 6.4).

## Consequências

- Positivo: pedidos demorados carregam o contexto original, sem depender do estado na hora da
  execução; menos idas e vindas entre serviços.
- Negativo: o Serviço de agentes confia no BFF; uma permissão retirada no meio de um pedido
  demorado não é percebida — risco mitigado pela nova conferência no download do PDF (HLD,
  seção 11, e fluxo 6.5).
