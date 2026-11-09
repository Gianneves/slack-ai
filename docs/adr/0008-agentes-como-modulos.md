# ADR 0008 — Agentes como módulos do Serviço de agentes, com o registro nele

Status: aceita

## Contexto

Hoje existe um agente (`@assistente`), mas o produto pode ter um ou mais (brief, "Visão
geral"), e só administradores conectam e desconectam agentes do workspace (escopo item 8).
Opções consideradas: um processo por agente, plugins externos com protocolo próprio, ou
módulos dentro de um serviço só.

## Decisão

Cada agente é um módulo do Serviço de agentes, e o registro de agentes conectados fica nesse
serviço, no Banco dos agentes. Adicionar ou desconectar um agente não muda o núcleo do chat
(objetivo b do HLD, seção 1).

## Consequências

- Positivo: um agente novo é código no mesmo projeto, sem infraestrutura nova; desconectar não
  derruba o chat nem as outras partes.
- Negativo: agentes compartilham processo, limites e filas; um agente com erro pode afetar os
  outros.
- Dívida: se a quantidade de agentes crescer, pode ser preciso separar processos — fora do
  escopo do MVP.
