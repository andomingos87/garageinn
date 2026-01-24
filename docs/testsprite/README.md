---
name: testsprite-docs
description: Documentacao de testes do projeto para envio ao TestSprite.
---

# TestSprite - Documentacao de Testes do Projeto

## Summary
- Documentacao modular para Web e Mobile
- Cada arquivo representa um modulo funcional
- Atualize placeholders de ambiente e dados antes do envio

## Como usar no TestSprite
1. Escolha o modulo desejado
2. Revise "Preconditions" e "Test data"
3. Ajuste "Assumptions" conforme o ambiente real
4. Suba o arquivo correspondente no TestSprite

## Convencoes
- IDs: WEB-<MOD>-### e MOB-<MOD>-###
- Steps numerados e objetivos
- Expected result observavel
- Se algo nao for confirmado, registrar em Assumptions

## Indice
### Web
- [Auth](web-auth.md)
- [Dashboard](web-dashboard.md)
- [Chamados](web-chamados.md)
- [Checklists](web-checklists.md)
- [Configuracoes](web-configuracoes.md)
- [Relatorios](web-relatorios.md)
- [Unidades](web-unidades.md)
- [Usuarios](web-usuarios.md)
- [Personificacao de Usuarios](web-usuarios-personificacao.md)
- [Perfil](web-perfil.md)
- [API Exports](web-api-exports.md)

### Mobile
- [Auth](mobile-auth.md)
- [Home](mobile-home.md)
- [Checklists](mobile-checklists.md)
- [Tickets](mobile-tickets.md)
- [Notifications](mobile-notifications.md)
- [Profile](mobile-profile.md)
- [Settings](mobile-settings.md)
- [User Permissions](mobile-user-permissions.md)
- [Infra](mobile-infra.md)

## Dados base sugeridos
- usuario_admin: acesso completo
- usuario_supervisor: acesso a checklists e unidades
- usuario_tecnico: execucao de checklists
- usuario_compras: fluxo de chamados compras
- usuario_financeiro: fluxo financeiro
- usuario_rh: fluxo RH
- usuario_comercial: fluxo comercial
- usuario_sinistros: fluxo sinistros
- unidade_padrao: unidade ativa com historico
- fornecedor_padrao: fornecedor ativo
- checklist_template_padrao: template publicado

## Ambientes
- preferencial: staging
- fallback: local com seed de dados
