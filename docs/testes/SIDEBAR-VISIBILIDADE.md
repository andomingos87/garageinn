# Visibilidade do Menu Sidebar - GAPP

> **Documento de Referência Rápida**  
> Última atualização: Janeiro 2026

---

## 📋 Todos os Itens da Sidebar

### Menu Principal (Topo)
1. **Início** (`/dashboard`)
2. **Chamados** (`/chamados`)
3. **Checklists** (`/checklists`)
4. **Unidades** (`/unidades`) 🔒
5. **Usuários** (`/usuarios`) 🔒

### Menu Rodapé
6. **Configurações** (`/configuracoes`) 🔒

**Legenda:** 🔒 = Requer permissão específica

---

## 👥 Quem Pode Ver Cada Menu

### ✅ **Início** - Visível para TODOS
- Todos os usuários autenticados

### ✅ **Chamados** - Visível para TODOS
- Todos os usuários autenticados

### ✅ **Checklists** - Visível para TODOS
- Todos os usuários autenticados

---

### 🔒 **Unidades** - Requer: `units:read` OU `admin:all`

**✅ PODE VER:**
- **Cargos Globais:**
  - Administrador
  - Desenvolvedor
  - Diretor

- **Operações:**
  - Encarregado
  - Supervisor
  - Gerente

- **Comercial:**
  - Gerente

**❌ NÃO PODE VER:**
- **Operações:**
  - Manobrista

- **Outros departamentos** (sem `units:read`)

---

### 🔒 **Usuários** - Requer: `users:read` OU `admin:all`

**✅ PODE VER:**
- **Cargos Globais:**
  - Administrador
  - Desenvolvedor
  - Diretor

- **RH (todos os cargos):**
  - Auxiliar
  - Assistente
  - Analista Júnior
  - Analista Pleno
  - Analista Sênior
  - Supervisor
  - Gerente

**❌ NÃO PODE VER:**
- Todos os outros departamentos (sem `users:read`)

---

### 🔒 **Configurações** - Requer: `settings:read` OU `admin:all`

**✅ PODE VER:**
- **Cargos Globais:**
  - Administrador
  - Desenvolvedor
  - Diretor

- **Compras e Manutenção:**
  - Gerente

- **Financeiro:**
  - Gerente

- **TI:**
  - Analista
  - Gerente

- **RH:**
  - Gerente

- **Comercial:**
  - Gerente

- **Auditoria:**
  - Gerente

- **Sinistros:**
  - Gerente

**❌ NÃO PODE VER:**
- Todos os outros cargos (sem `settings:read`)

---

## 📊 Resumo por Tipo de Usuário

| Tipo de Usuário | Início | Chamados | Checklists | Unidades | Usuários | Configurações |
|----------------|:------:|:--------:|:----------:|:--------:|:--------:|:-------------:|
| **Administrador** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Desenvolvedor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Diretor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manobrista** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Encarregado** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Supervisor (Operações)** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Gerente (Operações)** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Auxiliar RH** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Gerente RH** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Gerente Financeiro** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Gerente Comercial** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Analista TI** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🔍 Como Funciona

1. **Menus sem restrição** (Início, Chamados, Checklists):
   - Visíveis para **todos** os usuários autenticados

2. **Menus com restrição** (Unidades, Usuários, Configurações):
   - Verificação via componente `RequirePermission`
   - Usa `mode='any'` → basta ter **qualquer uma** das permissões listadas
   - Exemplo: `['units:read', 'admin:all']` → se tiver `units:read` **OU** `admin:all`, vê o menu

3. **Permissão `admin:all`**:
   - Garante acesso a **todos** os menus
   - Possuída apenas por: Administrador, Desenvolvedor, Diretor

---

## 📝 Notas Técnicas

- **Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx`
- **Componente de verificação:** `RequirePermission` (`apps/web/src/components/auth/require-permission.tsx`)
- **Hook de permissões:** `usePermissions` (`apps/web/src/hooks/use-permissions.ts`)
- **Definição de permissões:** `apps/web/src/lib/auth/permissions.ts`

---

**Última revisão:** Janeiro 2026
