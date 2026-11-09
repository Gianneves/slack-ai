# ADR 0009 — O BFF dispara o agente

Status: aceita

## Contexto

O pedido a um agente nasce de uma menção na conversa (escopo item 9). Opções consideradas: a
API do chat reconhecer a menção e chamar os agentes, ou o BFF reconhecer e chamar. A API do
chat é o núcleo e não deve depender dos agentes (objetivo a do HLD, seção 1).

## Decisão

O BFF reconhece a menção (ou resposta a um agente) e chama o Serviço de agentes por REST, com
credencial de serviço, sem esperar a resposta. A API do chat não conhece os agentes.

## Consequências

- Positivo: o chat continua funcionando se o Serviço de agentes ou o modelo caem — a mensagem
  já está gravada, e quem pediu vê o erro (HLD 6.3 e seção 8).
- Negativo: a lógica de reconhecimento de menção vive no BFF; o Serviço de agentes confia no
  BFF quanto a identidade e permissões (ADR 0015), risco registrado no HLD, seção 11.
