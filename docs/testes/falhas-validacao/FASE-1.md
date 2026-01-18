# Falhas de Validacao - Fase 1

- **Tarefa**: E2E Web (Playwright MCP)
- **Contexto**: Playwright MCP nao conseguiu iniciar navegador devido a sessao existente do Chrome.
- **Ambiente**: Windows 10, Playwright MCP
- **Passos para reproduzir**:
  1. Executar `browser_navigate` para `http://localhost:3000`
  2. Observar erro de inicializacao do navegador
- **Resultado esperado**: navegador iniciado e fluxos E2E executados.
- **Resultado obtido**: erro `browserType.launchPersistentContext: Failed to launch the browser process` com mensagem "Abrindo em uma sessao de navegador existente."
- **Evidencias**: logs do MCP (erro de inicializacao do Chrome).
- **Severidade**: Alta
- **Observacoes**: sem E2E nao foi possivel validar fluxos de login, chamados e checklists.

- **Tarefa**: 1.6/1.7/1.8 (Chamados) e 1.5 (Checklists) - anexos
- **Contexto**: buckets de Storage nao encontrados no Supabase.
- **Ambiente**: Supabase MCP (schema `storage`)
- **Passos para reproduzir**:
  1. `select id, name, public from storage.buckets order by name;`
- **Resultado esperado**: buckets configurados para anexos/fotos.
- **Resultado obtido**: nenhum bucket cadastrado.
- **Evidencias**: resultado vazio na consulta Supabase MCP.
- **Severidade**: Alta
- **Observacoes**: anexos e upload de fotos nao podem ser validados sem buckets.

- **Tarefa**:
- **Contexto**:
- **Ambiente**:
- **Passos para reproduzir**:
  1.
  2.
  3.
- **Resultado esperado**:
- **Resultado obtido**:
- **Evidencias**:
- **Severidade**:
- **Observacoes**:
