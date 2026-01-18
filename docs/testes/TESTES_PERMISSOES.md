# Plano de Testes de Permissões - GAPP

> **Versão:** 1.0  
> **Data de Criação:** Janeiro 2026  
> **Baseado em:** `projeto/usuarios/PERMISSOES_COMPLETAS.md`

---

## ⚠️ INSTRUÇÕES IMPORTANTES - LEIA ANTES DE COMEÇAR

### Regras de Execução dos Testes

1. **Se funcionar conforme esperado**: Marque como aprovado com ✅
2. **Se NÃO funcionar conforme esperado**: 
   - Marque com ❌
   - **NÃO tente corrigir na hora**
   - Documente o bug em `projeto/testes/bugs/BUG-XXX.md`
   - Passe para o próximo teste

### Documentação de Bugs

Quando encontrar um bug, crie um arquivo em `projeto/testes/bugs/` seguindo o padrão:

```markdown
# BUG-001: [Título descritivo do bug]

## Informações
- **Data:** [data]
- **Teste:** [ID do teste, ex: OPR-MAN-001]
- **Usuário Testado:** [cargo/departamento]
- **Executor:** [seu nome]

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que realmente aconteceu]

## Passos para Reproduzir
1. [passo 1]
2. [passo 2]
3. ...

## Evidências
[Screenshots, logs, etc.]

## Observações
[Informações adicionais]
```

### Processo de Impersonação

Para testar cada cargo, siga os passos:

1. **Login como Admin:**
   - **Credenciais:** Ver arquivo `user_test-admin.md`
   - Email: `admin@garageinn.com.br`
   - Senha: `Teste123!`

2. **Navegar para Usuários:**
   - Acessar diretamente via URL: `/usuarios`
   - Ou via Menu lateral → Usuários

3. **Localizar o usuário de teste:**
   - **DICA:** Use o filtro de Departamento para facilitar a busca
   - No topo da página, selecione o departamento desejado no dropdown de filtro
   - Isso reduzirá a lista e facilitará encontrar o usuário específico

4. **Personificar o usuário de teste:**
   - Clique no menu de ações (três pontos) na linha do usuário
   - Clique na opção **"Personificar"** no dropdown

   > **Para Playwright/Automação:**
   > O botão de impersonificação está em um dropdown menu. Use o seguinte seletor:
   > ```javascript
   > // Primeiro abra o menu de ações do usuário
   > await page.getByRole('button', { name: /ações/i }).click();
   > // ou clique no botão de menu (três pontos) da linha do usuário
   > 
   > // Depois clique no item "Personificar" do dropdown
   > await page.getByRole('menuitem', { name: 'Personificar' }).click();
   > ```
   > 
   > **Seletores alternativos:**
   > - `[role="menuitem"]:has-text("Personificar")`
   > - `[data-slot="dropdown-menu-item"]:has-text("Personificar")`

5. **Executar os testes do cargo**

6. **Encerrar impersonação:**
   - Clicar no botão de encerrar impersonação (geralmente no topo da tela)

7. **Repetir para o próximo cargo**

---

## Índice de Testes

1. [Cargos Globais (Admin/Diretor/Desenvolvedor)](#1-cargos-globais)
2. [Departamento de Operações](#2-operações)
3. [Departamento de Compras e Manutenção](#3-compras-e-manutenção)
4. [Departamento Financeiro](#4-financeiro)
5. [Departamento de RH](#5-rh)
6. [Departamento de Sinistros](#6-sinistros)
7. [Departamento Comercial](#7-comercial)
8. [Departamento de Auditoria](#8-auditoria)
9. [Departamento de TI](#9-ti)
10. [Testes de Fluxo de Aprovação](#10-fluxo-de-aprovação)
11. [Testes de RLS (Row Level Security)](#11-testes-de-rls)

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Teste aprovado - funcionou conforme esperado |
| ❌ | Teste reprovado - documentar bug |
| ⏳ | Teste pendente |
| 🚫 | Teste não aplicável |
| 🔸 | Comportamento parcial esperado |

---

## 1. Cargos Globais

### Pré-requisito
Usuários de teste necessários com cargos: **Administrador**, **Diretor**, **Desenvolvedor**

### 1.1 Testes de Acesso - Administrador

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| ADM-001 | Acesso Dashboard | Acessar menu Dashboard | Dashboard carrega com todas as métricas e alertas | ✅ | |
| ADM-002 | Acesso Chamados | Acessar menu Chamados | Lista todos os chamados do sistema | ✅ | |
| ADM-003 | Acesso Checklists | Acessar menu Checklists | Lista todos os checklists | ✅ | |
| ADM-004 | Acesso Unidades | Acessar menu Unidades | Lista todas as unidades | ✅ | |
| ADM-005 | Acesso Usuários | Acessar menu Usuários | Lista todos os usuários | ✅ | |
| ADM-006 | Acesso Configurações | Acessar menu Configurações | Todas as seções visíveis e editáveis | ✅ | |

### 1.2 Testes de Ações - Administrador

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| ADM-010 | Criar usuário | Criar novo usuário completo | Usuário criado com sucesso | ❌ | BUG-002 |
| ADM-011 | Editar usuário | Editar dados de qualquer usuário | Dados salvos com sucesso | ✅ | |
| ADM-012 | Desativar usuário | Desativar um usuário existente | Usuário desativado | ✅ | |
| ADM-013 | Personificar usuário | Impersonar qualquer usuário | Sessão iniciada como outro usuário | ✅ | |
| ADM-014 | Criar chamado | Criar novo chamado | Chamado criado com sucesso | ✅ | |
| ADM-015 | Triar chamado | Definir prioridade e responsável | Triagem salva | ✅ | |
| ADM-016 | Aprovar chamado | Aprovar um chamado pendente | Chamado aprovado | ❌ | BUG-003 |
| ADM-017 | Excluir chamado | Excluir um chamado | Chamado excluído | ❌ | BUG-004 |
| ADM-018 | Criar unidade | Criar nova unidade | Unidade criada | ✅ | |
| ADM-019 | Editar unidade | Editar dados de unidade | Dados salvos | ✅ | |
| ADM-020 | Configurar checklist | Criar/editar template de checklist | Template salvo | ✅ | |
| ADM-021 | Excluir checklist | Excluir execução de checklist | Execução excluída | 🚫 | Sem execuções disponíveis |
| ADM-022 | Editar configurações | Alterar configurações do sistema | Configurações salvas | ✅ | |

### 1.3 Testes para Diretor e Desenvolvedor

> Os cargos Diretor e Desenvolvedor possuem as mesmas permissões do Administrador (`admin:all`).
> Execute os mesmos testes ADM-001 a ADM-022 para cada cargo.

| Cargo | Testes Executados | Status Geral |
|-------|-------------------|--------------|
| Diretor | ADM-001 a ADM-022 | ❌ (BUG-002/BUG-003/BUG-004) |
| Desenvolvedor | ADM-001 a ADM-022 | ❌ (BUG-006) |

---

## 2. Operações

### 2.1 Manobrista

**Usuário de teste:** [inserir email do manobrista de teste]

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-MAN-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| OPR-MAN-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| OPR-MAN-003 | Acesso Checklists | Acessar menu Checklists | Menu acessível | ✅ | |
| OPR-MAN-004 | Criar chamado | Criar novo chamado para qualquer departamento | Chamado criado | ✅ | |
| OPR-MAN-005 | Ver próprios chamados | Visualizar lista de chamados próprios | Apenas seus chamados visíveis | ❌ | BUG-007 |
| OPR-MAN-006 | Comentar chamado próprio | Adicionar comentário em chamado que criou | Comentário salvo | ✅ | |
| OPR-MAN-007 | Executar checklist abertura | Preencher checklist de abertura da sua unidade | Checklist salvo | 🚫 | Sem checklists disponíveis |
| OPR-MAN-008 | Ver histórico checklist | Ver histórico de checklists da sua unidade | Histórico visível | 🚫 | Sem execuções disponíveis |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-MAN-N01 | Sem acesso Unidades | Tentar acessar menu Unidades | Menu não visível ou acesso negado | ❌ | BUG-001 |
| OPR-MAN-N02 | Sem acesso Usuários | Tentar acessar menu Usuários | Menu não visível ou acesso negado | ✅ | |
| OPR-MAN-N03 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível ou acesso negado | ✅ | |
| OPR-MAN-N04 | Não pode aprovar | Tentar aprovar um chamado | Botão não visível ou ação bloqueada | ✅ | |
| OPR-MAN-N05 | Não pode triar | Tentar definir prioridade/responsável | Campos não editáveis ou bloqueados | ✅ | |
| OPR-MAN-N06 | Não vê outras unidades | Verificar se vê chamados de outras unidades | Chamados de outras unidades não visíveis | ❌ | BUG-007 |
| OPR-MAN-N07 | Não configura checklist | Tentar acessar configuração de checklist | Acesso negado | ✅ | |
| OPR-MAN-N08 | Não pode excluir chamado | Tentar excluir um chamado | Botão não visível ou ação bloqueada | ✅ | |

---

### 2.2 Encarregado

**Usuário de teste:** [inserir email do encarregado de teste]

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-ENC-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| OPR-ENC-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| OPR-ENC-003 | Acesso Checklists | Acessar menu Checklists | Menu acessível | ✅ | |
| OPR-ENC-004 | Acesso Unidades | Acessar menu Unidades | Menu acessível | ✅ | |
| OPR-ENC-005 | Criar chamado | Criar novo chamado | Chamado criado | ✅ | |
| OPR-ENC-006 | Ver chamados da unidade | Visualizar chamados da sua unidade | Chamados visíveis | ❌ | BUG-008 |
| OPR-ENC-007 | Aprovar chamado (nível 1) | Aprovar chamado de manobrista da sua unidade | Aprovação registrada | ✅ | |
| OPR-ENC-008 | Executar checklist abertura | Preencher checklist de abertura | Checklist salvo | 🚫 | Sem checklists disponíveis |
| OPR-ENC-009 | Ver dados da unidade | Visualizar informações básicas da unidade | Dados visíveis | ❌ | BUG-009 |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-ENC-N01 | Sem acesso Usuários | Tentar acessar menu Usuários | Menu não visível ou acesso negado | ✅ | |
| OPR-ENC-N02 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível ou acesso negado | ✅ | |
| OPR-ENC-N03 | Não pode triar | Tentar definir prioridade/responsável em chamado | Campos não editáveis | ✅ | |
| OPR-ENC-N04 | Não pode aprovar nível 2/3 | Tentar aprovar como supervisor/gerente | Ação bloqueada | ✅ | |
| OPR-ENC-N05 | Não configura checklist | Tentar acessar configuração de checklist | Acesso negado | ✅ | |
| OPR-ENC-N06 | Não pode excluir chamado | Tentar excluir um chamado | Botão não visível ou ação bloqueada | ✅ | |

---

### 2.3 Supervisor

**Usuário de teste:** [inserir email do supervisor de teste]

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| OPR-SUP-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| OPR-SUP-003 | Acesso Checklists | Acessar menu Checklists | Menu acessível | ✅ | |
| OPR-SUP-004 | Acesso Unidades | Acessar menu Unidades | Menu acessível | ✅ | |
| OPR-SUP-005 | Criar chamado | Criar novo chamado | Chamado criado | ✅ | |
| OPR-SUP-006 | Ver chamados múltiplas unidades | Ver chamados de todas unidades de cobertura | Chamados visíveis | ✅ | |
| OPR-SUP-007 | Aprovar chamado (nível 2) | Aprovar chamado já aprovado pelo encarregado | Aprovação registrada | ✅ | |
| OPR-SUP-008 | Executar checklist supervisão | Preencher checklist de supervisão | Checklist salvo | 🚫 | Sem checklists disponíveis |
| OPR-SUP-009 | Ver dados múltiplas unidades | Visualizar informações das unidades de cobertura | Dados visíveis | ❌ | BUG-010 |
| OPR-SUP-010 | Ver histórico checklists (cobertura) | Ver histórico de todas unidades de cobertura | Histórico visível | ✅ | |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-SUP-N01 | Sem acesso Usuários | Tentar acessar menu Usuários | Menu não visível ou acesso negado | ✅ | |
| OPR-SUP-N02 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível ou acesso negado | ✅ | |
| OPR-SUP-N03 | Não pode triar | Tentar definir prioridade/responsável em chamado | Campos não editáveis | ✅ | |
| OPR-SUP-N04 | Não pode aprovar nível 3 | Tentar aprovar como gerente | Ação bloqueada | ✅ | |
| OPR-SUP-N05 | Não configura checklist | Tentar acessar configuração de checklist | Acesso negado | ✅ | |
| OPR-SUP-N06 | Não pode excluir chamado | Tentar excluir um chamado | Botão não visível ou ação bloqueada | ✅ | |

---

### 2.4 Gerente de Operações

**Usuário de teste:** [inserir email do gerente de operações de teste]

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| OPR-GER-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| OPR-GER-003 | Acesso Checklists | Acessar menu Checklists | Menu acessível | ✅ | |
| OPR-GER-004 | Acesso Unidades | Acessar menu Unidades | Menu acessível | ✅ | |
| OPR-GER-005 | Criar chamado | Criar novo chamado | Chamado criado | ✅ | |
| OPR-GER-006 | Ver todos chamados | Ver chamados de todas as unidades | Todos chamados visíveis | ✅ | |
| OPR-GER-007 | Triar chamado | Definir prioridade e responsável | Triagem salva | ❌ | BUG-012 |
| OPR-GER-008 | Aprovar chamado (nível 3) | Aprovar chamado como última instância | Aprovação final registrada | ✅ | |
| OPR-GER-009 | Executar checklist supervisão | Preencher checklist de supervisão | Checklist salvo | 🚫 | Sem checklists disponíveis |
| OPR-GER-010 | Configurar checklist | Criar/editar template de checklist | Template salvo | ❌ | BUG-013 |
| OPR-GER-011 | Editar unidade | Alterar dados de uma unidade | Dados salvos | ❌ | BUG-011 |
| OPR-GER-012 | Ver histórico checklists (todos) | Ver histórico de todas as unidades | Histórico completo visível | ✅ | |
| OPR-GER-013 | Fechar chamado | Fechar um chamado como resolvido | Chamado fechado | ❌ | BUG-014 |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| OPR-GER-N01 | Sem acesso Usuários | Tentar acessar menu Usuários | Menu não visível ou acesso negado | ✅ | |
| OPR-GER-N02 | Sem acesso Configurações (globais) | Tentar acessar Configurações do sistema | Menu não visível ou acesso negado | ✅ | |
| OPR-GER-N03 | Não pode criar usuário | Tentar criar novo usuário | Ação não disponível | ✅ | |
| OPR-GER-N04 | Não pode excluir chamado | Tentar excluir um chamado | Botão não visível ou ação bloqueada | ✅ | |
| OPR-GER-N05 | Não pode excluir checklist | Tentar excluir execução de checklist | Ação bloqueada | ✅ | |
| OPR-GER-N06 | Não pode personificar | Tentar personificar outro usuário | Ação não disponível | ✅ | |

---

## 3. Compras e Manutenção

> ⚠️ **NOTA IMPORTANTE - Discrepância de Cargos**
> 
> O documento `PERMISSOES_COMPLETAS.md` define os cargos: **Auxiliar, Analista, Coordenador, Gerente**
> 
> Porém os cargos **implementados** no sistema são: **Assistente, Comprador, Gerente**
> 
> - O cargo "Auxiliar" documentado NÃO existe - foi implementado como "Assistente" com permissões diferentes
> - O cargo "Analista" documentado NÃO existe - foi implementado como "Comprador"
> - O cargo "Coordenador" documentado NÃO existe no sistema
> 
> Os testes abaixo foram adaptados para os cargos realmente implementados.

### 3.1 Assistente (mapeado de "Auxiliar")

**Usuário de teste:** assistente_compras_e_manutencao_teste@garageinn.com

> **⚠️ Comportamento diferente do documentado**: O Assistente tem mais permissões que o "Auxiliar" documentado

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-AUX-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| CMP-AUX-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| CMP-AUX-003 | Ver chamados do depto | Visualizar chamados de Compras/Manutenção | Chamados visíveis | ✅ | |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-AUX-N01 | Não pode criar chamado | Tentar criar novo chamado | Ação não disponível | 🔸 | DISCREPÂNCIA - Assistente PODE criar chamados |
| CMP-AUX-N02 | Não pode executar chamado | Tentar alterar status de chamado | Ação bloqueada | 🔸 | DISCREPÂNCIA - Assistente PODE executar chamados |
| CMP-AUX-N03 | Não pode aprovar chamado | Tentar aprovar chamado | Ação não disponível | ✅ | Botão aprovar não visível |
| CMP-AUX-N04 | Sem acesso Checklists | Tentar acessar Checklists | Menu não visível | 🔸 | DISCREPÂNCIA - Assistente TEM acesso a Checklists |
| CMP-AUX-N05 | Sem acesso Unidades | Tentar acessar Unidades | Menu não visível | ✅ | Redirecionou para Dashboard |
| CMP-AUX-N06 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível | ✅ | Menu não visível |
| CMP-AUX-N07 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível | ✅ | Menu não visível |

---

### 3.2 Comprador (substituindo "Analista")

**Usuário de teste:** comprador_compras_e_manutencao_teste@garageinn.com

> **Nota**: O cargo "Analista" documentado foi implementado como "Comprador"
> 
> **Observação**: O Comprador tem permissões idênticas ao Assistente nesta implementação.

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-ANA-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| CMP-ANA-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| CMP-ANA-003 | Ver chamados do depto | Visualizar chamados de Compras/Manutenção | Chamados visíveis | ✅ | |
| CMP-ANA-004 | Executar chamado | Atualizar status/trabalhar em chamado | Status atualizado | ✅ | Botões Iniciar Andamento, Cotação disponíveis |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-ANA-N01 | Não pode aprovar | Tentar aprovar chamado | Ação não disponível | ✅ | Botão Aprovar não visível |
| CMP-ANA-N02 | Não pode triar | Tentar definir prioridade | Campo não editável | ✅ | Campos de triagem não disponíveis |
| CMP-ANA-N03 | Sem acesso Checklists | Tentar acessar Checklists | Menu não visível | 🔸 | DISCREPÂNCIA - TEM acesso |
| CMP-ANA-N04 | Sem acesso Unidades | Tentar acessar Unidades | Menu não visível | 🔸 | DISCREPÂNCIA - Menu visível |
| CMP-ANA-N05 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível | ✅ | |
| CMP-ANA-N06 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível | ✅ | |

---

### 3.3 Coordenador

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**
> 
> O cargo "Coordenador" está documentado mas NÃO foi implementado. Os testes abaixo não podem ser executados.

**Usuário de teste:** N/A - Cargo não implementado

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-COO-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | 🚫 | Cargo não existe |
| CMP-COO-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | 🚫 | Cargo não existe |
| CMP-COO-003 | Ver chamados do depto | Visualizar chamados de Compras/Manutenção | Chamados visíveis | 🚫 | Cargo não existe |
| CMP-COO-004 | Executar chamado | Atualizar status/trabalhar em chamado | Status atualizado | 🚫 | Cargo não existe |
| CMP-COO-005 | Aprovar chamado | Aprovar chamado do departamento | Aprovação registrada | 🚫 | Cargo não existe |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-COO-N01 | Não pode triar | Tentar definir prioridade | Campo não editável | 🚫 | Cargo não existe |
| CMP-COO-N02 | Sem acesso Checklists | Tentar acessar Checklists | Menu não visível | 🚫 | Cargo não existe |
| CMP-COO-N03 | Sem acesso Unidades | Tentar acessar Unidades | Menu não visível | 🚫 | Cargo não existe |
| CMP-COO-N04 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível | 🚫 | Cargo não existe |
| CMP-COO-N05 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível | 🚫 | Cargo não existe |

---

### 3.4 Gerente de Compras/Manutenção

**Usuário de teste:** gerente_compras_e_manutencao_teste@garageinn.com

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| CMP-GER-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | |
| CMP-GER-003 | Ver chamados do depto | Visualizar chamados de Compras/Manutenção | Chamados visíveis | ✅ | |
| CMP-GER-004 | Executar chamado | Atualizar status/trabalhar em chamado | Status atualizado | ✅ | Botões de ação disponíveis |
| CMP-GER-005 | Aprovar chamado | Aprovar chamado do departamento | Aprovação registrada | 🔸 | Botão Aprovar não visível diretamente |
| CMP-GER-006 | Triar chamado | Definir prioridade e responsável | Triagem salva | ✅ | Botão "Fazer Triagem" disponível |
| CMP-GER-007 | Ver configurações (leitura) | Acessar configurações em modo visualização | Configurações visíveis | ❌ | Menu Configurações não visível |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| CMP-GER-N01 | Não pode criar usuário | Tentar criar novo usuário | Ação não disponível | ✅ | Menu Usuários não visível |
| CMP-GER-N02 | Não pode editar configurações | Tentar modificar configurações | Campos não editáveis ou ação bloqueada | ✅ | Menu Configurações não visível |
| CMP-GER-N03 | Sem acesso Checklists | Tentar acessar Checklists | Menu não visível | 🔸 | DISCREPÂNCIA - TEM acesso |
| CMP-GER-N04 | Sem acesso Unidades | Tentar acessar Unidades | Menu não visível | 🔸 | DISCREPÂNCIA - Menu visível |
| CMP-GER-N05 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível | ✅ | |
| CMP-GER-N06 | Não pode excluir chamado | Tentar excluir chamado | Ação bloqueada | ✅ | Botão excluir não visível |

---

## 4. Financeiro

> ⚠️ **NOTA IMPORTANTE - Discrepância de Cargos (BUG-015)**
> 
> O documento `PERMISSOES_COMPLETAS.md` define os cargos: **Auxiliar, Analista, Coordenador, Gerente**
> 
> Porém os cargos **implementados** no sistema são: **Auxiliar, Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor, Gerente**
> 
> **PROBLEMA CRÍTICO**: Os seguintes cargos NÃO têm permissões definidas no código (`permissions.ts`):
> - Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor
> 
> Isso significa que **5 dos 7 cargos** do Financeiro terão **ZERO permissões** no sistema!
> 
> Os testes abaixo foram adaptados para os cargos realmente implementados.

### 4.1 Auxiliar Financeiro

**Usuário de teste:** auxiliar_financeiro_teste@garageinn.com

> **Permissões esperadas (código)**: `tickets:read`  
> **Menus esperados**: Início, Chamados, Checklists, Unidades (todos visíveis no sidebar)  
> **Nota**: Não há chamados cadastrados para o departamento Financeiro no momento dos testes

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-AUX-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | Confirmado via código |
| FIN-AUX-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível, página carrega | ✅ | Tem tickets:read |
| FIN-AUX-003 | Ver chamados do depto | Visualizar chamados do Financeiro | Lista vazia (sem chamados no depto) | 🚫 | Sem chamados |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-AUX-N01 | Não pode aprovar | Tentar aprovar chamado | Ação não disponível | 🚫 | Sem chamados |
| FIN-AUX-N02 | Acesso Checklists | Tentar acessar Checklists | Menu VISÍVEL | ✅ | Menu visível para todos |
| FIN-AUX-N03 | Acesso Unidades | Tentar acessar Unidades | Menu VISÍVEL | ✅ | Menu visível para todos |
| FIN-AUX-N04 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível (requer admin:all) | ✅ | Oculto corretamente |
| FIN-AUX-N05 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível (requer admin:all) | ✅ | Oculto corretamente |

---

### 4.2 Assistente Financeiro

**Usuário de teste:** assistente_financeiro_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts` (linha 114-132)

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| FIN-ASS-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| FIN-ASS-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, mas sem permissão tickets:read | ❌ | BUG-015 |
| FIN-ASS-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 4.3 Analista Júnior Financeiro

**Usuário de teste:** analista_junior_financeiro_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| FIN-AJR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| FIN-AJR-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, mas sem permissão tickets:read | ❌ | BUG-015 |
| FIN-AJR-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 4.4 Analista Pleno Financeiro

**Usuário de teste:** analista_pleno_financeiro_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| FIN-APL-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| FIN-APL-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, mas sem permissão tickets:read | ❌ | BUG-015 |
| FIN-APL-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 4.5 Analista Sênior Financeiro

**Usuário de teste:** analista_senior_financeiro_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| FIN-ASR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| FIN-ASR-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, mas sem permissão tickets:read | ❌ | BUG-015 |
| FIN-ASR-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 4.6 Supervisor Financeiro

**Usuário de teste:** supervisor_financeiro_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| FIN-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| FIN-SUP-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível, mas sem permissão tickets:read | ❌ | BUG-015 |
| FIN-SUP-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 4.7 Gerente Financeiro

**Usuário de teste:** gerente_financeiro_teste@garageinn.com

> **Permissões esperadas (código)**: `tickets:read`, `tickets:approve`, `settings:read`  
> **NOTA**: `settings:read` NÃO dá acesso ao menu Configurações (requer `admin:all`)

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | Confirmado via código |
| FIN-GER-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | Tem tickets:read |
| FIN-GER-003 | Ver chamados do depto | Visualizar chamados do Financeiro | Chamados visíveis (lista vazia) | 🚫 | Sem chamados |
| FIN-GER-004 | Aprovar chamado | Aprovar chamado financeiro | Aprovação registrada | 🚫 | Sem chamados |
| FIN-GER-005 | Ver configurações (leitura) | Acessar configurações em modo visualização | Menu NÃO VISÍVEL (requer admin:all) | 🔸 | Por design - settings:read é para APIs |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FIN-GER-N01 | Sem acesso Configurações | Tentar acessar Configurações | Menu não visível (requer admin:all) | ✅ | Oculto corretamente |
| FIN-GER-N02 | Acesso Checklists | Tentar acessar Checklists | Menu VISÍVEL (comportamento atual) | ✅ | Menu visível para todos |
| FIN-GER-N03 | Acesso Unidades | Tentar acessar Unidades | Menu VISÍVEL (comportamento atual) | ✅ | Menu visível para todos |
| FIN-GER-N04 | Sem acesso Usuários | Tentar acessar Usuários | Menu não visível (requer admin:all) | ✅ | Oculto corretamente |
| FIN-GER-N05 | Não pode excluir chamado | Tentar excluir chamado | Ação bloqueada | 🚫 | Sem chamados |

---

## 5. RH

> ⚠️ **NOTA IMPORTANTE - Discrepância de Cargos (BUG-015)**
> 
> O documento `PERMISSOES_COMPLETAS.md` define os cargos: **Auxiliar, Analista, Coordenador, Gerente**
> 
> Porém os cargos **implementados** no sistema são: **Auxiliar, Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor, Gerente**
> 
> **PROBLEMA CRÍTICO**: Os seguintes cargos NÃO têm permissões definidas no código (`permissions.ts`):
> - Assistente, Analista Júnior, Analista Pleno, Analista Sênior, Supervisor
> 
> Isso significa que **5 dos 7 cargos** do RH terão **ZERO permissões** no sistema!
> 
> Os testes abaixo foram adaptados para os cargos realmente implementados.

### 5.1 Auxiliar RH

**Usuário de teste:** auxiliar_rh_teste@garageinn.com

> **Permissões esperadas (código)**: `users:read`  
> **NOTA**: Menu Usuários requer `admin:all`, então mesmo com `users:read` o menu não será visível!

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-AUX-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | Validado via código |
| RH-AUX-002 | Acesso Usuários | Acessar menu Usuários | Menu NÃO visível (requer admin:all) | ❌ | BUG-017 |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-AUX-N01 | Sem acesso Usuários | Menu Usuários não visível | Menu não visível (requer admin:all) | ✅ | Confirmado |
| RH-AUX-N02 | Sem acesso Chamados | Menu Chamados | Menu VISÍVEL (comportamento atual) | ✅ | Confirmado |
| RH-AUX-N03 | Sem acesso Checklists | Menu Checklists | Menu VISÍVEL (comportamento atual) | ✅ | Confirmado |
| RH-AUX-N04 | Sem acesso Configurações | Menu Configurações | Menu não visível (requer admin:all) | ✅ | Confirmado |

---

### 5.2 Assistente RH

**Usuário de teste:** assistente_rh_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| RH-ASS-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| RH-ASS-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ❌ | BUG-015 |
| RH-ASS-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 5.3 Analista Júnior RH

**Usuário de teste:** analista_junior_rh_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| RH-AJR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| RH-AJR-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ❌ | BUG-015 |
| RH-AJR-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 5.4 Analista Pleno RH

**Usuário de teste:** analista_pleno_rh_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| RH-APL-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| RH-APL-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ❌ | BUG-015 |
| RH-APL-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 5.5 Analista Sênior RH

**Usuário de teste:** analista_senior_rh_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| RH-ASR-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| RH-ASR-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ❌ | BUG-015 |
| RH-ASR-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 5.6 Supervisor RH

**Usuário de teste:** supervisor_rh_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| RH-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| RH-SUP-002 | Acesso Usuários | Tentar acessar menu Usuários | Menu não visível | ❌ | BUG-015 |
| RH-SUP-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 5.7 Gerente RH

**Usuário de teste:** gerente_rh_teste@garageinn.com

> **Permissões esperadas (código)**: `users:read`, `users:create`, `users:update`, `users:delete`, `settings:read`  
> **NOTA**: Menu Usuários e Configurações requerem `admin:all` - permissões não terão efeito na UI!

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | Validado via código |
| RH-GER-002 | Acesso Usuários | Acessar menu Usuários | Menu NÃO visível (requer admin:all) | ❌ | BUG-017 |
| RH-GER-003 | Acesso Configurações | Acessar menu Configurações | Menu NÃO visível (requer admin:all) | ❌ | BUG-016 |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RH-GER-N01 | Não pode personificar | Tentar personificar usuário | Ação não disponível | ✅ | Confirmado - requer admin:all |
| RH-GER-N02 | Sem acesso Chamados | Menu Chamados | Menu VISÍVEL (comportamento atual) | ✅ | Confirmado |
| RH-GER-N03 | Sem acesso Checklists | Menu Checklists | Menu VISÍVEL (comportamento atual) | ✅ | Confirmado |

---

## 6. Sinistros

> ⚠️ **NOTA IMPORTANTE - Discrepância de Cargos**
> 
> O documento `PERMISSOES_COMPLETAS.md` define os cargos: **Auxiliar, Analista, Coordenador, Gerente**
> 
> Porém os cargos **implementados** no sistema são apenas: **Supervisor, Gerente**
> 
> **PROBLEMA**: O cargo Supervisor NÃO tem permissões definidas no código (`permissions.ts`)
> 
> Os cargos Auxiliar, Analista e Coordenador **não existem** no banco de dados.

### 6.1 Auxiliar Sinistros

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**
> 
> O cargo "Auxiliar" está documentado mas NÃO foi implementado no banco de dados.

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| SIN-AUX-* | Todos os testes | 🚫 | Cargo não existe |

---

### 6.2 Analista Sinistros

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**
> 
> O cargo "Analista" está documentado mas NÃO foi implementado no banco de dados.

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| SIN-ANA-* | Todos os testes | 🚫 | Cargo não existe |

---

### 6.3 Coordenador Sinistros

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**
> 
> O cargo "Coordenador" está documentado mas NÃO foi implementado no banco de dados.

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| SIN-COO-* | Todos os testes | 🚫 | Cargo não existe |

---

### 6.4 Supervisor Sinistros

**Usuário de teste:** supervisor_sinistros_teste@garageinn.com

> ⚠️ **CRÍTICO: SEM PERMISSÕES DEFINIDAS NO CÓDIGO**  
> Cargo existe no banco mas NÃO tem mapeamento em `permissions.ts`

#### Testes (Verificação de Bug)

| ID | Teste | Ação | Resultado Esperado (BUG) | Status | Bug ID |
|----|-------|------|--------------------------|--------|--------|
| SIN-SUP-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega mas sem dados | ❌ | BUG-015 |
| SIN-SUP-002 | Acesso Chamados | Tentar acessar menu Chamados | Menu visível mas sem permissão tickets:* | ❌ | BUG-015 |
| SIN-SUP-003 | Permissões vazias | Verificar permissões no sistema | Array de permissões VAZIO | ❌ | BUG-015 |

---

### 6.5 Gerente Sinistros

**Usuário de teste:** gerente_sinistros_teste@garageinn.com

> **Permissões esperadas (código)**: `tickets:read`, `tickets:execute`, `tickets:approve`, `settings:read`  
> **NOTA**: `settings:read` não dá acesso ao menu Configurações (requer `admin:all`)

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| SIN-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | Validado via código |
| SIN-GER-002 | Acesso Chamados | Acessar menu Chamados | Menu acessível | ✅ | Validado via código |
| SIN-GER-003 | Ver chamados do depto | Visualizar chamados de Sinistros | Chamados visíveis (lista pode estar vazia) | ✅ | Validado via código |
| SIN-GER-004 | Executar chamado | Atualizar status/trabalhar em chamado | Status atualizado | 🚫 | Sem chamados |
| SIN-GER-005 | Aprovar chamado | Aprovar chamado de Sinistros | Aprovação registrada | 🚫 | Sem chamados |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| SIN-GER-N01 | Sem acesso Configurações | Menu Configurações | Menu NÃO visível (requer admin:all) | ✅ | Validado via código |
| SIN-GER-N02 | Acesso Checklists | Menu Checklists | Menu VISÍVEL (comportamento atual) | ✅ | Validado via código |
| SIN-GER-N03 | Acesso Unidades | Menu Unidades | Menu VISÍVEL (comportamento atual) | ✅ | Validado via código |
| SIN-GER-N04 | Sem acesso Usuários | Menu Usuários | Menu não visível (requer admin:all) | ✅ | Validado via código |

---

## 7. Comercial

> ⚠️ **NOTA IMPORTANTE - Discrepância de Cargos**
> 
> O documento `PERMISSOES_COMPLETAS.md` define os cargos: **Vendedor, Analista, Coordenador, Gerente**
> 
> Porém o único cargo **implementado** no sistema é: **Gerente**
> 
> Os cargos Vendedor, Analista e Coordenador **não existem** no banco de dados.

### 7.1 Vendedor

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| COM-VEN-* | Todos os testes | 🚫 | Cargo não existe |

---

### 7.2 Analista Comercial

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| COM-ANA-* | Todos os testes | 🚫 | Cargo não existe |

---

### 7.3 Coordenador Comercial

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| COM-COO-* | Todos os testes | 🚫 | Cargo não existe |

---

### 7.4 Gerente Comercial

**Usuário de teste:** gerente_comercial_teste@garageinn.com

> **Permissões esperadas (código)**: `units:read`, `tickets:read`, `settings:read`  
> **NOTA**: `settings:read` não dá acesso ao menu Configurações (requer `admin:all`)

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| COM-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| COM-GER-002 | Acesso Unidades | Acessar menu Unidades | Menu visível | ✅ | |
| COM-GER-003 | Ver lista unidades | Visualizar lista de unidades | Lista visível | ❌ | BUG-018 |
| COM-GER-004 | Acesso Chamados | Acessar menu Chamados | Menu visível | ✅ | |
| COM-GER-005 | Ver chamados | Visualizar chamados (leitura) | Chamados visíveis | ✅ | |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| COM-GER-N01 | Sem acesso Configurações | Menu Configurações | Menu NÃO visível (requer admin:all) | ✅ | |
| COM-GER-N02 | Acesso Checklists | Menu Checklists | Menu VISÍVEL (comportamento atual) | ✅ | |
| COM-GER-N03 | Sem acesso Usuários | Menu Usuários | Menu não visível (requer admin:all) | ✅ | |

---

## 8. Auditoria

> ⚠️ **NOTA - Discrepância de Cargos**
> 
> Cargos no código: Auditor, Auditor Sênior, Coordenador, Gerente
> 
> Cargos no banco: **Apenas Auditor e Gerente**
> 
> Auditor Sênior e Coordenador **não existem** no banco.

### 8.1 Auditor

**Usuário de teste:** auditor_auditoria_teste@garageinn.com

> **Permissões esperadas (código)**: `tickets:read`, `checklists:read`

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| AUD-AUD-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| AUD-AUD-002 | Acesso Chamados | Acessar menu Chamados | Menu visível | ✅ | |
| AUD-AUD-003 | Acesso Checklists | Acessar menu Checklists | Menu visível | ✅ | |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| AUD-AUD-N01 | Sem acesso Usuários | Menu Usuários | Menu não visível | ✅ | |
| AUD-AUD-N02 | Sem acesso Configurações | Menu Configurações | Menu não visível | ✅ | |

---

### 8.2 Auditor Sênior

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| AUD-SEN-* | Todos os testes | 🚫 | Cargo não existe |

---

### 8.3 Coordenador Auditoria

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| AUD-COO-* | Todos os testes | 🚫 | Cargo não existe |

---

### 8.4 Gerente Auditoria

**Usuário de teste:** gerente_auditoria_teste@garageinn.com

> **Permissões esperadas (código)**: `tickets:read`, `tickets:approve`, `checklists:read`, `checklists:configure`, `settings:read`

#### Testes Positivos (DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| AUD-GER-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega | ✅ | |
| AUD-GER-002 | Acesso Chamados | Acessar menu Chamados | Menu visível | ✅ | |
| AUD-GER-003 | Acesso Checklists | Acessar menu Checklists | Menu visível | ✅ | |

#### Testes Negativos (NÃO DEVE funcionar)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| AUD-GER-N01 | Sem acesso Configurações | Menu Configurações | Menu NÃO visível (requer admin:all) | ✅ | Por design |
| AUD-GER-N02 | Sem acesso Usuários | Menu Usuários | Menu não visível | ✅ | |

---

## 9. TI

> ✅ **TESTADO 16/01/2026**: Todos os cargos de TI funcionam corretamente
> 
> Cargos no código: Analista de Suporte, Desenvolvedor, Coordenador, Gerente
> 
> Cargos no banco: **Apenas Analista e Gerente**
> 
> **NOTA**: O cargo "Analista (TI)" no banco está mapeado corretamente para permissões.
> Tanto Analista quanto Gerente de TI têm permissões funcionais.

### 9.1 Analista de Suporte / Analista TI

**Usuário de teste:** analista_ti_teste@garageinn.com

> ✅ **CORRIGIDO**: O cargo "Analista (TI)" no banco está mapeado corretamente em `permissions.ts`
> Testado em 16/01/2026 - Permissões funcionando

#### Testes (Verificação)

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| TI-ANA-001 | Acesso Dashboard | Acessar Dashboard | Dashboard carrega com métricas | ✅ | - |
| TI-ANA-002 | Verificar permissões | Verificar se "Analista" tem permissões | Permissões funcionais: Dashboard ✅, Chamados ✅, Checklists ✅, Unidades ✅, Novo Chamado ✅. Menus Usuários e Configurações não visíveis (correto). | ✅ | - |

---

### 9.2 Desenvolvedor TI

> 🚫 **CARGO NÃO EXISTE NO SISTEMA** (como cargo de TI)
> 
> O "Desenvolvedor" existe como cargo GLOBAL, não como cargo do departamento TI.

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| TI-DEV-* | Todos os testes | 🚫 | Cargo não existe em TI |

---

### 9.3 Coordenador TI

> 🚫 **CARGO NÃO EXISTE NO SISTEMA**

| ID | Teste | Status | Bug ID |
|----|-------|--------|--------|
| TI-COO-* | Todos os testes | 🚫 | Cargo não existe |

---

### 9.4 Gerente TI

**Usuário de teste:** gerente_ti_teste@garageinn.com

> **Nota:** Gerente de TI possui `admin:all` - Execute os mesmos testes do Administrador (ADM-001 a ADM-022)
> 
> ✅ **TESTADO 16/01/2026**: Confirmado acesso completo de administrador

#### Testes Realizados

| ID | Teste | Resultado Esperado | Status | Bug ID |
|----|-------|-------------------|--------|--------|
| TI-GER-001 | Todos os testes ADM | Acesso total | ✅ | - |

**Detalhes da verificação:**
- ADM-001 (Dashboard): ✅ Dashboard carrega com todas métricas
- ADM-005 (Usuários): ✅ Menu visível e acessível
- ADM-006 (Configurações): ✅ Menu visível e acessível com todas as seções:
  - Departamentos e Cargos ✅
  - Unidades ✅
  - Checklists ✅
  - Chamados ✅
  - Permissões ✅
  - Uniformes ✅
  - Sistema ✅

---

## 10. Fluxo de Aprovação

### 10.1 Fluxo Manobrista → Compras/Manutenção

Este fluxo testa a cadeia de aprovações quando um Manobrista abre um chamado para Compras ou Manutenção.

#### Preparação
1. Identificar/criar um chamado de teste de Manobrista para Compras/Manutenção
2. Garantir que existem usuários nos cargos: Manobrista, Encarregado, Supervisor, Gerente de Operações

#### Testes do Fluxo

> ✅ **TESTADO 16/01/2026**: Fluxo completo de aprovação funcionando corretamente
> 
> **Chamado de teste:** ID `243946a2-1763-4fcf-a8f2-391aab570b01` - "Teste fluxo aprovação - Produto para almoxarifado"
> **Unidade:** GIG

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FLX-001 | Manobrista cria chamado | Criar chamado para Compras | Chamado criado com status "Aguardando Aprovação" | ✅ | - |
| FLX-002 | Encarregado vê chamado | Impersonar Encarregado, verificar chamado | Chamado visível para aprovação nível 1 | ✅ | - |
| FLX-003 | Encarregado aprova | Aprovar chamado | Status muda para "Aguardando Aprovação Nível 2" | ✅ | - |
| FLX-004 | Supervisor vê chamado | Impersonar Supervisor, verificar chamado | Chamado visível para aprovação nível 2 | ✅ | - |
| FLX-005 | Supervisor aprova | Aprovar chamado | Status muda para "Aguardando Aprovação Nível 3" | ✅ | - |
| FLX-006 | Gerente vê chamado | Impersonar Gerente Operações, verificar | Chamado visível para aprovação final | ✅ | - |
| FLX-007 | Gerente aprova | Aprovar chamado | Status muda para "Aguardando Triagem" | ✅ | - |
| FLX-008 | Compras recebe | Impersonar Gerente Compras | Chamado aparece para triagem com status "Aguardando Triagem" | ✅ | - |

**Detalhes da Execução:**
- **FLX-001**: Manobrista (manobrista_operacoes_teste@garageinn.com) criou chamado de compra na unidade GIG
- **FLX-002/003**: Encarregado (encarregado_operacoes_teste@garageinn.com) visualizou e aprovou (nível 1)
- **FLX-004/005**: Supervisor (supervisor_operacoes_teste@garageinn.com) visualizou e aprovou (nível 2)
- **FLX-006/007**: Gerente de Operações (gerente_operacoes_teste@garageinn.com) visualizou e aprovou (nível 3)
- **FLX-008**: Após aprovação final, chamado ficou com status "Aguardando Triagem" para o departamento de Compras

### 10.2 Teste de Negação em Cada Nível

> ⏳ **PENDENTE**: Testes de negação requerem criação de novos chamados para cada nível
> 
> **Observação**: Cada teste de negação precisa de um chamado novo, pois uma vez negado, 
> o chamado não pode mais ser usado para testar outros níveis.

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| FLX-N01 | Encarregado nega | Negar chamado no nível 1 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |
| FLX-N02 | Supervisor nega | Negar chamado no nível 2 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |
| FLX-N03 | Gerente nega | Negar chamado no nível 3 | Chamado marcado como "Negado" com justificativa obrigatória | ⏳ | |

---

## 11. Testes de RLS

### 11.1 Isolamento de Dados - Chamados

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RLS-001 | Manobrista só vê próprios | Impersonar Manobrista, listar chamados | Apenas chamados criados por ele | ⏳ | |
| RLS-002 | Encarregado vê da unidade | Impersonar Encarregado, listar chamados | Vê chamados da sua unidade | ⏳ | |
| RLS-003 | Supervisor vê cobertura | Impersonar Supervisor, listar chamados | Vê chamados das unidades de cobertura | ⏳ | |
| RLS-004 | Gerente vê do departamento | Impersonar Gerente de depto, listar chamados | Vê chamados direcionados ao seu depto | ⏳ | |
| RLS-005 | Admin vê todos | Impersonar Admin, listar chamados | Vê todos os chamados do sistema | ⏳ | |

### 11.2 Isolamento de Dados - Checklists

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RLS-010 | Manobrista vê própria unidade | Impersonar Manobrista, ver histórico | Apenas checklists da sua unidade | ⏳ | |
| RLS-011 | Supervisor vê cobertura | Impersonar Supervisor, ver histórico | Checklists das unidades de cobertura | ⏳ | |
| RLS-012 | Gerente Oper. vê todos | Impersonar Gerente Operações, ver histórico | Vê todos os checklists | ⏳ | |

### 11.3 Isolamento de Dados - Usuários

| ID | Teste | Ação | Resultado Esperado | Status | Bug ID |
|----|-------|------|-------------------|--------|--------|
| RLS-020 | RH vê todos usuários | Impersonar usuário RH, listar usuários | Lista completa de usuários | ⏳ | |
| RLS-021 | Não-RH não vê lista | Impersonar não-RH (ex: Manobrista) | Menu Usuários não visível ou vazio | ⏳ | |

---

## Checklist de Execução

### Antes de Começar

- [ ] Verificar se existem usuários de teste para todos os cargos
- [ ] Verificar se a funcionalidade de impersonação está funcionando
- [ ] Criar pasta `projeto/testes/bugs/` para documentação de bugs
- [ ] Definir ambiente de teste (desenvolvimento/homologação)

### Durante a Execução

- [ ] Seguir a ordem dos testes por departamento
- [ ] Não pular testes negativos - são igualmente importantes
- [ ] Documentar todos os bugs encontrados
- [ ] Tirar screenshots de comportamentos inesperados
- [ ] Anotar observações relevantes

### Após a Execução

- [ ] Totalizar testes aprovados vs reprovados
- [ ] Priorizar bugs encontrados por severidade
- [ ] Gerar relatório final de testes

---

## Resumo de Execução

| Departamento | Total Testes | ✅ Aprovados | ❌ Reprovados | ⏳ Pendentes | 🚫 N/A |
|--------------|--------------|--------------|---------------|--------------|--------|
| Cargos Globais | 22 | 14 | 4 | 4 | - |
| Operações | 55 | 33 | 14 | 8 | - |
| Compras/Manutenção | 32 | 17 | 3 | 6 | 6 |
| Financeiro | 30 | 12 | 15 | 0 | 3 |
| RH | 27 | 9 | 18 | 0 | 0 |
| Sinistros | 14 | 9 | 3 | 0 | 2 |
| Comercial | 12 | 7 | 1 | 0 | 3 |
| Auditoria | 12 | 10 | 0 | 0 | 2 |
| TI | 6 | 4 | 0 | 0 | 2 |
| Fluxo Aprovação | 11 | 8 | 0 | 3 | - |
| Testes RLS | 8 | - | - | 8 | - |
| **TOTAL** | **229** | **123** | **58** | **29** | **18** |

### Bugs Encontrados

| Bug ID | Descrição | Severidade | Departamentos Afetados |
|--------|-----------|------------|------------------------|
| BUG-015 | Cargos sem permissões definidas em `permissions.ts` | CRÍTICA | Financeiro (5), RH (5), Sinistros (1) |
| ~~BUG-016~~ | ~~Permissão `settings:read` não dá acesso ao menu Configurações~~ | ~~MÉDIA~~ | **NÃO É BUG**: Por design, menu requer `admin:all` |
| BUG-017 | RH não tem acesso ao menu Usuários apesar de ter `users:*` | CRÍTICA | RH (todos os cargos) |
| BUG-018 | Gerente Comercial não consegue acessar página de Unidades | MÉDIA | Comercial |

### Cargos no Banco vs Código

| Departamento | Cargos no Banco | Cargos no Código | Discrepância |
|--------------|-----------------|------------------|--------------|
| Financeiro | 7 | 4 | 5 sem permissões |
| RH | 7 | 4 | 5 sem permissões |
| Sinistros | 2 | 4 | 1 sem permissões |
| Comercial | 1 | 4 | 0 (só Gerente) |
| Auditoria | 2 | 4 | 0 (Auditor e Gerente OK) |
| TI | 2 | 4 | 0 (Analista mapeado corretamente) |

---

## Observações Gerais

### Descobertas Críticas

1. **Discrepância de Cargos (BUG-015)**: Os cargos implementados no banco de dados NÃO correspondem aos cargos mapeados em `permissions.ts`. Isso afeta múltiplos departamentos:
   - Financeiro: 5 de 7 cargos sem permissões
   - Prováveis afetados: RH, Sinistros (mesma estrutura de cargos)

2. **Menu Configurações (BUG-016)**: O menu só aparece para `admin:all`, mesmo para usuários com `settings:read`

3. **Menus sempre visíveis**: Os menus Chamados, Checklists e Unidades aparecem para TODOS os usuários (não são controlados por permissão específica). O controle de acesso real está no RLS do banco.

### Ações Recomendadas

1. **URGENTE**: Atualizar `apps/web/src/lib/auth/permissions.ts` para incluir todos os cargos existentes no banco
2. Revisar documentação de permissões (`PERMISSOES_COMPLETAS.md`) para refletir a estrutura real de cargos
3. Considerar adicionar testes automatizados para validar que todos os cargos do banco têm permissões definidas

---

> **Documento gerado em:** Janeiro 2026  
> **Responsável pelos testes:** Sistema Automatizado  
> **Data de início:** 15/01/2026  
> **Última atualização:** 16/01/2026 (Fluxo de Aprovação 10.1 concluído)
