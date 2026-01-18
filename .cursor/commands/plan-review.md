plan-review

Crie um planejamento estruturado para implementar: $ARGUMENTS

# Registre as instruções abaixo no plano com prioridade alta

1. Antes de implementar uma task Entenda o que deve ser feito na task;
2. Verifique se a task ja foi implementada;
   1. Se foi implementada:
      1. Teste para ver se foi implementada com sucesso;
      2. Se foi implementada com sucesso e pode ser considerada entregue:
         1. Marque a tarefa como concluida em `docs/BACKLOG.md`;
         2. Não precisa incluir a tarefa no plano;
      3. Se o teste falhou:
         1. Inclua a tarefa no plano para ser implementada, documentando o bug;
   2. Se ainda não foi implementada:
      1. Inclua no plano para ser implementada;
3. Após o plano estiver concluido, revisado e testado com sucesso:
   1. Atualize todas as tarefas no documento do plano e do `docs/BACKLOG.md`;
   2. Faça o commit das alterações em português seguindo boas práticas;
   3. Atualize AGENTS.md e CLAUDE.md