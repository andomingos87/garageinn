# Quickstart: Botões de Aprovar/Negar por Perfil

## Objetivo
Garantir que apenas o gerente de compras visualize e execute aprovação/negação.

## Pré-requisitos
- Ambiente web rodando
- Usuário comprador e usuário gerente disponíveis

## Fluxo comprador
1. Logar como comprador.
2. Abrir chamado em “Em Cotação”.
3. Verificar que botões “Aprovar/Negar” não aparecem.

## Fluxo gerente
1. Logar como gerente.
2. Abrir o mesmo chamado em “Em Cotação”.
3. Verificar que botões “Aprovar/Negar” aparecem.

## Bloqueio backend
1. Tentar aprovar via ação direta com comprador.
2. Confirmar bloqueio da transição.
