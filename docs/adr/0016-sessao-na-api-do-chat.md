# ADR 0016 — A API do chat é dona da sessão

Status: aceita

## Contexto

O RNF "Sessão" exige sessão revogável, válida para o navegador todo e sem credencial
acessível ao navegador. Opções consideradas: a sessão no BFF (por exemplo, um token
autocontido em cookie) ou a sessão na API do chat, que é a fonte dos dados de pessoas.

## Decisão

A API do chat é dona da sessão: guarda as sessões no Banco do chat, confere a senha, emite o
token ao BFF uma vez, valida cada requisição REST e o handshake do WebSocket, e revoga apagando
a linha (HLD 6.1).

## Consequências

- Positivo: revogação imediata e uma fonte de verdade só, igual no REST e no WebSocket; o BFF
  apenas carrega e repassa o token; o hash do token no banco limita o dano de um vazamento.
- Negativo: uma ida ao banco por requisição — aceitável na escala prevista e mitigada pela
  renovação com intervalo (LLD, seção 6.2).
