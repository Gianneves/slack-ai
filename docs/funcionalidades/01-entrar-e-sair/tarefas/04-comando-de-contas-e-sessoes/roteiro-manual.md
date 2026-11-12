# Roteiro manual — comando de contas (F01-T04)

Confere a entrada da CLI que não é provada pelos testes de integração e de ponta a ponta:
argumentos, leitura da senha e erros de uso. Roda no contêiner `chat-api`, sobre o banco do chat.

## Preparação

```bash
docker compose -f compose.yaml exec chat-api pnpm build
```

O script `accounts` roda o `dist` existente. Se a API estiver no ar, o build pode reiniciá-la no
modo watch; pare-a antes se for o caso.

## Criar Pessoa no terminal

O `-it` dá um terminal ao contêiner, e a senha é digitada sem eco:

```bash
docker compose -f compose.yaml exec -it chat-api pnpm accounts create-person \
  '  Maria@Empresa.COM  ' 'Maria Silva'
```

Confira:

- o terminal pede `Senha:` e não mostra os caracteres digitados;
- a saída é `Pessoa criada: maria@empresa.com`;
- a linha em `people` tem `email = maria@empresa.com` e `password_hash` começando com
  `$argon2id$`;
- `POST /v1/sessions` com `maria@empresa.com` e a senha digitada responde 201.

## Criar Pessoa com a senha canalizada

```bash
printf '%s\n' '<senha>' | docker compose -f compose.yaml exec -T chat-api \
  pnpm accounts create-person 'outra@empresa.com' 'Outra Pessoa'
```

O `-T` desliga o terminal do `exec`, então a CLI lê a primeira linha da entrada padrão. Confira que
a saída não contém a senha.

## Revogar, redefinir e limpar

```bash
docker compose -f compose.yaml exec chat-api pnpm accounts revoke-sessions maria@empresa.com
docker compose -f compose.yaml exec -it chat-api pnpm accounts reset-password maria@empresa.com
docker compose -f compose.yaml exec chat-api pnpm accounts purge-expired-sessions
```

Confira:

- `revoke-sessions` apaga todas as Sessões da Pessoa; a próxima requisição com uma delas recebe 401
  `unauthenticated`;
- `reset-password` troca a senha e apaga todas as Sessões da Pessoa na mesma transação; a senha
  antiga deixa de entrar e a nova entra;
- `purge-expired-sessions` apaga só as Sessões com `expires_at` no passado.

## Erros de uso

Cada comando abaixo deve sair com código 2 e uma mensagem no `stderr`, sem alterar dados:

```bash
docker compose -f compose.yaml exec chat-api pnpm accounts
docker compose -f compose.yaml exec chat-api pnpm accounts operacao-inexistente
docker compose -f compose.yaml exec chat-api pnpm accounts create-person so-email@empresa.com
docker compose -f compose.yaml exec chat-api pnpm accounts create-person '' 'Pessoa Sem E-mail'
docker compose -f compose.yaml exec chat-api pnpm accounts create-person pessoa@empresa.com ''
docker compose -f compose.yaml exec chat-api pnpm accounts revoke-sessions
docker compose -f compose.yaml exec chat-api pnpm accounts revoke-sessions ''
docker compose -f compose.yaml exec chat-api pnpm accounts purge-expired-sessions extra
```

E-mail sem Pessoa em `revoke-sessions` e `reset-password`, e e-mail repetido em `create-person`,
saem com código 1 e mensagem própria. Revogar uma Pessoa sem Sessões conclui com sucesso.

## Senha fora dos argumentos e da saída

- Em outro terminal, enquanto a senha é digitada, `ps` não mostra a senha na linha de comando.
- O `stdout` e o `stderr` das operações de sucesso não contêm a senha.
- A senha não aparece em arquivo versionado; os testes usam apenas senhas de fixture.
