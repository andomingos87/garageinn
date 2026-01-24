# Research - Modulo de Chamados de TI

## Decisions

### 1) Reusar padroes do modulo de manutencao

- **Decision**: Reutilizar a estrutura do modulo `chamados/manutencao` para paginas, actions e componentes base.
- **Rationale**: Garante consistencia visual e funcional entre modulos, reduz risco e tempo de entrega.
- **Alternatives considered**: Criar fluxo e componentes exclusivos para TI desde o inicio.

### 2) Fluxo de aprovacao integrado ao fluxo padrao

- **Decision**: Estender o fluxo de aprovacao padrao para chamados de TI quando aplicavel.
- **Rationale**: Mantem regra centralizada e comportamento uniforme entre departamentos.
- **Alternatives considered**: Criar funcao de aprovacao exclusiva para TI, com possivel duplicacao de logica.

### 3) Separar detalhes especificos de TI

- **Decision**: Armazenar tipo de equipamento em tabela de detalhes (`ticket_it_details`) e expor por view para listagens.
- **Rationale**: Mantem o modelo principal de tickets limpo e permite evolucao de campos especificos de TI.
- **Alternatives considered**: Adicionar campos diretamente na tabela principal de tickets.

### 4) Categorias iniciais de TI

- **Decision**: Iniciar com categorias Equipamento, Rede, Internet e Outros.
- **Rationale**: Cobre os principais tipos de demanda e simplifica triagem inicial.
- **Alternatives considered**: Catalogo mais detalhado por subcategorias desde o inicio.
