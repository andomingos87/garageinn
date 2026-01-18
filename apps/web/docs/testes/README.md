# Diretório de Testes de Permissões

Este diretório contém todos os documentos relacionados aos testes de permissões do sistema GAPP.

## Estrutura

```
projeto/testes/
├── README.md                    # Este arquivo
├── TESTES_PERMISSOES.md         # Plano de testes principal (279 casos de teste)
└── bugs/                        # Pasta para documentação de bugs encontrados
    └── TEMPLATE_BUG.md          # Template para documentar novos bugs
```

## Como Usar

### 1. Executando os Testes

1. Abra o arquivo `TESTES_PERMISSOES.md`
2. Siga as instruções na seção "⚠️ INSTRUÇÕES IMPORTANTES"
3. Execute os testes na ordem apresentada
4. Marque cada teste como:
   - ✅ Aprovado
   - ❌ Reprovado (criar bug)
   - 🚫 Não aplicável

### 2. Documentando Bugs

Quando encontrar um problema:

1. **NÃO tente corrigir na hora**
2. Copie o arquivo `bugs/TEMPLATE_BUG.md`
3. Renomeie para `bugs/BUG-XXX.md` (use numeração sequencial: BUG-001, BUG-002, etc.)
4. Preencha todas as informações do template
5. Anote o ID do bug na coluna "Bug ID" do teste correspondente
6. Continue para o próximo teste

### 3. Após Todos os Testes

1. Atualize o "Resumo de Execução" no final de `TESTES_PERMISSOES.md`
2. Revise todos os bugs documentados
3. Priorize os bugs por severidade:
   - **Crítico**: Corrigir imediatamente
   - **Alto**: Corrigir antes do próximo deploy
   - **Médio**: Planejar correção
   - **Baixo**: Backlog

## Credenciais de Teste

Usuário admin para realizar impersonações:
- **Email**: admin@garageinn.com.br
- **Senha**: Teste123!

## Cobertura dos Testes

O plano de testes cobre:

| Categoria | Quantidade |
|-----------|------------|
| Cargos Globais | 22 testes |
| Operações | 55 testes |
| Compras/Manutenção | 32 testes |
| Financeiro | 26 testes |
| RH | 28 testes |
| Sinistros | 26 testes |
| Comercial | 22 testes |
| Auditoria | 32 testes |
| TI | 17 testes |
| Fluxo de Aprovação | 11 testes |
| Testes de RLS | 8 testes |
| **TOTAL** | **279 testes** |

## Referências

- Documento base: `projeto/usuarios/PERMISSOES_COMPLETAS.md`
- Credenciais admin: `user_test-admin.md`

---

> **Importante**: Este é um processo de QA. Documente tudo e não corrija durante a execução dos testes.
