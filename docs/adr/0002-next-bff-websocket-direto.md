# ADR 0002 — Next.js como BFF, com WebSocket direto na API do chat

Status: aceita

## Contexto

O navegador não pode ter credencial acessível (brief, RNF "Sessão"), então é preciso um ponto
de entrada do lado do servidor que guarde a sessão e esconda os serviços internos. Opções
consideradas: uma SPA falando direto com a API, um BFF em outro framework, ou o próprio Next.js
com seus mecanismos de servidor.

## Decisão

Next.js como Frontend e BFF: ele grava e apaga o cookie de sessão e encaminha as chamadas à API
do chat e ao Serviço de agentes. O WebSocket, porém, abre direto na API do chat, sem passar
pelo BFF.

## Consequências

- Positivo: a sessão fica em cookie httpOnly gravado pelo servidor; o BFF pode manter segredos
  (credenciais de serviço) fora do navegador; o WebSocket direto evita um salto extra em cada
  evento de tempo real.
- Negativo: dois caminhos de autenticação (REST via BFF; WebSocket direto), o que exige
  conferência de origem própria no handshake (HLD 6.1) e endereços configurados separados.
- Dívida: o contrato entre BFF e API do chat rota a rota fica no LLD (seção 5).
