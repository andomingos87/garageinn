# Data Model - Visibilidade de TI na sidebar

## Entities

### Usuario

**Descricao**: Pessoa autenticada no sistema.  
**Campos relevantes**:
- id
- status
- roles (cargos atribuídos)

### Cargo

**Descricao**: Perfil de acesso associado ao usuario.  
**Campos relevantes**:
- id
- name
- is_global
- department_id

### Departamento

**Descricao**: Area organizacional associada ao cargo (ex.: TI, Operacoes).  
**Campos relevantes**:
- id
- name

### Area de TI (Acesso)

**Descricao**: Conjunto de rotas e menus relacionados a chamados de TI.  
**Regra principal**:
- Elegivel se usuario possui cargo do departamento TI ou perfil global/admin.

## Observacoes

- Nao ha novas entidades persistidas. O controle de acesso usa dados existentes de cargo/departamento.
