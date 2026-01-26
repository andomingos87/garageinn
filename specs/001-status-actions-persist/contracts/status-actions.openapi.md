# API Contract: Status Actions (Compras + Manutenção)

```yaml
openapi: 3.0.3
info:
  title: Chamados - Status Actions
  version: 1.0.0
paths:
  /chamados/compras/{ticketId}/status:
    post:
      summary: Atualiza o status de um chamado de Compras/Manutenção
      parameters:
        - name: ticketId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  description: Novo status permitido pelo fluxo.
                reason:
                  type: string
                  description: Motivo obrigatório quando status = denied.
      responses:
        "200":
          description: Status atualizado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  ticketId:
                    type: string
                  status:
                    type: string
                  updatedAt:
                    type: string
                    format: date-time
        "400":
          description: Transição inválida
        "403":
          description: Usuário sem permissão
        "409":
          description: Conflito de atualização (aplica last write wins com notificação)
        "422":
          description: Motivo obrigatório ausente para negação
```
