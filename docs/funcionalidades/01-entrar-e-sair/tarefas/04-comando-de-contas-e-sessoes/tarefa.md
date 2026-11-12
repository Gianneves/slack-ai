# F01 — T04 — Comando de contas e Sessões

Status: em andamento

- **Funcionalidade:** F01 — Entrar e sair
- **Spec:** [spec.md](../../spec.md)
- **HLD:** [hld.md](../../../../hld.md)
- **LLD:** [lld.md](../../../../lld.md)
- **Depende de:** 03 — Verificação e saída da Sessão na API (métodos do repository)

## Objetivo

Entregar a via de operação que o produto usa fora da interface: criar Pessoas, revogar Sessões,
redefinir a senha e limpar Sessões vencidas.

## Decisões consumidas de outras tarefas

- Os métodos do repository para apagar Sessões vêm da tarefa 03; o método de troca de senha entra
  nesta tarefa, porque a 03 não o entregou.

## Escopo

- Comando `pnpm accounts <operação>`, rodando no contêiner `chat-api`, sobre o banco do chat.
- `create-person`: e-mail normalizado, nome e hash Argon2id da senha lida da entrada padrão; sem
  papel nem permissão nesta funcionalidade.
- `revoke-sessions`: apaga todas as Sessões da Pessoa, identificada pelo e-mail normalizado.
- `reset-password`: troca o hash e apaga todas as Sessões da Pessoa na mesma transação.
- `purge-expired-sessions`: apaga as Sessões com `expires_at` no passado.
- `test/accounts.int-spec.ts` com o banco real, construindo o que for preciso com `new`, sem
  módulo do Nest; cobre as quatro operações.
- Roteiro manual curto para a entrada da CLI: argumentos, leitura da senha e erros de uso.

## Critérios de aceite

- [ ] **CA1** · `create-person` cria a Pessoa com e-mail normalizado e senha Argon2id, e a Pessoa
      entra pelo `POST /v1/sessions`.
- [ ] **CA2** · `revoke-sessions` faz a próxima requisição com a Sessão revogada receber 401.
- [ ] **CA3** · `reset-password` troca a senha, e todas as Sessões abertas da Pessoa deixam de
      valer.
- [ ] **CA4** · `purge-expired-sessions` apaga só as Sessões vencidas.
- [ ] **CA5** · A senha não aparece nos argumentos, no log nem em arquivo do repositório.
- [ ] **CA6** · `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm test:int`,
      `pnpm test:e2e` e `pnpm build` passam.
- [ ] **CA7** · Nenhuma migração nova.

## Dependências

Tarefa 03, pelos métodos do repository que apagam Sessões; o método de troca de senha entra nesta
tarefa. A tarefa 09 usa as operações para semear e revogar nos testes da web.
