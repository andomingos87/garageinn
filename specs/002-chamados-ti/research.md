# Research - Modulo de Chamados de TI - Fluxo Basico

## Decisions

1. Decision: Reutilizar o fluxo de aprovacao padrao existente para chamados de TI.  
   Rationale: Mantem consistencia com os demais modulos e reduz retrabalho de regras.  
   Alternatives considered: Criar fluxo exclusivo de aprovacao para TI.

2. Decision: Lista de chamados prontos para execucao acessivel apenas por equipe de TI e perfis globais.  
   Rationale: Evita exposicao indevida e atende ao principio de menor privilegio.  
   Alternatives considered: Liberar lista para todos os usuarios autenticados.

3. Decision: Chamados sem aprovacao exigida entram diretamente em status pronto para execucao.  
   Rationale: Simplifica o fluxo e garante disponibilidade imediata para atendimento.  
   Alternatives considered: Manter status intermediario de triagem.

4. Decision: Anexos sao opcionais na abertura do chamado.  
   Rationale: Evita bloqueio no cadastro e permite anexar evidencias quando necessario.  
   Alternatives considered: Tornar anexos obrigatorios ou condicionar por categoria.
