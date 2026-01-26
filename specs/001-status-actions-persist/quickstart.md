# Quickstart: Persistência de Ações de Status

## Objetivo
Validar que mudanças de status em chamados de Compras/Manutenção persistem no banco e refletem na UI.

## Pré-requisitos
- Ambiente web rodando
- Usuário com permissão no fluxo (inclui Admin)

## Fluxo básico
1. Acessar um chamado de Compras/Manutenção em status elegível.
2. Clicar em **Iniciar Andamento** ou **Iniciar Cotação**.
3. Verificar que o status na tela muda imediatamente.
4. Recarregar a página e confirmar que o status permanece.

## Fluxo de negação
1. Clicar em **Negar**.
2. Informar motivo e confirmar.
3. Verificar status negado e motivo visível no histórico.

## Conflito
1. Em duas sessões, tentar mudar o status quase simultaneamente.
2. Confirmar que a última gravação prevaleceu e o usuário impactado foi notificado.

## Validação
- Revisado em 2026-01-26 com o cenário de Compras/Manutenção.
