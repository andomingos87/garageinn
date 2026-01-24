# Modulo de Chamados de TI

## Objetivo

Centralizar solicitacoes de TI com campos especificos (categoria e tipo de equipamento),
seguindo o fluxo padrao de aprovacao quando aplicavel.

## Quem pode acessar

- Qualquer usuario pode abrir chamado de TI.
- Usuarios de TI (Analista/Gerente) e perfis globais veem todos os chamados.
- Usuarios comuns veem apenas seus proprios chamados.

## Campos principais

- **Titulo**: descricao curta do problema.
- **Descricao**: detalhamento da solicitacao.
- **Categoria**: Equipamento, Rede, Internet, Outros.
- **Tipo de equipamento**: texto obrigatorio.
- **Unidade**: opcional.
- **Urgencia percebida**: opcional.

## Fluxo resumido

1. Usuario abre o chamado em `/chamados/ti/novo`.
2. Sistema valida campos obrigatorios.
3. Se necessario, aciona aprovacao padrao.
4. Chamado fica disponivel para acompanhamento e triagem.

## Telas

- Listagem: `/chamados/ti`
- Criacao: `/chamados/ti/novo`
- Detalhe: `/chamados/ti/[ticketId]`
