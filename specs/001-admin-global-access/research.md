# Research - Acesso a Usuários e Configurações por Admin e Globais

## Decision 1: Reutilizar padrão RBAC atual (admin:all)

**Decision**: Manter o padrão existente de RBAC que concede `admin:all` para cargos globais (admin/global) e usa `RequirePermission`/`usePermissions` no cliente, com verificação server-side via `checkIsAdmin`.

**Rationale**: Alinha-se ao comportamento atual do sistema, reduz risco de regressão e garante consistência entre sidebar e rotas.

**Alternatives considered**:
- Criar novas permissões dedicadas ("users:read", "settings:read") e atualizar toda a matriz de permissões.
- Implementar middleware centralizado de autorização para todas as rotas.

## Decision 2: Bloqueio por link direto no servidor

**Decision**: Validar acesso também nas páginas/ações server-side para impedir acesso por URL direta.

**Rationale**: Atende a exigência de segurança e RBAC do projeto, garantindo defesa em profundidade.

**Alternatives considered**:
- Confiar apenas em ocultar itens de navegação.
- Restringir apenas via client-side com redirecionamento.

## Decision 3: Escopo apenas no app web

**Decision**: Implementar mudanças somente em `apps/web`, sem alterações no app mobile.

**Rationale**: O requisito menciona sidebar e páginas web; não há demanda explícita para mobile.

**Alternatives considered**:
- Replicar o controle de acesso também no app mobile.
