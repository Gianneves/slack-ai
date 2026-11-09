# ADR 0010 — O agente grava na conversa pela API do chat, como bot

Status: aceita

## Contexto

A resposta do agente precisa aparecer na conversa como qualquer mensagem: menções, notificação,
não lidas e evento de tempo real iguais aos de uma pessoa (escopo itens 4 e 9). Opções
consideradas: o agente escrever direto no Banco do chat, ou escrever pela API do chat.

## Decisão

O Serviço de agentes e o Worker gravam respostas, tarefas e PDFs pela API do chat,
autenticados como bots, cada um com credencial própria e permissões limitadas. Os agentes não
têm acesso ao Banco do chat (HLD, seção 7).

## Consequências

- Positivo: uma via só de escrita; as regras do chat (transação, evento depois do commit,
  contadores) valem também para o bot; o resultado chega ao usuário pelo mesmo caminho de
  tempo real das mensagens.
- Negativo: toda entrega depende da API do chat estar de pé; é preciso manter credenciais de
  bot e o limite do que cada bot pode fazer (ADR 0011).
