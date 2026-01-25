## Cenário
**Usuário logado:** comprador_compras_e_manutencao_teste@garageinn.com
**Senha:** Teste123!
**Objetivo:** Executar chamado de compras completo, criar cotações e enviar adiante

## Perguntas
- Como funciona exatamente o fluxo de execução de compras? cotações, aprovações, quem aprova, qual a cadeia? Crie um documento explicativo sobre como funciona do ponto de vista de regra de negócio e usabilidade. Abstraia códigos e parte técnica. Como eu explicaria para o dono do software como esse módulo de compras funciona?

### Logado como comprador, ao visualizar lista geral de chamados
- [ ]  Usuário comprador está vendo todos os chamados independente do status, ele só deve poder enxergar os chamados que estão prontos para execução;
- [ ]  O dropdown de filtro por Departamento só lista RH e TI, mas deveria listar apenas Compras e Manutenção pois o departamento de compras só cuida de compras e manutenção;
- [ ]  Usuario tenta abrir chamado de TI, mas ele ta bloqueado no sistema erroneamente. Todos usuários podem abrir chamados de TI, fazer solicitações. A regra restrintiva de TI é para executar os chamados, acessar a tela de TI e exibir a tab de navegação na Sidebar;

### Logado como comprador, ao tentar adicionar uma cotação
- [ ]  Tratamento e Mascara de CNPJ na modal Adicionar cotação.
- [ ]  Tratamento e mascaras telefone ou email em contato
- [ ]  Tratamento e máscara em preço
- [ ]  **new row violates row-level security policy for table "ticket_quotations"**
- [ ]  Enviar comentário com CTRL + Enter
- [ ]  Histórico com label em ingles “status_change”
- [ ]  Ao clicar em “Iniciar Cotação” aparece o toast de sucesso: “**Status alterado para: Em Cotação**", mas não há sinal claro de que o status mudou e o botão continua disponivel e ao clicar acontece a mesma coisa.
- [ ]  Ao clicar em “Iniciar Andamento” mesma coisa: Toas de sucesso “**Status alterado para: Em Andamento**” mas nada acontece e o botão continua disponivel;
- [ ]  Mesma coisa acontece ao negar chamado.