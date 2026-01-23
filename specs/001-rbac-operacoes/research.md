# Phase 0 Research: RBAC Operacoes

## Decision 1: Fonte unica de permissoes

- **Decision**: Manter `apps/web/src/lib/auth/permissions.ts` como fonte unica da matriz RBAC e ajustar os cargos de Operacoes conforme a spec.
- **Rationale**: A matriz ja e consumida por hooks e utilitarios; manter a definicao central evita divergencias.
- **Alternatives considered**: Persistir permissoes no banco e carregar dinamicamente por API.

## Decision 2: Checagem client e server

- **Decision**: Aplicar checagem de permissoes no cliente (navegacao, componentes e guardas) e no servidor (actions/queries).
- **Rationale**: Alinha com o constitution e evita exposicao de dados em acessos diretos.
- **Alternatives considered**: Somente checagem client (insuficiente para seguranca).

## Decision 3: Calculo de permissoes via user_roles

- **Decision**: Continuar usando `user_roles` + `roles` + `departments` para calcular permissoes do usuario.
- **Rationale**: Ja existe integracao no hook `usePermissions` e utilitarios RBAC.
- **Alternatives considered**: Tabela de permissoes por usuario (mais complexa).
