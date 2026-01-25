# Quickstart: Fluxo de aprovacao de chamados - Operacoes

## Objetivo

Validar que a cadeia de aprovacao de Operacoes respeita a hierarquia e evita autoaprovacao.

## Pre-requisitos

- Usuarios de Operacoes com os cargos: Manobrista, Encarregado, Supervisor e Gerente de Operacoes.
- Acesso ao fluxo de criacao de chamados em diferentes tipos (compras, manutencao, TI, RH, financeiro, sinistros, comercial).

## Passos de validacao

1. **Manobrista**
   - Criar um chamado.
   - Confirmar status inicial "Aguardando aprovacao do encarregado".
   - Aprovar como Encarregado e confirmar status "Aguardando aprovacao do supervisor".
   - Aprovar como Supervisor e confirmar status "Aguardando aprovacao do gerente de operacoes".

2. **Encarregado**
   - Criar um chamado.
   - Confirmar status inicial "Aguardando aprovacao do supervisor".
   - Verificar que o Encarregado nao ve aprovacao pendente do proprio chamado.

3. **Supervisor**
   - Criar um chamado.
   - Confirmar status inicial "Aguardando aprovacao do gerente de operacoes".
   - Verificar aprovacao pendente apenas para o Gerente de Operacoes.

4. **Gerente de Operacoes**
   - Criar um chamado.
   - Confirmar status inicial "Aguardando triagem".
   - Verificar que nao existem aprovacoes pendentes.

## Resultado esperado

Cada cargo inicia o chamado no nivel correto, sem autoaprovacao e sem alterar chamados preexistentes.
