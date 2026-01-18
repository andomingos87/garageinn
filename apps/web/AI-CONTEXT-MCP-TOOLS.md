# AI-Context MCP Tools

Documentação completa das ferramentas disponíveis no MCP Server **ai-context**. Este servidor fornece capacidades avançadas para análise de código, gerenciamento de contexto para LLMs e orquestração de workflows de desenvolvimento.

---

## Índice

1. [Ferramentas de Análise de Código](#ferramentas-de-análise-de-código)
2. [Ferramentas de Scaffolding](#ferramentas-de-scaffolding)
3. [Ferramentas de Workflow PREVC](#ferramentas-de-workflow-prevc)
4. [Ferramentas de Planos](#ferramentas-de-planos)
5. [Ferramentas de Agentes](#ferramentas-de-agentes)
6. [Ferramentas de Skills](#ferramentas-de-skills)
7. [Ferramentas de Projeto](#ferramentas-de-projeto)

---

## Ferramentas de Análise de Código

### `readFile`

**O que faz:** Lê o conteúdo de um arquivo do sistema de arquivos.

**Parâmetros:**
- `filePath` (obrigatório): Caminho absoluto ou relativo do arquivo
- `encoding` (opcional): Codificação do arquivo (`utf-8`, `ascii`, `binary`). Padrão: `utf-8`

**Quando usar:**
- Quando precisar analisar o conteúdo de um arquivo específico
- Para verificar implementações existentes antes de fazer alterações
- Para entender a estrutura de arquivos de configuração

**Exemplo de uso:**
```
Ler o arquivo package.json para verificar dependências
```

---

### `listFiles`

**O que faz:** Lista arquivos que correspondem a um padrão glob no repositório.

**Parâmetros:**
- `pattern` (obrigatório): Padrão glob para corresponder arquivos (ex: `**/*.ts`)
- `cwd` (opcional): Diretório de trabalho para o padrão
- `ignore` (opcional): Padrões para ignorar

**Quando usar:**
- Para encontrar todos os arquivos de um tipo específico
- Para descobrir a estrutura de módulos ou componentes
- Para identificar arquivos que precisam de refatoração

**Exemplo de uso:**
```
Listar todos os arquivos TypeScript em src/components/
```

---

### `analyzeSymbols`

**O que faz:** Analisa símbolos em um arquivo fonte (classes, funções, interfaces, tipos, enums).

**Parâmetros:**
- `filePath` (obrigatório): Caminho do arquivo a analisar
- `symbolTypes` (opcional): Tipos de símbolos a extrair (`class`, `interface`, `function`, `type`, `enum`)

**Quando usar:**
- Para entender a API pública de um módulo
- Para identificar classes e interfaces disponíveis
- Para mapear funções exportadas de um arquivo
- Durante refatorações para entender dependências

**Exemplo de uso:**
```
Analisar src/lib/auth/rbac.ts para encontrar todas as funções exportadas
```

---

### `getFileStructure`

**O que faz:** Obtém a estrutura de diretórios e listagem de arquivos de um repositório.

**Parâmetros:**
- `rootPath` (obrigatório): Caminho raiz do repositório
- `maxDepth` (opcional): Profundidade máxima de diretórios. Padrão: 3
- `includePatterns` (opcional): Padrões para incluir

**Quando usar:**
- Para obter uma visão geral da estrutura do projeto
- Ao iniciar trabalho em um novo repositório
- Para documentar a arquitetura de pastas

**Exemplo de uso:**
```
Obter estrutura de src/ com profundidade 4
```

---

### `searchCode`

**O que faz:** Busca padrões de código em arquivos usando regex.

**Parâmetros:**
- `pattern` (obrigatório): Padrão regex para buscar
- `cwd` (opcional): Diretório de trabalho
- `fileGlob` (opcional): Padrão glob para filtrar arquivos
- `maxResults` (opcional): Número máximo de resultados. Padrão: 50

**Quando usar:**
- Para encontrar todas as ocorrências de um padrão
- Para identificar uso de APIs específicas
- Para encontrar imports ou dependências
- Durante auditorias de código

**Exemplo de uso:**
```
Buscar todas as chamadas de createClient() em arquivos .ts
```

---

### `buildSemanticContext`

**O que faz:** Constrói contexto semântico otimizado para prompts de LLM. Pré-analisa o codebase e retorna contexto formatado.

**Parâmetros:**
- `repoPath` (obrigatório): Caminho do repositório
- `contextType` (opcional): Tipo de contexto (`documentation`, `playbook`, `plan`, `compact`). Padrão: `compact`
- `targetFile` (opcional): Arquivo alvo para contexto focado
- `options` (opcional):
  - `includeDocumentation`: Incluir documentação
  - `includeSignatures`: Incluir assinaturas
  - `maxContextLength`: Tamanho máximo do contexto
  - `useLSP`: Usar Language Server Protocol

**Quando usar:**
- Para gerar contexto rico para consultas de LLM
- Ao preparar documentação automática
- Para análise profunda do codebase
- Antes de iniciar tarefas complexas de desenvolvimento

**Exemplo de uso:**
```
Construir contexto semântico compacto para o repositório atual
```

---

### `getCodebaseMap`

**O que faz:** Obtém dados do mapa do codebase de `.context/docs/codebase-map.json`.

**Parâmetros:**
- `repoPath` (opcional): Caminho do repositório
- `section` (opcional): Seção específica a recuperar:
  - `all`: Mapa completo (padrão)
  - `stack`: Informações de stack tecnológico
  - `structure`: Contagem de arquivos, diretórios top
  - `architecture`: Camadas detectadas, padrões, entry points
  - `symbols`: Todas as categorias de símbolos
  - `symbols.classes`, `symbols.interfaces`, etc.: Categoria específica
  - `publicAPI`: Símbolos de API pública exportados
  - `dependencies`: Arquivos mais importados
  - `stats`: Estatísticas de análise

**Quando usar:**
- Para obter visão geral rápida da stack tecnológica
- Para entender a arquitetura do projeto
- Para identificar os arquivos mais importantes
- Para reduzir uso de tokens (usando seções específicas)

**Exemplo de uso:**
```
Obter apenas a seção "architecture" do codebase map
```

---

### `detectStack`

**O que faz:** Detecta a stack tecnológica do projeto incluindo linguagens, frameworks, ferramentas de build e frameworks de teste.

**Parâmetros:** Nenhum

**Quando usar:**
- Ao iniciar trabalho em um novo projeto
- Para configurar defaults inteligentes
- Para gerar documentação de stack
- Para recomendar ferramentas compatíveis

**Exemplo de uso:**
```
Detectar automaticamente a stack do projeto atual
```

---

## Ferramentas de Scaffolding

### `checkScaffolding`

**O que faz:** Verifica se o scaffolding `.context` existe e retorna status granular.

**Parâmetros:**
- `repoPath` (opcional): Caminho do repositório a verificar

**Quando usar:**
- Antes de inicializar novo scaffolding
- Para verificar estado do contexto existente
- Para diagnosticar problemas de configuração

**Exemplo de uso:**
```
Verificar se .context já existe no projeto
```

---

### `initializeContext`

**O que faz:** Inicializa o scaffolding `.context` e cria arquivos template.

**Parâmetros:**
- `repoPath` (obrigatório): Caminho do repositório
- `type` (opcional): Tipo de scaffolding (`docs`, `agents`, `both`). Padrão: `both`
- `semantic` (opcional): Habilitar análise semântica. Padrão: `true`
- `autoFill` (opcional): Preencher automaticamente com conteúdo codebase-aware. Padrão: `true`
- `include` (opcional): Padrões para incluir
- `exclude` (opcional): Padrões para excluir
- `outputDir` (opcional): Diretório de saída. Padrão: `./.context`

**Quando usar:**
- Ao configurar um novo projeto para trabalho com AI
- Para criar estrutura de documentação padronizada
- Para habilitar orquestração de agentes

**IMPORTANTE:** Após a inicialização, você DEVE preencher os arquivos gerados com conteúdo de qualidade usando `fillScaffolding` ou `fillSingleFile`.

**Exemplo de uso:**
```
Inicializar .context com docs e agents, análise semântica habilitada
```

---

### `fillScaffolding`

**O que faz:** Analisa o codebase e gera conteúdo preenchido para templates de scaffolding.

**Parâmetros:**
- `repoPath` (obrigatório): Caminho do repositório
- `target` (opcional): Qual scaffolding preencher (`docs`, `agents`, `plans`, `all`). Padrão: `all`
- `outputDir` (opcional): Diretório do scaffold. Padrão: `./.context`
- `offset` (opcional): Pular N primeiros arquivos (paginação)
- `limit` (opcional): Máximo de arquivos a retornar. Padrão: 3

**Quando usar:**
- Após `initializeContext` para preencher templates
- Para atualizar documentação existente
- Para regenerar contexto após mudanças significativas

**Exemplo de uso:**
```
Preencher todos os arquivos de scaffolding com análise do codebase
```

---

### `listFilesToFill`

**O que faz:** Lista arquivos de scaffold que precisam ser preenchidos. Retorna apenas caminhos (sem conteúdo).

**Parâmetros:**
- `repoPath` (obrigatório): Caminho do repositório
- `target` (opcional): Qual scaffolding listar (`docs`, `agents`, `plans`, `all`). Padrão: `all`
- `outputDir` (opcional): Diretório do scaffold. Padrão: `./.context`

**Quando usar:**
- Antes de chamar `fillSingleFile` para obter lista de arquivos
- Para projetos grandes onde `fillScaffolding` excede limites
- Para processamento mais eficiente arquivo por arquivo

**Exemplo de uso:**
```
Listar todos os arquivos de docs que precisam preenchimento
```

---

### `fillSingleFile`

**O que faz:** Gera conteúdo sugerido para um único arquivo de scaffold.

**Parâmetros:**
- `repoPath` (obrigatório): Caminho do repositório
- `filePath` (obrigatório): Caminho absoluto do arquivo de scaffold

**Quando usar:**
- Após `listFilesToFill` para processar cada arquivo
- Para evitar limites de tamanho de saída
- Para processamento incremental de documentação

**Exemplo de uso:**
```
Preencher apenas .context/docs/architecture.md
```

---

### `scaffoldPlan`

**O que faz:** Cria um template de plano em `.context/plans/`.

**Parâmetros:**
- `planName` (obrigatório): Nome do plano (será slugificado)
- `repoPath` (opcional): Caminho do repositório
- `title` (opcional): Título do plano
- `summary` (opcional): Resumo/objetivo do plano
- `semantic` (opcional): Habilitar análise semântica. Padrão: `true`
- `autoFill` (opcional): Preencher automaticamente. Padrão: `true`
- `outputDir` (opcional): Diretório de saída

**Quando usar:**
- Para criar planos de implementação de features
- Para documentar estratégias de refatoração
- Para planejar migrações ou upgrades

**Exemplo de uso:**
```
Criar plano "implementar-autenticacao-2fa" com resumo detalhado
```

---

### `exportRules`

**O que faz:** Exporta regras de contexto para diretórios de ferramentas AI (Cursor, Claude, GitHub Copilot, Windsurf, Cline, Aider, Codex).

**Parâmetros:**
- `preset` (opcional): Ferramenta alvo ou `all`. Padrão: `all`
- `dryRun` (opcional): Visualizar mudanças sem escrever
- `force` (opcional): Sobrescrever arquivos existentes

**Quando usar:**
- Para sincronizar regras entre diferentes ferramentas AI
- Após atualizar documentação de contexto
- Para padronizar configuração em equipes

**Exemplo de uso:**
```
Exportar regras para Claude e Cursor
```

---

## Ferramentas de Workflow PREVC

O **PREVC** é um framework de workflow com 5 fases:
- **P** (Planejamento): Definição de requisitos e arquitetura
- **R** (Revisão): Revisão de design e código
- **E** (Execução): Implementação de código
- **V** (Validação): Testes e QA
- **C** (Confirmação): Deploy e documentação final

### `workflowInit`

**O que faz:** Inicializa um workflow PREVC com detecção automática de escala.

**Parâmetros:**
- `name` (obrigatório): Nome do projeto/feature
- `description` (opcional): Descrição para detecção de escala
- `scale` (opcional): Escala do projeto (`QUICK`, `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE`)

**Quando usar:**
- Ao iniciar uma nova feature ou projeto
- Para estruturar trabalho complexo em fases
- Para habilitar tracking de progresso

**Exemplo de uso:**
```
Inicializar workflow "Sistema de Notificações" com detecção automática de escala
```

---

### `workflowStatus`

**O que faz:** Obtém o status atual do workflow PREVC incluindo fases, roles e progresso.

**Parâmetros:** Nenhum

**Quando usar:**
- Para verificar progresso do workflow atual
- Para identificar próximos passos
- Para gerar relatórios de status

**Exemplo de uso:**
```
Verificar em qual fase do PREVC estamos
```

---

### `workflowAdvance`

**O que faz:** Completa a fase atual e avança para a próxima fase no workflow PREVC.

**Parâmetros:**
- `outputs` (opcional): Lista de caminhos de artefatos gerados na fase atual

**Quando usar:**
- Quando uma fase está completa
- Para registrar artefatos produzidos
- Para avançar formalmente no workflow

**Exemplo de uso:**
```
Avançar de Planejamento para Revisão com artefatos do PRD
```

---

### `workflowHandoff`

**O que faz:** Realiza handoff de um role para outro dentro do workflow PREVC.

**Parâmetros:**
- `from` (obrigatório): Role que está passando o trabalho
- `to` (obrigatório): Role que está recebendo
- `artifacts` (obrigatório): Artefatos sendo transferidos

**Roles disponíveis:** `planner`, `designer`, `architect`, `developer`, `qa`, `reviewer`, `documenter`, `solo-dev`

**Quando usar:**
- Para transições formais entre responsabilidades
- Para documentar contexto de handoff
- Em projetos com múltiplos papéis

**Exemplo de uso:**
```
Handoff de architect para developer com artefatos de design
```

---

### `workflowCollaborate`

**O que faz:** Inicia uma sessão de colaboração multi-role para decisões complexas ou brainstorming.

**Parâmetros:**
- `topic` (obrigatório): Tópico da sessão de colaboração
- `participants` (opcional): Roles participantes (auto-selecionados se não fornecido)

**Quando usar:**
- Para decisões arquiteturais importantes
- Para resolução de trade-offs técnicos
- Para brainstorming de soluções

**Exemplo de uso:**
```
Colaboração sobre "Escolha de estratégia de cache" com architect e developer
```

---

### `workflowCreateDoc`

**O que faz:** Cria um template de documento para a fase atual do workflow PREVC.

**Parâmetros:**
- `type` (obrigatório): Tipo de documento (`prd`, `tech-spec`, `architecture`, `adr`, `test-plan`, `changelog`)
- `name` (obrigatório): Nome/título do documento

**Quando usar:**
- Para criar documentação estruturada
- Para seguir padrões de documentação
- Para registrar decisões (ADRs)

**Exemplo de uso:**
```
Criar tech-spec para "API de Integração com Pagamentos"
```

---

## Ferramentas de Planos

### `linkPlan`

**O que faz:** Vincula um plano de implementação ao workflow PREVC atual.

**Parâmetros:**
- `planSlug` (obrigatório): Slug/identificador do plano (nome do arquivo sem .md)

**Quando usar:**
- Para associar planos ao workflow ativo
- Para tracking integrado de progresso
- Para coordenar múltiplos planos

**Exemplo de uso:**
```
Vincular plano "implementar-2fa" ao workflow atual
```

---

### `getLinkedPlans`

**O que faz:** Obtém todos os planos de implementação vinculados ao workflow PREVC atual.

**Parâmetros:** Nenhum

**Quando usar:**
- Para ver planos associados ao workflow
- Para verificar progresso geral
- Para coordenar trabalho entre planos

**Exemplo de uso:**
```
Listar todos os planos vinculados ao workflow atual
```

---

### `getPlanDetails`

**O que faz:** Obtém informações detalhadas de um plano incluindo fases mapeadas ao PREVC, agentes e documentação.

**Parâmetros:**
- `planSlug` (obrigatório): Slug/identificador do plano

**Quando usar:**
- Para entender detalhes de um plano
- Para ver mapeamento PREVC
- Para identificar agentes recomendados

**Exemplo de uso:**
```
Obter detalhes do plano "migrar-para-typescript"
```

---

### `getPlansForPhase`

**O que faz:** Obtém todos os planos que têm itens de trabalho para uma fase PREVC específica.

**Parâmetros:**
- `phase` (obrigatório): Fase PREVC (`P`, `R`, `E`, `V`, `C`)

**Quando usar:**
- Para ver trabalho pendente em uma fase
- Para priorizar entre planos
- Para planejamento de sprint

**Exemplo de uso:**
```
Ver todos os planos com trabalho na fase de Execução (E)
```

---

### `updatePlanPhase`

**O que faz:** Atualiza o status de uma fase do plano (sincroniza com tracking do workflow PREVC).

**Parâmetros:**
- `planSlug` (obrigatório): Slug/identificador do plano
- `phaseId` (obrigatório): ID da fase no plano (ex: `phase-1`)
- `status` (obrigatório): Novo status (`pending`, `in_progress`, `completed`, `skipped`)

**Quando usar:**
- Para marcar progresso em fases
- Para sincronizar com workflow PREVC
- Para tracking de execução

**Exemplo de uso:**
```
Marcar phase-2 do plano "refatorar-auth" como completed
```

---

### `recordDecision`

**O que faz:** Registra uma decisão tomada durante execução de plano. Decisões são rastreadas e podem ser referenciadas depois.

**Parâmetros:**
- `planSlug` (obrigatório): Slug/identificador do plano
- `title` (obrigatório): Título da decisão
- `description` (obrigatório): Descrição e racional da decisão
- `phase` (opcional): Fase PREVC relacionada
- `alternatives` (opcional): Alternativas que foram consideradas

**Quando usar:**
- Para documentar decisões técnicas importantes
- Para registrar trade-offs escolhidos
- Para criar histórico de decisões (ADR-like)

**Exemplo de uso:**
```
Registrar decisão "Usar Redis para cache" com alternativas consideradas
```

---

## Ferramentas de Agentes

### `discoverAgents`

**O que faz:** Descobre todos os agentes disponíveis incluindo customizados. Escaneia `.context/agents/` para playbooks de agentes customizados.

**Parâmetros:** Nenhum

**Quando usar:**
- Para ver agentes disponíveis no projeto
- Para descobrir agentes customizados
- Para planejar orquestração de agentes

**Exemplo de uso:**
```
Listar todos os agentes disponíveis (built-in e custom)
```

---

### `getAgentInfo`

**O que faz:** Obtém informações detalhadas sobre um agente específico (built-in ou custom).

**Parâmetros:**
- `agentType` (obrigatório): Tipo/identificador do agente (ex: `code-reviewer`, `bug-fixer`)

**Quando usar:**
- Para entender capacidades de um agente
- Para verificar se agente existe
- Para obter path e descrição

**Exemplo de uso:**
```
Obter informações do agente "security-auditor"
```

---

### `listAgentTypes`

**O que faz:** Lista todos os tipos de agentes disponíveis com suas descrições.

**Parâmetros:** Nenhum

**Quando usar:**
- Para visão geral rápida de agentes
- Para escolher agente apropriado
- Para documentação

**Exemplo de uso:**
```
Listar tipos de agentes com descrições
```

---

### `orchestrateAgents`

**O que faz:** Seleciona agentes apropriados baseado em descrição de tarefa, fase PREVC ou role.

**Parâmetros:**
- `task` (opcional): Descrição da tarefa para seleção inteligente
- `phase` (opcional): Fase PREVC para obter agentes
- `role` (opcional): Role PREVC para obter agentes

**Quando usar:**
- Para recomendação automática de agentes
- Para tarefas complexas com múltiplos agentes
- Para integração com workflow PREVC

**Exemplo de uso:**
```
Orquestrar agentes para tarefa "Implementar autenticação OAuth"
```

---

### `getAgentSequence`

**O que faz:** Obtém sequência recomendada de agentes para uma tarefa, incluindo ordem de handoff.

**Parâmetros:**
- `task` (obrigatório): Descrição da tarefa
- `phases` (opcional): Fases PREVC a incluir
- `includeReview` (opcional): Incluir code review na sequência. Padrão: `true`

**Quando usar:**
- Para planejar fluxos multi-agente
- Para entender ordem de execução ideal
- Para workflows automatizados

**Exemplo de uso:**
```
Obter sequência de agentes para "Criar novo endpoint REST"
```

---

### `getAgentDocs`

**O que faz:** Obtém guias de documentação relevantes para um tipo de agente específico.

**Parâmetros:**
- `agent` (obrigatório): Tipo de agente

**Agentes disponíveis:** `code-reviewer`, `bug-fixer`, `feature-developer`, `refactoring-specialist`, `test-writer`, `documentation-writer`, `performance-optimizer`, `security-auditor`, `backend-specialist`, `frontend-specialist`, `architect-specialist`, `devops-specialist`, `database-specialist`, `mobile-specialist`

**Quando usar:**
- Para fornecer contexto adequado a um agente
- Para entender documentação relevante
- Para preparar tarefas de agentes

**Exemplo de uso:**
```
Obter documentação relevante para "frontend-specialist"
```

---

### `getPhaseDocs`

**O que faz:** Obtém documentação relevante para uma fase do workflow PREVC.

**Parâmetros:**
- `phase` (obrigatório): Fase PREVC (`P`, `R`, `E`, `V`, `C`)

**Quando usar:**
- Para entender documentação necessária em cada fase
- Para preparar artefatos de fase
- Para guiar trabalho de documentação

**Exemplo de uso:**
```
Obter documentação relevante para fase de Validação (V)
```

---

## Ferramentas de Skills

Skills são "expertise sob demanda" para tarefas específicas - como extensões de capacidade que podem ser invocadas quando necessário.

### `listSkills`

**O que faz:** Lista todas as skills disponíveis (built-in + custom).

**Parâmetros:**
- `includeContent` (opcional): Incluir conteúdo completo das skills

**Quando usar:**
- Para descobrir skills disponíveis
- Para documentação de capacidades
- Para planejamento de tarefas

**Exemplo de uso:**
```
Listar todas as skills com seus slugs e descrições
```

---

### `getSkillContent`

**O que faz:** Obtém o conteúdo completo de uma skill pelo slug.

**Parâmetros:**
- `skillSlug` (obrigatório): Slug/identificador da skill (ex: `commit-message`, `pr-review`)

**Quando usar:**
- Para obter instruções detalhadas de uma skill
- Para executar uma skill específica
- Para customizar comportamento

**Exemplo de uso:**
```
Obter conteúdo da skill "code-review"
```

---

### `getSkillsForPhase`

**O que faz:** Obtém todas as skills relevantes para uma fase PREVC específica.

**Parâmetros:**
- `phase` (obrigatório): Fase PREVC (`P`, `R`, `E`, `V`, `C`)

**Quando usar:**
- Para saber quais skills ativar em cada fase
- Para planejamento de workflow
- Para automação de tarefas

**Exemplo de uso:**
```
Obter skills para fase de Revisão (R)
```

---

### `scaffoldSkills`

**O que faz:** Cria arquivos de skills em `.context/skills/`. Cria arquivos SKILL.md para skills built-in ou customizadas.

**Parâmetros:**
- `skills` (opcional): Skills específicas para criar scaffold (padrão: todas built-in)
- `force` (opcional): Sobrescrever arquivos existentes

**Quando usar:**
- Para customizar skills do projeto
- Para criar skills próprias
- Para documentar expertise específica

**Exemplo de uso:**
```
Criar scaffold para skills de commit-message e pr-review
```

---

### `exportSkills`

**O que faz:** Exporta skills para diretórios de ferramentas AI (Claude Code, Gemini CLI, Codex).

**Parâmetros:**
- `preset` (opcional): Ferramenta alvo ou `all`. Padrão: `all`
- `force` (opcional): Sobrescrever arquivos existentes
- `includeBuiltIn` (opcional): Incluir skills built-in mesmo se não scaffolded

**Quando usar:**
- Para sincronizar skills entre ferramentas
- Para compartilhar skills com equipe
- Para padronização de workflow

**Exemplo de uso:**
```
Exportar skills para Claude Code
```

---

### `fillSkills`

**O que faz:** Preenche/personaliza arquivos de skills com conteúdo codebase-aware.

**Parâmetros:**
- `skills` (opcional): Skills específicas para preencher
- `force` (opcional): Incluir skills já preenchidas

**Quando usar:**
- Após scaffold para personalizar skills
- Para atualizar skills com contexto do projeto
- Para adaptar skills genéricas

**Exemplo de uso:**
```
Preencher skills scaffolded com contexto do repositório
```

---

## Ferramentas de Projeto

### `projectStart`

**O que faz:** Inicia um novo projeto com setup unificado: scaffolding + preenchimento de contexto + inicialização de workflow. Suporta templates de workflow.

**Parâmetros:**
- `featureName` (obrigatório): Nome da feature/projeto
- `template` (opcional): Template de workflow (`hotfix`, `feature`, `mvp`, `auto`). Padrão: `auto`
- `skipFill` (opcional): Pular preenchimento de contexto AI
- `skipWorkflow` (opcional): Pular inicialização de workflow

**Templates:**
- `hotfix`: Para correções rápidas
- `feature`: Para features padrão
- `mvp`: Para projetos completos

**Quando usar:**
- Ao iniciar qualquer nova feature ou projeto
- Para setup consistente e padronizado
- Para habilitar todas as capacidades de uma vez

**Exemplo de uso:**
```
Iniciar projeto "Sistema de Pagamentos" com template mvp
```

---

### `projectReport`

**O que faz:** Gera um relatório visual de progresso para o workflow PREVC atual. Mostra fases, roles, deliverables e dashboard visual.

**Parâmetros:**
- `format` (opcional): Formato de saída (`json`, `markdown`, `dashboard`). Padrão: `dashboard`
- `includeStack` (opcional): Incluir informações de stack tecnológico

**Quando usar:**
- Para status reports de progresso
- Para comunicação com stakeholders
- Para visão geral de projeto
- Para documentação de conclusão

**Exemplo de uso:**
```
Gerar relatório dashboard com informações de stack
```

---

## Resumo de Uso por Cenário

### Iniciando um Novo Projeto
1. `projectStart` - Setup completo unificado
2. `detectStack` - Identificar tecnologias
3. `workflowInit` - Iniciar workflow PREVC

### Entendendo um Codebase Existente
1. `getFileStructure` - Estrutura de pastas
2. `getCodebaseMap` - Mapa semântico
3. `buildSemanticContext` - Contexto para LLM
4. `analyzeSymbols` - Símbolos de arquivos específicos

### Implementando uma Feature
1. `workflowInit` - Iniciar workflow
2. `scaffoldPlan` - Criar plano de implementação
3. `orchestrateAgents` - Selecionar agentes
4. `getAgentSequence` - Definir sequência
5. `workflowAdvance` - Avançar fases

### Documentando o Projeto
1. `checkScaffolding` - Verificar estado
2. `initializeContext` - Criar estrutura
3. `fillScaffolding` - Preencher templates
4. `exportRules` - Exportar para ferramentas AI

### Realizando Code Review
1. `getSkillContent("code-review")` - Obter instruções
2. `searchCode` - Buscar padrões
3. `analyzeSymbols` - Analisar estrutura
4. `recordDecision` - Registrar decisões

---

## Referências

- **Documentação do Projeto**: `.context/docs/`
- **Playbooks de Agentes**: `.context/agents/`
- **Planos**: `.context/plans/`
- **Skills**: `.context/skills/`
