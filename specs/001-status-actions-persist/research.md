# Research: Persistência de Ações de Status (Compras + Manutenção)

## Decision 1: Cobrir permissões de atualização no fluxo de Compras/Manutenção
**Rationale**: As políticas atuais permitem update apenas por criador, responsável, aprovador ou admin. Compradores que executam o fluxo não estão contemplados, causando falha silenciosa de persistência.
**Alternatives considered**: Manter as políticas atuais e ajustar somente o front-end (rejeitado, não resolve bloqueio real).

## Decision 2: Tratar atualização sem persistência como erro
**Rationale**: Hoje o fluxo pode retornar sucesso mesmo sem atualização efetiva. O retorno deve verificar resultado de atualização e reportar falha quando nenhuma linha for alterada.
**Alternatives considered**: Aceitar sucesso e confiar apenas no toast (rejeitado por feedback enganoso).

## Decision 3: Garantir atualização da UI após mudança confirmada
**Rationale**: A tela deve refletir o status persistido imediatamente; além da revalidação do servidor, o cliente deve garantir refresh do estado após sucesso.
**Alternatives considered**: Depender apenas do cache/revalidate no servidor (risco de UI desatualizada).
