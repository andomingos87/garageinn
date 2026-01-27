# MCP ai-context tools (versao amigavel)

Resumo legivel das tools do MCP `user-ai-context`. Esta versao prioriza clareza e organiza a informacao por tool.

## agent
**O que faz:** Orquestracao e descoberta de agentes.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `discover` | Descobre todos os agentes (built-in + custom). | - |
| `getInfo` | Retorna detalhes de um agente. | `agentType` |
| `orchestrate` | Seleciona agentes por tarefa/fase/papel. | `task`, `phase`, `role` |
| `getSequence` | Sequencia de handoff entre agentes. | `task`, `includeReview`, `phases` |
| `getDocs` | Documentacao de um agente. | `agent` |
| `getPhaseDocs` | Documentacao de uma fase PREVC. | `phase` |
| `listTypes` | Lista tipos de agentes. | - |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `discover`, `getInfo`, `orchestrate`, `getSequence`, `getDocs`, `getPhaseDocs`, `listTypes` |
| `agentType` | string | nao | Tipo do agente. | - |
| `task` | string | nao | Descricao da tarefa. | - |
| `phase` | string | nao | Fase PREVC. | `P`, `R`, `E`, `V`, `C` |
| `role` | string | nao | Papel PREVC. | `planner`, `designer`, `architect`, `developer`, `qa`, `reviewer`, `documenter`, `solo-dev` |
| `includeReview` | boolean | nao | Incluir code review. | - |
| `phases` | array | nao | Fases para incluir. | `P`, `R`, `E`, `V`, `C` |
| `agent` | string | nao | Tipo do agente para docs. | `code-reviewer`, `bug-fixer`, `feature-developer`, `refactoring-specialist`, `test-writer`, `documentation-writer`, `performance-optimizer`, `security-auditor`, `backend-specialist`, `frontend-specialist`, `architect-specialist`, `devops-specialist`, `database-specialist`, `mobile-specialist` |

## context
**O que faz:** Scaffolding de contexto e contexto semantico.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `check` | Verifica se `.context` existe. | `repoPath` |
| `init` | Inicializa o scaffolding `.context`. | `repoPath`, `type`, `outputDir`, `semantic`, `autoFill`, `skipContentGeneration` |
| `fill` | Preenche scaffolding com conteudo AI. | `repoPath`, `outputDir`, `target`, `offset`, `limit` |
| `fillSingle` | Preenche um arquivo especifico. | `repoPath`, `filePath` |
| `listToFill` | Lista arquivos pendentes. | `repoPath`, `outputDir`, `target` |
| `getMap` | Retorna secao do codebase map. | `repoPath`, `section` |
| `buildSemantic` | Gera contexto semantico. | `repoPath`, `contextType`, `targetFile`, `options` |
| `scaffoldPlan` | Cria template de plano. | `planName`, `repoPath`, `title`, `summary`, `autoFill` |

**Notas de uso**
- Informe `repoPath` na primeira chamada; o valor fica em cache para chamadas seguintes.
- Depois do `init`, use `fillSingle` para cada arquivo pendente.
- Para habilitar PREVC, chame `workflow-init` (se nao for mudanca trivial).

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `check`, `init`, `fill`, `fillSingle`, `listToFill`, `getMap`, `buildSemantic`, `scaffoldPlan` |
| `repoPath` | string | nao | Caminho do repo (default: cwd). | - |
| `outputDir` | string | nao | Diretoria de saida (default: `./.context`). | - |
| `type` | string | nao | Tipo de scaffolding. | `docs`, `agents`, `both` |
| `semantic` | boolean | nao | Habilitar analise semantica. | - |
| `include` | array | nao | Padroes para incluir. | - |
| `exclude` | array | nao | Padroes para excluir. | - |
| `autoFill` | boolean | nao | Auto-preenchimento. | - |
| `skipContentGeneration` | boolean | nao | Pular geracao de conteudo. | - |
| `target` | string | nao | Scaffolding alvo. | `docs`, `agents`, `plans`, `all` |
| `offset` | number | nao | Pular os primeiros N arquivos. | - |
| `limit` | number | nao | Limite de arquivos. | - |
| `filePath` | string | nao | Caminho absoluto do arquivo. | - |
| `section` | string | nao | Secao do map. | `all`, `stack`, `structure`, `architecture`, `symbols`, `symbols.classes`, `symbols.interfaces`, `symbols.functions`, `symbols.types`, `symbols.enums`, `publicAPI`, `dependencies`, `stats` |
| `contextType` | string | nao | Tipo de contexto semantico. | `documentation`, `playbook`, `plan`, `compact` |
| `targetFile` | string | nao | Arquivo alvo. | - |
| `options` | object | nao | Opcoes do builder. | `useLSP`, `maxContextLength`, `includeDocumentation`, `includeSignatures` |
| `planName` | string | nao | Nome do plano. | - |
| `title` | string | nao | Titulo do plano. | - |
| `summary` | string | nao | Resumo/objetivo do plano. | - |

## explore
**O que faz:** Exploracao de arquivos e codigo.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `read` | Le o conteudo de arquivo. | `filePath`, `encoding` |
| `list` | Lista arquivos por pattern. | `pattern`, `cwd`, `ignore` |
| `analyze` | Analisa simbolos do arquivo. | `filePath`, `symbolTypes` |
| `search` | Busca com regex. | `pattern`, `fileGlob`, `maxResults`, `cwd` |
| `getStructure` | Estrutura de diretorios. | `rootPath`, `maxDepth`, `includePatterns` |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `read`, `list`, `analyze`, `search`, `getStructure` |
| `filePath` | string | nao | Caminho do arquivo. | - |
| `pattern` | string | nao | Glob (list) ou regex (search). | - |
| `cwd` | string | nao | Diretorio de trabalho. | - |
| `encoding` | string | nao | Encoding do arquivo. | `utf-8`, `ascii`, `binary` |
| `ignore` | array | nao | Padroes para ignorar. | - |
| `symbolTypes` | array | nao | Tipos de simbolos. | `class`, `interface`, `function`, `type`, `enum` |
| `fileGlob` | string | nao | Glob para filtrar arquivos na busca. | - |
| `maxResults` | number | nao | Limite de resultados. | - |
| `rootPath` | string | nao | Root para estrutura. | - |
| `maxDepth` | number | nao | Profundidade maxima. | - |
| `includePatterns` | array | nao | Padroes para incluir. | - |

## plan
**O que faz:** Gestao de planos e acompanhamento de execucao.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `link` | Vincula plano ao workflow. | `planSlug` |
| `getLinked` | Lista planos vinculados. | - |
| `getDetails` | Detalhes do plano. | `planSlug` |
| `getForPhase` | Planos por fase PREVC. | `phase` |
| `updatePhase` | Atualiza status da fase. | `planSlug`, `phaseId`, `status` |
| `recordDecision` | Registra decisao. | `planSlug`, `title`, `description`, `phase`, `alternatives` |
| `updateStep` | Atualiza status do passo. | `planSlug`, `phaseId`, `stepIndex`, `status`, `output`, `notes` |
| `getStatus` | Status de execucao. | `planSlug` |
| `syncMarkdown` | Sincroniza tracking no markdown. | `planSlug` |
| `commitPhase` | Cria commit para fase. | `planSlug`, `phaseId`, `coAuthor`, `stagePatterns`, `dryRun` |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `link`, `getLinked`, `getDetails`, `getForPhase`, `updatePhase`, `recordDecision`, `updateStep`, `getStatus`, `syncMarkdown`, `commitPhase` |
| `planSlug` | string | nao | Identificador do plano. | - |
| `phaseId` | string | nao | ID da fase. | - |
| `status` | string | nao | Status da fase/passo. | `pending`, `in_progress`, `completed`, `skipped` |
| `phase` | string | nao | Fase PREVC. | `P`, `R`, `E`, `V`, `C` |
| `title` | string | nao | Titulo da decisao. | - |
| `description` | string | nao | Descricao da decisao. | - |
| `alternatives` | array | nao | Alternativas consideradas. | - |
| `stepIndex` | number | nao | Numero do passo (1-based). | - |
| `output` | string | nao | Artefato do passo. | - |
| `notes` | string | nao | Notas de execucao. | - |
| `coAuthor` | string | nao | Co-Author da commit. | - |
| `stagePatterns` | array | nao | Padroes para stage. | - |
| `dryRun` | boolean | nao | Preview sem commit. | - |

## skill
**O que faz:** Gestao de skills para expertise sob demanda.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `list` | Lista skills. | `includeContent` |
| `getContent` | Conteudo de uma skill. | `skillSlug` |
| `getForPhase` | Skills por fase PREVC. | `phase` |
| `scaffold` | Gera arquivos de skill. | `skills`, `force` |
| `export` | Exporta skills para AI tools. | `preset`, `includeBuiltIn`, `force` |
| `fill` | Preenche skills com codebase content. | `skills`, `force` |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `list`, `getContent`, `getForPhase`, `scaffold`, `export`, `fill` |
| `skillSlug` | string | nao | Identificador da skill. | - |
| `phase` | string | nao | Fase PREVC. | `P`, `R`, `E`, `V`, `C` |
| `skills` | array | nao | Skills especificas. | - |
| `includeContent` | boolean | nao | Incluir conteudo completo. | - |
| `includeBuiltIn` | boolean | nao | Incluir skills built-in. | - |
| `preset` | string | nao | Target AI tool. | `claude`, `gemini`, `codex`, `antigravity`, `all` |
| `force` | boolean | nao | Sobrescrever. | - |

## sync
**O que faz:** Sincronizacao de regras, docs, agentes e skills com AI tools.

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `exportRules` | Exporta rules. | `preset`, `force`, `dryRun` |
| `exportDocs` | Exporta docs. | `preset`, `indexMode`, `force`, `dryRun` |
| `exportAgents` | Exporta agents. | `preset`, `mode`, `force`, `dryRun` |
| `exportContext` | Exporta tudo do contexto. | `preset`, `skipDocs`, `skipAgents`, `skipSkills`, `docsIndexMode`, `agentMode`, `force`, `dryRun` |
| `exportSkills` | Exporta skills. | `preset`, `includeBuiltIn`, `force` |
| `reverseSync` | Importa de AI tools para `.context/`. | `skipRules`, `skipAgents`, `skipSkills`, `mergeStrategy`, `dryRun`, `force`, `addMetadata` |
| `importDocs` | Importa docs. | `autoDetect`, `force`, `dryRun` |
| `importAgents` | Importa agents. | `autoDetect`, `force`, `dryRun` |
| `importSkills` | Importa skills. | `autoDetect`, `mergeStrategy`, `force`, `dryRun` |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `exportRules`, `exportDocs`, `exportAgents`, `exportContext`, `exportSkills`, `reverseSync`, `importDocs`, `importAgents`, `importSkills` |
| `preset` | string | nao | Preset de AI tool. | - |
| `force` | boolean | nao | Sobrescrever arquivos. | - |
| `dryRun` | boolean | nao | Preview sem escrever. | - |
| `indexMode` | string | nao | Modo de indexacao (docs). | `readme`, `all` |
| `mode` | string | nao | Modo de sync (agents). | `symlink`, `markdown` |
| `skipDocs` | boolean | nao | Pular docs. | - |
| `skipAgents` | boolean | nao | Pular agents. | - |
| `skipSkills` | boolean | nao | Pular skills. | - |
| `skipRules` | boolean | nao | Pular rules. | - |
| `docsIndexMode` | string | nao | Modo de indexacao (context). | `readme`, `all` |
| `agentMode` | string | nao | Modo de sync (context). | `symlink`, `markdown` |
| `includeBuiltInSkills` | boolean | nao | Incluir built-in skills (context). | - |
| `includeBuiltIn` | boolean | nao | Incluir built-in skills (exportSkills). | - |
| `mergeStrategy` | string | nao | Resolucao de conflitos. | `skip`, `overwrite`, `merge`, `rename` |
| `autoDetect` | boolean | nao | Auto-detect de arquivos. | - |
| `addMetadata` | boolean | nao | Adiciona frontmatter. | - |
| `repoPath` | string | nao | Caminho do repositorio. | - |

## workflow-advance
**O que faz:** Avanca o workflow para a proxima fase PREVC (P->R->E->V->C), respeitando gates.

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| `outputs` | array | nao | Artefatos produzidos na fase atual. |
| `force` | boolean | nao | Forca o avancar ignorando gates. |

## workflow-init
**O que faz:** Inicializa workflow PREVC com fases e gates configurados.

**Prerequisitos**
- `.context/` deve existir (use `context` com `action: "init"`).
- Scaffolding deve estar preenchido (use `fillSingle`).

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `name` | string | sim | Nome do workflow/feature. | - |
| `description` | string | nao | Descricao da tarefa (para scale). | - |
| `scale` | string | nao | Escala do projeto. | `QUICK`, `SMALL`, `MEDIUM`, `LARGE` |
| `autonomous` | boolean | nao | Pula gates (modo autonomo). | - |
| `require_plan` | boolean | nao | Exige plano antes de P->R. | - |
| `require_approval` | boolean | nao | Exige aprovacao antes de R->E. | - |
| `archive_previous` | boolean | nao | Arquiva workflow anterior. | - |

## workflow-manage
**O que faz:** Gerencia operacoes do workflow (handoff, colaboracao, docs, gates, aprovacao).

**Acoes disponiveis**
| Acao | Descricao | Parametros principais |
| --- | --- | --- |
| `handoff` | Transfere trabalho entre agentes. | `from`, `to`, `artifacts` |
| `collaborate` | Inicia colaboracao. | `topic`, `participants` |
| `createDoc` | Cria documento do workflow. | `type`, `docName` |
| `getGates` | Verifica gates. | - |
| `approvePlan` | Aprova plano vinculado. | `planSlug`, `approver`, `notes` |
| `setAutonomous` | Liga/desliga modo autonomo. | `enabled`, `reason` |

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao | Valores |
| --- | --- | --- | --- | --- |
| `action` | string | sim | Acao a executar. | `handoff`, `collaborate`, `createDoc`, `getGates`, `approvePlan`, `setAutonomous` |
| `from` | string | nao | Agente que entrega. | - |
| `to` | string | nao | Agente que recebe. | - |
| `artifacts` | array | nao | Artefatos a transferir. | - |
| `topic` | string | nao | Topico da colaboracao. | - |
| `participants` | array | nao | Papeis participantes. | `planner`, `designer`, `architect`, `developer`, `qa`, `reviewer`, `documenter`, `solo-dev` |
| `type` | string | nao | Tipo de documento. | `prd`, `tech-spec`, `architecture`, `adr`, `test-plan`, `changelog` |
| `docName` | string | nao | Nome do documento. | - |
| `planSlug` | string | nao | Plano a aprovar. | - |
| `approver` | string | nao | Papel aprovador. | `planner`, `designer`, `architect`, `developer`, `qa`, `reviewer`, `documenter`, `solo-dev` |
| `notes` | string | nao | Observacoes. | - |
| `enabled` | boolean | nao | Habilita/desabilita autonomo. | - |
| `reason` | string | nao | Motivo da mudanca. | - |

## workflow-status
**O que faz:** Retorna o status atual do workflow PREVC (fase, gates, planos, atividade).

**Parametros**
| Nome | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| (sem parametros) | - | - | Este tool nao recebe argumentos. |
