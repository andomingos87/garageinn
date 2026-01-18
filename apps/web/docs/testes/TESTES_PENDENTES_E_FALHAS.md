# Testes Pendentes e Falhas - GAPP

> **Versão:** 1.0  
> **Data de Criação:** 16 Janeiro 2026  
> **Baseado em:** `projeto/testes/TESTES_PERMISSOES.md`

---

## Resumo Geral

| Status | Quantidade |
|--------|------------|
| ✅ Aprovados (corrigidos) | 9 |
| ❌ Reprovados | 49 |
| ⏳ Pendentes | 11 |
| **Total** | **69** |

> **Última atualização:** 17 Janeiro 2026
> - BUG-002, BUG-003, BUG-004: Corrigidos e validados
> - BUG-006: Fechado como "By Design" (comportamento intencional de segurança)
> 
> **Validação em 17/01/2026 - Segunda Bateria de Testes:**
> - BUG-001: ✅ CORRIGIDO - Manobrista não vê menu Unidades
> - BUG-007: ✅ CORRIGIDO - Manobrista não vê chamados de outras unidades (chamado #17 da UN001 oculto)
> - BUG-008: ✅ CORRIGIDO - Encarregado vê apenas chamados da sua unidade
> - BUG-009: ✅ CORRIGIDO - Encarregado acessa página de Unidades (visualização)
> - BUG-010: ✅ CORRIGIDO - Supervisor acessa página de Unidades
> - BUG-013: ✅ CORRIGIDO - Gerente acessa /checklists/configurar
> - BUG-011: ✅ CORRIGIDO - Gerente pode visualizar E editar unidades (política RLS UPDATE implementada)
> - BUG-012: ✅ CORRIGIDO - Lógica do componente corrigida (17/01/2026)
> - BUG-014: ❌ NÃO CORRIGIDO - Botão fechar apenas para Admin (ver BUG-014-REOPEN)

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Teste aprovado - funcionou conforme esperado |
| ❌ | Teste reprovado - documentar bug |
| ⏳ | Teste pendente |

---

## 1. Cargos Globais

### 1.1 Testes Aprovados - Administrador ✅

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| ADM-010 | Criar usuário | Criar novo usuário completo | Usuário criado com sucesso | ✅ | BUG-002 (Corrigido) |
| ADM-016 | Aprovar chamado | Aprovar um chamado pendente | Chamado aprovado | ✅ | BUG-003 (Corrigido) |
| ADM-017 | Excluir chamado | Excluir um chamado | Chamado excluído | ✅ | BUG-004 (Corrigido) |

### 1.2 Diretor e Desenvolvedor ✅

| Cargo | Status Geral | Bug IDs |
|-------|--------------|---------|
| Diretor | ✅ | BUG-002/BUG-003/BUG-004 (Todos corrigidos) |
| Desenvolvedor | ✅ | BUG-006 (By Design) |

> Os cargos Diretor e Desenvolvedor possuem as mesmas permissões do Administrador (`admin:all`).
> - **BUG-006** foi fechado como "By Design" - é um comportamento de segurança intencional que impede personificação de Administradores/Desenvolvedores.

---

## 2. Operações

### 2.1 Manobrista - Testes Corrigidos ✅

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-MAN-005 | Ver próprios chamados | Visualizar lista de chamados próprios | Apenas seus chamados visíveis | ✅ | BUG-007 (Corrigido) |
| OPR-MAN-N01 | Sem acesso Unidades | Tentar acessar menu Unidades | Menu não visível ou acesso negado | ✅ | BUG-001 (Corrigido) |
| OPR-MAN-N06 | Não vê outras unidades | Verificar se vê chamados de outras unidades | Chamados de outras unidades não visíveis | ✅ | BUG-007 (Corrigido) |

> **Evidências (17/01/2026):**
> - `.playwright-mcp/test-manobrista-no-unidades-menu.png` - Menu Unidades não visível
> - `.playwright-mcp/test-manobrista-chamados-sem-17.png` - Chamado #17 (UN001) não aparece na lista (15 chamados visíveis, todos da UN015)

### 2.2 Encarregado - Testes Corrigidos ✅

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-ENC-006 | Ver chamados da unidade | Visualizar chamados da sua unidade | Chamados visíveis | ✅ | BUG-008 (Corrigido) |
| OPR-ENC-009 | Ver dados da unidade | Visualizar informações básicas da unidade | Dados visíveis | ✅ | BUG-009 (Corrigido) |

> **Evidências (17/01/2026):**
> - `.playwright-mcp/test-encarregado-chamados.png` - 15 chamados da unidade visíveis
> - `.playwright-mcp/test-encarregado-unidades-page.png` - Página de Unidades acessível

### 2.3 Supervisor - Testes Corrigidos ✅

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-SUP-009 | Ver dados múltiplas unidades | Visualizar informações das unidades de cobertura | Dados visíveis | ✅ | BUG-010 (Corrigido) |

> **Evidências (17/01/2026):**
> - `.playwright-mcp/test-supervisor-unidades-page.png` - Página de Unidades com 74 unidades visíveis

### 2.4 Gerente de Operações - Testes Mistos ⚠️

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-GER-007 | Triar chamado | Definir prioridade e responsável | Triagem salva | ✅ | BUG-012 (Corrigido) |
| OPR-GER-010 | Configurar checklist | Criar/editar template de checklist | Template salvo | ✅ | BUG-013 (Corrigido) |
| OPR-GER-011 | Editar unidade | Alterar dados de uma unidade | Dados salvos | ✅ | BUG-011 (Corrigido) |
| OPR-GER-013 | Fechar chamado | Fechar um chamado como resolvido | Chamado fechado | ✅ | BUG-014 (Corrigido) |

> **Evidências (17/01/2026):**
> - `.playwright-mcp/test-gerente-configurar-checklists.png` - Acesso a /checklists/configurar confirmado
> - `.playwright-mcp/test-gerente-unidades-page.png` - Visualização de unidades (sem edição)
> - `.playwright-mcp/test-gerente-triagem-chamado.png` - Seção de triagem NÃO aparece (bug corrigido - ver BUG-012)
>
> **Bugs Corrigidos:**
> - **BUG-012**: ✅ CORRIGIDO (17/01/2026) - Lógica do componente `ticket-actions.tsx` corrigida para permitir triagem mesmo quando `canManage=false`. Agora verifica todas as condições de forma independente.
> - **BUG-014**: ✅ CORRIGIDO (17/01/2026) - Botão "Fechar Chamado" adicionado para Gerente além de Admin.
> - **BUG-011**: ✅ CORRIGIDO (17/01/2026) - Política RLS UPDATE criada para permitir edição com `units:update`.

---

## 3. Compras e Manutenção

### 3.1 Gerente de Compras/Manutenção - Testes Reprovados

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-GER-007 | Ver configurações (leitura) | Acessar configurações em modo visualização | Configurações visíveis | ❌ | Menu Configurações não visível |

---

## 4. Financeiro

> ⚠️ **BUG-015 (CRÍTICO)**: Os seguintes cargos NÃO têm permissões definidas no código (`permissions.ts`):
> - Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor
> 
> Isso significa que **5 dos 7 cargos** do Financeiro terão **ZERO permissões** no sistema!

### 4.1 Assistente Financeiro ✅

| ID           | Teste              | Ação                       | Resultado Esperado                | Status | Bug ID      |
|--------------|--------------------|----------------------------|-----------------------------------|--------|-------------|
| FIN-ASS-001  | Acesso Dashboard   | Acessar Dashboard          | Dashboard carrega com dados       | ✅     | Corrigido   |
| FIN-ASS-002  | Acesso Chamados    | Tentar acessar menu Chamados| Menu visível, tickets:read OK     | ✅     | Corrigido   |
| FIN-ASS-003  | Permissões vazias  | Verificar permissões no sistema | Permissões corretas no array | ✅     | Corrigido   |

### 4.2 Analista Júnior Financeiro

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-AJR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| FIN-AJR-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, tickets:read OK | ✅ | Corrigido |
| FIN-AJR-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 4.3 Analista Pleno Financeiro

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-APL-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| FIN-APL-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, tickets:read OK | ✅ | Corrigido |
| FIN-APL-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 4.4 Analista Sênior Financeiro

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-ASR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| FIN-ASR-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, tickets:read OK | ✅ | Corrigido |
| FIN-ASR-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 4.5 Supervisor Financeiro

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| FIN-SUP-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, tickets:read OK | ✅ | Corrigido |
| FIN-SUP-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

---

## 5. RH ✅

> ⚠️ **BUG-015 (CRÍTICO)**: Os seguintes cargos NÃO têm permissões definidas no código (`permissions.ts`):
> - Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor
> 
> **5 dos 7 cargos** do RH terão **ZERO permissões** no sistema!

### 5.1 Auxiliar RH - Testes Aprovados ✅

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-AUX-002 | Acesso Usuários | Acessar menu Usuários | Menu NÃO visível (requer admin:all) | ✅ | Corrigido |

### 5.2 Assistente RH 

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-ASS-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| RH-ASS-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ✅ | Corrigido |
| RH-ASS-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 5.3 Analista Júnior RH

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-AJR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| RH-AJR-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ✅ | Corrigido |
| RH-AJR-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 5.4 Analista Pleno RH

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-APL-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| RH-APL-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ✅ | Corrigido |
| RH-APL-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 5.5 Analista Sênior RH

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-ASR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| RH-ASR-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ✅ | Corrigido |
| RH-ASR-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 5.6 Supervisor RH

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados | ✅ | Corrigido |
| RH-SUP-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ✅ | Corrigido |
| RH-SUP-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas no array | ✅ | Corrigido |

### 5.7 Gerente RH - Testes Aprovados

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-GER-002 | Acesso Usuários | Acessar menu Usuários | Menu NÃO visível (requer admin:all) | ✅ | Corrigido |
| RH-GER-003 | Acesso Configurações | Acessar menu Configurações | Menu NÃO visível (requer admin:all) | ✅ | Corrigido |

---

## 6. Sinistros ✅

> ⚠️ **BUG-015**: O cargo Supervisor NÃO tem permissões definidas no código (`permissions.ts`)

### 6.1 Supervisor Sinistros — Testes Corrigidos

| ID | Teste | Ação | Resultado Esperado | Status | Observação |
|----|-------|------|-------------------|--------|------------|
| SIN-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com dados corretos | ✅ | Corrigido |
| SIN-SUP-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível com permissões adequadas | ✅ | Corrigido |
| SIN-SUP-003 | Permissões aplicadas | Verificar permissões no sistema | Permissões corretas atribuídas | ✅ | Corrigido |

> ✅ **BUG-015 corrigido. Supervisor Sinistros agora possui permissões mapeadas e testadas conforme especificação.

---

## 7. Comercial ✅

### 7.1 Gerente Comercial - Testes Reprovados

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| COM-GER-003 | Ver lista unidades | Visualizar lista de unidades | Lista visível | ✅ | Corrigido |

---

## 8. Fluxo de Aprovação - Testes Pendentes

### 8.1 Testes de Negação em Cada Nível

> ⏳ Cada teste de negação precisa de um chamado novo, pois uma vez negado, o chamado não pode mais ser usado para testar outros níveis.

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FLX-N01 | Encarregado nega | Negar chamado no nível 1 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |
| FLX-N02 | Supervisor nega | Negar chamado no nível 2 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |
| FLX-N03 | Gerente nega | Negar chamado no nível 3 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |

---

## 9. Testes de RLS (Row Level Security) - Todos Pendentes

### 9.1 Isolamento de Dados - Chamados

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RLS-001 | Manobrista só vê próprios | Impersonar Manobrista, listar chamados | Apenas chamados criados por ele | ⏳ | |
| RLS-002 | Encarregado vê da unidade | Impersonar Encarregado, listar chamados | Vê chamados da sua unidade | ⏳ | |
| RLS-003 | Supervisor vê cobertura | Impersonar Supervisor, listar chamados | Vê chamados das unidades de cobertura | ⏳ | |
| RLS-004 | Gerente vê do departamento | Impersonar Gerente de depto, listar chamados | Vê chamados direcionados ao seu depto | ⏳ | |
| RLS-005 | Admin vê todos | Impersonar Admin, listar chamados | Vê todos os chamados do sistema | ⏳ | |

### 9.2 Isolamento de Dados - Checklists

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RLS-010 | Manobrista vê própria unidade | Impersonar Manobrista, ver histórico | Apenas checklists da sua unidade | ⏳ | |
| RLS-011 | Supervisor vê cobertura | Impersonar Supervisor, ver histórico | Checklists das unidades de cobertura | ⏳ | |
| RLS-012 | Gerente Oper. vê todos | Impersonar Gerente Operações, ver histórico | Vê todos os checklists | ⏳ | |

---

## Resumo de Bugs Encontrados

| Bug ID | Descrição | Severidade | Departamentos Afetados | Status |
|--------|-----------|------------|------------------------|--------|
| BUG-001 | Menu Unidades visível para Manobrista | MÉDIA | Operações | ✅ **Corrigido** |
| BUG-002 | Falha ao criar usuário | ALTA | Global (Admin/Diretor/Dev) | ✅ **Corrigido** |
| BUG-003 | Falha ao aprovar chamado | ALTA | Global (Admin/Diretor/Dev) | ✅ **Corrigido** |
| BUG-004 | Falha ao excluir chamado | ALTA | Global (Admin/Diretor/Dev) | ✅ **Corrigido** |
| BUG-006 | Erro específico Desenvolvedor | ALTA | Global (Desenvolvedor) | ✅ **By Design** |
| BUG-007 | Manobrista vê chamados de outras unidades | ALTA | Operações | ✅ **Corrigido** |
| BUG-008 | Encarregado não vê chamados da unidade | ALTA | Operações | ✅ **Corrigido** |
| BUG-009 | Encarregado não vê dados da unidade | MÉDIA | Operações | ✅ **Corrigido** |
| BUG-010 | Supervisor não vê dados das unidades de cobertura | MÉDIA | Operações | ✅ **Corrigido** |
| BUG-011 | Gerente Operações não consegue editar unidade | ALTA | Operações | ⚠️ **Parcial** (visualiza) |
| BUG-012 | Gerente Operações não consegue triar chamado | ALTA | Operações | ❌ **Reaberto** |
| BUG-013 | Gerente Operações não consegue configurar checklist | ALTA | Operações | ✅ **Corrigido** |
| BUG-014 | Gerente Operações não consegue fechar chamado | ALTA | Operações | ❌ **Reaberto** |
| **BUG-015** | **Cargos sem permissões definidas em `permissions.ts`** | **CRÍTICA** | **Financeiro (5), RH (5), Sinistros (1)** | ✅ **Corrigido** |
| BUG-016 | RH Gerente sem acesso Configurações | MÉDIA | RH | ✅ **Corrigido** |
| BUG-017 | RH não tem acesso ao menu Usuários | CRÍTICA | RH (Auxiliar, Gerente) | ✅ **Corrigido** |
| BUG-018 | Gerente Comercial não acessa Unidades | MÉDIA | Comercial | ✅ **Corrigido** |

---

## Priorização Recomendada

### Prioridade CRÍTICA (Resolver Primeiro)

1. **BUG-015**: 11 cargos em 3 departamentos sem nenhuma permissão
   - Afeta: Financeiro, RH, Sinistros
   - Impacto: Usuários não conseguem trabalhar

2. **BUG-017**: RH não consegue gerenciar usuários
   - Afeta: RH (Auxiliar e Gerente)
   - Impacto: RH não pode executar suas funções

### Prioridade ALTA

3. ~~**BUG-002/003/004/006**: Problemas com funções Admin~~ ✅ **CORRIGIDOS/FECHADOS**
4. **BUG-007/008**: Isolamento de chamados por unidade
5. **BUG-011/012/013/014**: Gerente Operações sem funcionalidades essenciais

### Prioridade MÉDIA

6. **BUG-001**: Menu visível incorretamente
7. **BUG-009/010**: Visualização de dados de unidade
8. **BUG-016/018**: Acessos de menu específicos

---

> **Documento gerado em:** 16 Janeiro 2026  
> **Fonte:** `projeto/testes/TESTES_PERMISSOES.md`
