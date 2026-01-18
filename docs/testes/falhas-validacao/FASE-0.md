# Falhas de Validacao - Fase 0

- **Tarefa**: 0.1.2 Padronizar lint e format (Web)
- **Contexto**: `npm run lint` falhou com erros e warnings no app Web.
- **Ambiente**: Windows 10, apps/web
- **Passos para reproduzir**:
  1. `cd apps/web`
  2. `npm run lint`
- **Resultado esperado**: lint sem erros criticos.
- **Resultado obtido**: 30 erros e 66 warnings reportados pelo ESLint.
- **Evidencias**: log em `agent-tools/3ffd4ccf-e40c-4797-a048-2679b645c2a2.txt`.
- **Severidade**: Alta
- **Observacoes**: inclui erros de `@typescript-eslint/no-explicit-any` e `react-hooks/set-state-in-effect`.

- **Tarefa**: 0.1.2 Padronizar lint e format (Web)
- **Contexto**: `npm run format:check` retornou divergencias de formatacao.
- **Ambiente**: Windows 10, apps/web
- **Passos para reproduzir**:
  1. `cd apps/web`
  2. `npm run format:check`
- **Resultado esperado**: formatacao sem divergencias.
- **Resultado obtido**: 351 arquivos com divergencias.
- **Evidencias**: log em `agent-tools/f3334c73-dcb8-4abc-ba45-2061b2d9f706.txt`.
- **Severidade**: Media
- **Observacoes**: Prettier indicou multiplos arquivos fora do padrao.

- **Tarefa**: 0.1.2 Padronizar lint e format (Mobile)
- **Contexto**: `npm run lint` falhou por ausencia de ESLint no ambiente.
- **Ambiente**: Windows 10, apps/mobile
- **Passos para reproduzir**:
  1. `cd apps/mobile`
  2. `npm run lint`
- **Resultado esperado**: lint executa sem erros criticos.
- **Resultado obtido**: `'eslint' nao e reconhecido como um comando interno ou externo`.
- **Evidencias**: saida do comando `npm run lint` (mobile).
- **Severidade**: Alta
- **Observacoes**: possivel dependencia nao instalada no workspace.

- **Tarefa**: 0.3.3 Storage (Buckets)
- **Contexto**: consulta de buckets retornou vazio.
- **Ambiente**: Supabase MCP (schema `storage`)
- **Passos para reproduzir**:
  1. `select id, name, public from storage.buckets order by name;`
- **Resultado esperado**: buckets de anexos e fotos configurados.
- **Resultado obtido**: nenhum bucket cadastrado.
- **Evidencias**: resultado vazio na consulta Supabase MCP.
- **Severidade**: Alta
- **Observacoes**: validar se buckets deveriam existir nesta fase.

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
