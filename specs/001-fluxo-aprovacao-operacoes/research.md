# Research: Fluxo de aprovacao de chamados - Operacoes

## Decision: Reutilizar a cadeia de aprovacoes existente

**Rationale**: O sistema ja possui registros de aprovacao e estados de chamado; ajustar a selecao do primeiro aprovador e a criacao de aprovacoes reduz risco e evita retrabalho.  
**Alternatives considered**: Criar uma nova entidade de "workflow de aprovacao" configuravel por departamento. Rejeitado por aumentar escopo e exigir migracoes maiores.

## Decision: Determinar o primeiro aprovador pelo cargo mais alto do criador

**Rationale**: Evita autoaprovacao, respeita a hierarquia e resolve casos de usuario com multiplos cargos em Operacoes.  
**Alternatives considered**: Priorizar cargo "primario" definido pelo usuario. Rejeitado por depender de configuracao adicional e gerar inconsistencias.

## Decision: Fluxo especial apenas para Operacoes e sem retroatividade

**Rationale**: Mantem previsibilidade para outros departamentos e evita alterar chamados em andamento.  
**Alternatives considered**: Reprocessar chamados abertos para adequar a nova cadeia. Rejeitado por risco de efeitos colaterais e auditoria.
