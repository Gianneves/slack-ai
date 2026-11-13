# Roteiro manual — testes de ponta a ponta da web (F01-T09)

Confere o que a automação não alcança: a porta de erro da Sessão com a API fora do ar, as
operações da CLI usadas como fixture, a Sessão revogada com o chat aberto e a conferência visual
com o Figma. Roda no ambiente de desenvolvimento do `AGENTS.md` da raiz, com a web e a API no ar.

## Preparação

```bash
docker compose -f compose.yaml up -d --build --wait
```

Em dois terminais, suba a web e a API:

```bash
docker compose -f compose.yaml exec web pnpm dev --hostname 0.0.0.0
docker compose -f compose.yaml exec chat-api pnpm start:dev
```

Crie uma Pessoa para o roteiro. A entrada da CLI e os erros de uso estão no
[roteiro da F01-T04](../../04-comando-de-contas-e-sessoes/roteiro-manual.md); aqui ficam só os
comandos que o roteiro usa:

```bash
docker compose -f compose.yaml exec chat-api pnpm build
docker compose -f compose.yaml exec -it chat-api pnpm accounts create-person \
  'roteiro@teste.local' 'Pessoa do Roteiro'
```

Abra `http://localhost:3000` no navegador de 1440 × 900 e entre com essa Pessoa.

## 1. Porta de erro de sessão com a API parada

1. Pare a API, sem derrubar a web: `docker compose -f compose.yaml stop chat-api`.
2. Recarregue a Home. Confira: aparece "Não foi possível verificar sua sessão", com o botão
   "Tentar de novo", e a navegação **não** vai para "Entrar"; o cookie de Sessão continua no
   navegador.
3. Abra `/entrar` no mesmo navegador, com o cookie. Confira a mesma porta de erro, e não o
   formulário.
4. Suba a API de novo (`docker compose -f compose.yaml start chat-api`) e clique em "Tentar de
   novo". Confira que a Home volta a renderizar com a Pessoa da Sessão.
5. Com a API parada, abra `/entrar` numa janela anônima (sem cookie), preencha a credencial certa e
   envie. Confira a mensagem "Não foi possível entrar agora. Tente de novo em instantes." e que
   nenhum cookie de Sessão foi gravado.
6. Com a Sessão aberta, pare a API e clique em "Sair". Confira que a web leva a `/entrar` e apaga o
   cookie mesmo sem a API; a Sessão fica válida na API até vencer, porque a revogação não chegou.
   Suba a API de novo.

## 2. Operações da CLI usadas pela suíte

A suíte usa `create-person` e `revoke-sessions` pela fixture. Repita o caminho da fixture:

```bash
printf '%s\n' 'senha-do-roteiro' | docker compose -f compose.yaml exec -T chat-api \
  pnpm accounts create-person 'roteiro-fixture@teste.local' 'Pessoa da Fixture'
docker compose -f compose.yaml exec chat-api pnpm accounts revoke-sessions \
  'roteiro-fixture@teste.local'
```

Confira a saída de cada comando e que a senha não aparece nela. O e-mail é normalizado para
minúsculas, como no roteiro da F01-T04.

## 3. Sessão revogada com o chat aberto

1. Entre na web com a Pessoa do roteiro e deixe a Home aberta.
2. Em outro terminal, revogue as Sessões:

   ```bash
   docker compose -f compose.yaml exec chat-api pnpm accounts revoke-sessions \
     'roteiro@teste.local'
   ```

3. Na aba aberta, recarregue a Home. Confira: a web passa pela rota de limpeza, apaga o cookie e
   mostra "Entrar" com o formulário; o `para` da Home aparece preservado na URL.
4. Repita com a Sessão vencida, que a automação monta com `pg`: com a Home aberta, atualize
   `expires_at` para o passado e recarregue. O comportamento é o mesmo da Sessão revogada.

## 4. Conferência visual com o Figma

1. Abra `/entrar` e a Home em 1440 × 900 no tema claro.
2. No tema escuro, aplique `data-theme="dark"` no elemento `html` pelo inspetor do navegador.
3. Compare cada tela com o frame correspondente no Figma
   (<https://www.figma.com/design/plW17JDOoRHydUJIIi2u87/slack>) e com as capturas de
   `docs/design/` e `docs/design/home/`, seguindo `docs/design-system.md`, "Validação visual".
4. Confira espaçamento, tipografia, cor, raio e os estados: foco no formulário, carregando no
   botão, credencial inválida, menu da Pessoa aberto e o estado vazio da Home.
5. Anote as diferenças encontradas; uma diferença de token ou de componente vira uma decisão nova,
   não um ajuste silencioso.
