# Data Model - Acesso a Usuários e Configurações por Admin e Globais

## Entidades

- **Usuário**
  - Atributos: id, nome, email, status, lista de perfis atribuídos
  - Descrição: pessoa autenticada que acessa o sistema

- **Perfil Global**
  - Atributos: id, nome do perfil (ex.: Administrador, Diretor, Desenvolvedor)
  - Descrição: perfil com escopo global que concede acesso total

- **Perfil de Departamento**
  - Atributos: id, departamento, cargo, conjunto de permissões
  - Descrição: perfil com escopo restrito a um departamento

- **Permissão**
  - Atributos: código, descrição, escopo
  - Descrição: capacidade específica de acesso ou ação

- **Módulo**
  - Atributos: nome, rota principal, permissões requeridas
  - Descrição: área do sistema (ex.: "Usuários", "Configurações")

- **Atribuição de Perfil**
  - Atributos: usuário, perfil, escopo (global/departamento)
  - Descrição: ligação entre usuário e seus perfis

## Relacionamentos

- Um **Usuário** possui uma ou mais **Atribuições de Perfil**.
- **Atribuições de Perfil** referenciam **Perfil Global** ou **Perfil de Departamento**.
- **Perfis** determinam um conjunto de **Permissões**.
- **Módulos** exigem **Permissões** específicas para acesso.

## Regras de Negócio (Validação)

- Perfis globais concedem acesso total equivalente a permissão `admin:all`.
- Acesso aos módulos "Usuários" e "Configurações" exige permissão global ou equivalente.
- Usuários sem permissão adequada não visualizam itens na sidebar e têm acesso negado por link direto.
