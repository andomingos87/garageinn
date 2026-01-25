# Fluxo de Execucao de Compras

Este documento descreve o fluxo de execucao de compras do ponto de vista de
regras de negocio e usabilidade, sem detalhes tecnicos.

## Objetivo do modulo
Organizar e controlar solicitacoes de compra com rastreabilidade, aprovacao
quando necessario e acompanhamento por status, desde a abertura do chamado ate
a avaliacao da entrega.

## Documento tecnico
Para detalhes tecnicos de implementacao, ver:
[fluxo-execucao-compras-tecnico.md](fluxo-execucao-compras-tecnico.md)

## Abertura do chamado
O chamado de compras pode ser aberto por usuarios autorizados, com os dados:
- Titulo do chamado
- Unidade(s), quando aplicavel
- Categoria
- Item para compra
- Quantidade
- Justificativa

## Aprovacao previa (quando vem de Operacoes)
Existe uma regra exclusiva para Operacoes:

Se um Manobrista abre chamado de compras, o fluxo exige aprovacao em cadeia:
Encarregado -> Supervisor -> Gerente.

- Se qualquer nivel negar, o chamado fica negado com justificativa.
- Se todos aprovarem, o chamado entra no departamento de Compras como
  "aguardando triagem".

Nos demais casos (inclusive chamados abertos pelo proprio departamento de
Compras), nao ha aprovacao previa e o chamado entra direto na triagem.

## Triagem do departamento de Compras
Na triagem, liderancas do departamento definem:
- prioridade
- responsavel pela execucao

Depois disso, o responsavel assume o chamado e inicia a execucao.

## Execucao de compras e cotacoes
O comprador inicia o trabalho e o chamado entra em "Em andamento".
Em seguida, abre a fase de cotacoes, registrando:
- Empresa fornecedora
- CNPJ
- Itens
- Precos unitarios e preco total
- Prazo
- Forma de pagamento
- Data de resposta do fornecedor
- Status da cotacao

Durante essa fase, o chamado fica em "Em cotacao".

## Aprovacao da compra
Depois das cotacoes, o chamado segue para "Em aprovacao".
As aprovacoes internas definem se a compra pode prosseguir:
- Aprovado -> status "Aprovado"
- Negado -> status "Negado" com justificativa

## Compra, entrega e avaliacao
Com aprovacao, o fluxo segue:
Executando compra -> Em entrega -> Entrega realizada -> Avaliacao da entrega

A avaliacao da entrega encerra o processo antes do fechamento.

## Status principais no modulo de compras
- Em andamento
- Em cotacao
- Em aprovacao
- Aprovado
- Executando compra
- Em entrega
- Entrega realizada
- Avaliacao da entrega
- Negado

## Historia exemplo: manobrista abrindo chamado de compras
Joao, manobrista da unidade X, precisa de cones de sinalizacao. Ele abre um
chamado de compras informando titulo, unidade, categoria, item, quantidade e
justificativa.

Como ele e de Operacoes, o chamado entra na cadeia de aprovacao:
1) Encarregado aprova
2) Supervisor aprova
3) Gerente aprova

Com a ultima aprovacao, o chamado entra no departamento de Compras e fica
"aguardando triagem".

Na triagem, a lideranca de Compras define prioridade e atribui um comprador
responsavel.

O comprador inicia a execucao. O chamado passa para "Em andamento" e, em
seguida, entra em "Em cotacao" enquanto ele registra cotacoes com fornecedores.

Depois da analise das cotacoes, o chamado vai para "Em aprovacao". Com a
aprovacao interna, o status muda para "Aprovado".

A compra e executada:
"Executando compra" -> "Em entrega" -> "Entrega realizada".
