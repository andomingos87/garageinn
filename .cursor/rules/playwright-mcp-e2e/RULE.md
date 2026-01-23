# MCP Playwright para testes E2E

## Contexto
Este projeto usa o MCP do Playwright para validar fluxos E2E e correcoes de bugs no app web. A validacao deve ser visual e registrada com screenshots quando necessario.

## Regra
**Sempre use o MCP Playwright para executar e validar testes E2E e correcoes de bugs no frontend.**

### Por que?
- **Confiabilidade**: valida o comportamento real no navegador, incluindo estados e permissoes.
- **Reprodutibilidade**: segue um fluxo padrao de navegacao e interacao.
- **Evidencia**: screenshots e snapshots facilitam auditoria e revisao.

## Fluxo recomendado
1. Navegue ate a pagina alvo.
2. Capture snapshot para obter os elementos.
3. Interaja com os elementos e valide o resultado.
4. Re-capture snapshot quando houver mudancas esperadas.
5. Use screenshot quando precisar de verificacao visual.
6. Salve evidencias em `.playwright-mcp/` quando aplicavel.
