# BUG-001: Falha no Formulário de Chamado de Manutenção (Dropdown Assunto)

## 🚨 Resumo
O fluxo de criação de chamados de manutenção está **bloqueado**. Ao tentar criar um novo chamado, o campo "Assunto" (Subject) não abre e não permite seleção, impedindo o envio do formulário.

## ℹ️ Informações
- **Local:** Web App > Chamados > Manutenção > Novo Chamado
- **Severidade:** Crítica (Blocker)
- **Impacto:** Impede completamente a abertura de chamados de manutenção.

## 📝 Passos para Reproduzir
1. Realizar login como Manobrista (ou qualquer usuário com permissão de abertura).
2. Navegar para o menu **Chamados > Manutenção**.
3. Clicar no botão **"Novo Chamado"**.
4. Tentar clicar ou selecionar uma opção no campo **"Assunto"**.

**Comportamento Observado:** O dropdown não carrega opções ou não abre.
**Comportamento Esperado:** O dropdown deve listar as categorias/assuntos vinculados ao departamento de Manutenção.

## 🛠️ Evidência Técnica (Logs)
O console do navegador apresenta um erro fatal de integração com o Supabase:

```log
[ERROR] Error fetching Manutenção department: 
Server {
  code: PGRST116, 
  details: The result contains 0 rows, 
  hint: null, 
  message: Cannot coerce the result to a single JSON object
}
```

## 🔍 Análise da Causa Raiz
O erro `PGRST116` ocorre quando uma query do Supabase utiliza o modificador `.single()` mas a consulta não retorna nenhuma linha (0 rows).

**Hipótese:**
O código do formulário de Manutenção está tentando buscar o departamento filtrando estritamente pelo nome **"Manutenção"**.
No entanto, na estrutura do banco de dados (baseado no arquivo `permissions.ts`), o departamento provavelmente está cadastrado como **"Compras e Manutenção"** (unificado) ou o departamento "Manutenção" isolado não existe na tabela `departments`.

## 💡 Sugestão de Correção
1. Verificar no arquivo `apps/web/src/app/(app)/chamados/manutencao/components/manutencao-form.tsx` (ou similar) como a busca pelo departamento é feita.
2. Ajustar a query para buscar o nome correto do departamento conforme consta no banco de dados (provavelmente "Compras e Manutenção").

## ✅ Correção Realizada
A hipótese foi confirmada. O banco de dados possui o departamento nomeado como **"Compras e Manutenção"**, mas o código buscava por **"Manutenção"**.

Arquivos corrigidos:
1. `apps/web/src/app/(app)/chamados/manutencao/actions.ts`: Atualizada a query na função `getManutencaoDepartment` para buscar por "Compras e Manutenção".
2. `apps/web/src/app/(app)/chamados/sinistros/[ticketId]/actions.ts`: Atualizada a query na função `createMaintenanceFromClaim` para buscar por "Compras e Manutenção".

A correção garante que o ID do departamento seja recuperado corretamente, permitindo o carregamento das categorias e a criação de chamados.
