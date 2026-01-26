# API Contract: Approval Visibility & Enforcement

```yaml
openapi: 3.0.3
info:
  title: Chamados - Approval Visibility
  version: 1.0.0
paths:
  /chamados/{module}/{ticketId}/status:
    post:
      summary: Atualiza status respeitando permissão do perfil
      parameters:
        - name: module
          in: path
          required: true
          schema:
            type: string
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
                reason:
                  type: string
      responses:
        "200":
          description: Status atualizado com sucesso
        "403":
          description: Perfil sem permissão para aprovar/negAR
        "400":
          description: Transição inválida
```
