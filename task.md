# Manutenção — Requisitos e Perguntas em Aberto

---

## 1. Chamado de Manutenção gera Chamado de Compra

**Descrição:** Ao tratar um chamado de manutenção, o operador deve poder criar um chamado de compra vinculado, indicando que a resolução depende da aquisição de material ou serviço.

**Perguntas em aberto:**
- O chamado de compra é criado manualmente pelo operador ou de forma automática a partir de alguma ação específica no chamado de manutenção?
- Qual informação mínima deve ser copiada do chamado de manutenção para o de compra (descrição, unidade, prioridade)?
- O chamado de manutenção muda de status enquanto aguarda o chamado de compra ser concluído?
- Pode existir mais de um chamado de compra vinculado a um mesmo chamado de manutenção?
- O chamado de compra vinculado deve exibir um link de volta para o chamado de manutenção de origem?

---

## 2. Gerente aprova compras; Departamento de Compras executa

**Descrição:** A aprovação de compras é responsabilidade do gerente do setor solicitante. O departamento de Compras atua apenas na execução da compra já aprovada, sem poder de aprovação.

**Perguntas em aberto:**
- O gerente que aprova é sempre o gerente do setor que abriu o chamado de manutenção original?
- O departamento de Compras recebe o chamado somente após a aprovação do gerente, ou já tem visibilidade antes?
- Existe algum valor-limite de compra que altere o fluxo de aprovação (ex.: acima de X reais exige aprovação adicional)?
- O que acontece se o gerente rejeitar a compra — o chamado de manutenção volta para algum status específico?

---

## 3. Gerente não aprova a própria compra; Diretor aprova para gerentes

**Descrição:** Um gerente não pode aprovar chamados de compra que ele mesmo criou ou solicitou. Nesses casos, a aprovação sobe para o diretor responsável.

**Perguntas em aberto:**
- A restrição vale apenas quando o gerente é o criador do chamado, ou também quando ele é o solicitante indireto (ex.: abriu o chamado de manutenção que gerou a compra)?
- Existe apenas um diretor por setor ou pode haver mais de um apto a aprovar?
- Se o diretor não estiver disponível, existe um substituto ou o chamado fica aguardando?

---

## 4. Avaliação de entrega (recebimento)

**Descrição:** Após a compra ser executada e a entrega realizada, o solicitante (ou responsável designado) deve registrar o recebimento e fazer uma avaliação (ex.: conformidade do item, qualidade, prazo).

**Perguntas em aberto:**
- Quem é o responsável por avaliar a entrega — o criador do chamado, o gerente do setor, ou qualquer usuário da unidade?
- Quais campos mínimos a avaliação deve ter (aprovado/reprovado, nota, comentário)?
- Se a entrega for reprovada, qual o fluxo seguinte — abre um novo chamado de compra ou o mesmo é reaberto?
- A avaliação de entrega é obrigatória para fechar o chamado de compra?

---

## 5. Hierarquia de aprovação uniforme para todos os setores

**Descrição:** O modelo de aprovação por hierarquia (operador → gerente → diretor) utilizado em Operações se aplica igualmente a todos os outros setores (Compras, Manutenção, RH, TI, Financeiro, Comercial, Sinistros).

**Perguntas em aberto:**
- Existe algum setor que precise de uma etapa extra de aprovação ou todos seguem exatamente o mesmo fluxo de dois níveis (gerente e diretor)?
- As roles de "gerente" e "diretor" já estão mapeadas no RBAC atual para todos os setores, ou precisam ser criadas?
- O fluxo de aprovação é configurável por setor ou fixo no código?

---

## 6. Diretor pode aprovar os próprios chamados

**Descrição:** Diferente do gerente, o diretor tem autonomia para aprovar chamados de compra criados por ele mesmo, sem necessidade de escalar para outro nível.

**Perguntas em aberto:**
- Essa regra se aplica a qualquer tipo de chamado (não só compra) ou apenas a chamados de compra?
- Existe algum caso em que o chamado do diretor precise de uma segunda aprovação (ex.: valor acima de um teto)?
- Deve haver registro/log de que o diretor autoaprovou, para fins de auditoria?

---

## 7. Erro ao manipular chamado

**Descrição:** Usuários estão encontrando erros ao realizar ações em chamados (criar, editar, mudar status, etc.). É necessário investigar e corrigir os problemas reportados.

**Perguntas em aberto:**
- Qual ação específica gera o erro (criação, edição, mudança de status, exclusão)?
- O erro ocorre para todos os usuários ou apenas para determinadas roles/permissões?
- Existe uma mensagem de erro específica ou o comportamento é silencioso (a ação simplesmente não acontece)?
- O erro é reproduzível em um chamado específico ou acontece de forma aleatória?
- Em qual ambiente o erro ocorre (produção, staging, local)?

---

## 8. Envio manual para aprovação

**Descrição:** Um chamado não deve ir automaticamente para o fluxo de aprovação ao ser criado. O usuário deve explicitamente clicar em uma ação como "Enviar para Aprovação" quando o chamado estiver pronto para revisão.

**Perguntas em aberto:**
- O botão "Enviar para Aprovação" deve aparecer somente para o criador do chamado ou também para outros papéis?
- Antes de enviar para aprovação, o chamado fica em qual status (ex.: "Rascunho", "Em andamento")?
- Após o envio, o criador ainda pode editar o chamado ou ele fica travado até a decisão do aprovador?
- Se o aprovador rejeitar, o chamado volta para o criador para edição e reenvio?

---

## 9. Anexar arquivos nos chamados

**Descrição:** Usuários devem poder anexar arquivos (fotos, documentos, notas fiscais, etc.) aos chamados para complementar as informações e facilitar a análise e aprovação.

**Perguntas em aberto:**
- Quais tipos de arquivo devem ser aceitos (imagens, PDFs, planilhas, todos)?
- Existe um limite de tamanho por arquivo ou por chamado?
- Os anexos podem ser adicionados a qualquer momento ou apenas em determinados status do chamado?
- Os anexos devem ser armazenados no Supabase Storage?
- Os arquivos precisam ter visualização inline (preview) ou apenas download?
