---
alwaysApply: true
---

# Execução de Planos (Features e Bug Fixes)

## Contexto

Quando implementar ou executar um plano (feature ou bug fix), siga rigorosamente este workflow para garantir qualidade, rastreabilidade e validação adequada das entregas.

## Workflow Obrigatório

### 1. Leitura e Compreensão do Plano

**Antes de iniciar qualquer implementação:**

- ✅ Ler o plano completo para entender o contexto, objetivos e critérios de aceite
- ✅ Identificar todas as referências mencionadas (bugs, PRD, documentação relacionada)
- ✅ Verificar dependências e pré-requisitos
- ✅ Entender o escopo completo da tarefa (não apenas a primeira subtarefa)

**O que verificar no plano:**
- Seção "Task Snapshot" ou equivalente (objetivo principal, sinal de sucesso)
- Referências a bugs, testes ou documentação relacionada
- Estrutura de fases/tarefas e ordem de execução
- Critérios de aceite explícitos ou implícitos
- Agentes recomendados e documentação relacionada

### 2. Execução das Tarefas

**Durante a implementação:**

- ✅ Seguir a ordem de execução definida no plano
- ✅ Implementar uma tarefa por vez, validando antes de avançar
- ✅ Respeitar padrões de código do projeto (ver `AGENTS.md`)
- ✅ Usar ferramentas apropriadas (Supabase MCP para DB, Context7 para documentação)
- ✅ Documentar decisões importantes ou mudanças de escopo

**Boas práticas:**
- Não pular etapas mesmo que pareçam simples
- Manter commits atômicos e descritivos (Conventional Commits)
- Não fazer múltiplas mudanças não relacionadas no mesmo commit

### 3. Validação e Testes

**Após cada tarefa ou conjunto de tarefas relacionadas:**

- ✅ **Testes automatizados**: Executar testes unitários, de integração ou E2E relevantes
- ✅ **Testes E2E**: Usar Playwright MCP para validação visual e de fluxo (ver `.context/docs/e2e-testing-playwright-mcp.md`)
- ✅ **Testes visuais**: Para mudanças de UI, validar visualmente usando Playwright MCP
- ✅ **Validação manual**: Quando necessário, testar cenários específicos manualmente
- ✅ **Verificação de critérios de aceite**: Confirmar que todos os critérios do plano foram atendidos

**Tipos de validação por contexto:**

| Contexto | Validação Necessária |
|----------|---------------------|
| Bug fix | Teste E2E específico do bug + validação visual |
| Feature nova | Testes E2E do fluxo completo + testes unitários |
| Mudança de permissões | Testes de RBAC + validação com diferentes roles |
| Mudança de UI | Teste visual com Playwright MCP + acessibilidade |
| Mudança de banco | Validação de RLS + testes de integração |

**Regra crítica:** 
> ⚠️ **Nunca marque uma tarefa como concluída sem validar que os critérios de aceite foram atendidos.**

### 4. Atualização de Documentação

**Após validar as tarefas:**

- ✅ Atualizar status do plano (marcar tarefas como concluídas)
- ✅ Atualizar documentação de bugs (se aplicável) em `projeto/testes/bugs/`
- ✅ Atualizar `TESTES_PENDENTES_E_FALHAS.md` se houver testes relacionados
- ✅ Atualizar documentação técnica em `.context/docs/` se houver mudanças arquiteturais
- ✅ Atualizar `PRD.md` se houver mudanças de requisitos ou funcionalidades

**Checklist de documentação:**
- [ ] Plano atualizado com status das tarefas
- [ ] Bug report atualizado (se bug fix) com status "resolvido" e data
- [ ] Testes relacionados atualizados ou criados
- [ ] Documentação técnica atualizada (se necessário)
- [ ] PRD atualizado (se mudança de requisito)

### 5. Commit e Finalização

**Antes de fazer commit:**

- ✅ Revisar todas as mudanças (`git diff`)
- ✅ Garantir que não há código comentado ou temporário
- ✅ Verificar que linter passa (`npm run lint`)
- ✅ Confirmar que testes passam (se aplicável)

**Formato de commit (Conventional Commits):**

```bash
# Para bug fixes
fix(module): descrição curta do bug

# Para features
feat(module): descrição curta da feature

# Para documentação
docs(scope): atualização de documentação
```

**Mensagem de commit deve incluir:**
- Referência ao plano (ex: `[plan: fix-bug-014]`)
- Referência ao bug/issue se aplicável (ex: `[BUG-014]`)
- Descrição clara do que foi implementado

**Exemplo:**
```bash
git commit -m "fix(tickets): permitir gerente fechar chamados [plan: fix-bug-014] [BUG-014]

- Adicionada permissão 'tickets:close' para role Gerente
- Atualizado componente de detalhes do chamado
- Testes E2E adicionados e validados
- Documentação atualizada"
```

## Exceções e Casos Especiais

### Plano Incompleto ou Ambíguo
Se o plano não tiver informações suficientes:
1. Consultar documentação relacionada (PRD, bugs, testes)
2. Usar Context7 MCP para buscar boas práticas
3. Documentar decisões tomadas
4. Atualizar o plano com as informações encontradas

### Tarefa Bloqueada por Dependência
Se uma tarefa não puder ser executada:
1. Documentar a dependência no plano
2. Avançar para tarefas que não dependem dela
3. Retornar quando a dependência for resolvida

### Critérios de Aceite Implícitos
Se não houver critérios explícitos:
1. Inferir critérios baseados no objetivo do plano
2. Validar com testes que cobrem o objetivo principal
3. Documentar os critérios inferidos no plano

## Checklist Resumido

Antes de considerar um plano como concluído:

- [ ] Plano lido e compreendido completamente
- [ ] Todas as tarefas executadas na ordem correta
- [ ] Testes automatizados/E2E executados e passando
- [ ] Validação visual realizada (quando aplicável)
- [ ] Critérios de aceite atendidos
- [ ] Documentação atualizada (plano, bugs, testes, PRD)
- [ ] Commit feito com mensagem descritiva e referências
- [ ] Código revisado e linter passando

## Referências

- [AGENTS.md](../../AGENTS.md) - Padrões do projeto e ferramentas
- [E2E Testing Guide](../../.context/docs/e2e-testing-playwright-mcp.md) - Guia de testes E2E
- [Conventional Commits](https://www.conventionalcommits.org/) - Padrão de commits
- [Supabase MCP Rules](../supabase-mcp/RULE.md) - Regras para operações de banco
