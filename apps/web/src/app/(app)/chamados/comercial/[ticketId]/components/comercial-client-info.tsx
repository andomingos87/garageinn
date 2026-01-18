'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Phone, Mail, FileText } from 'lucide-react'

interface ComercialClientInfoProps {
  comercialDetails: {
    client_name: string | null
    client_cnpj: string | null
    client_phone: string | null
    client_email: string | null
  } | null
}

export function ComercialClientInfo({ comercialDetails }: ComercialClientInfoProps) {
  if (!comercialDetails) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {comercialDetails.client_name && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome / Razao Social</h4>
              <p className="font-medium">{comercialDetails.client_name}</p>
            </div>
          )}

          {comercialDetails.client_cnpj && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                CNPJ
              </h4>
              <p className="font-mono">{comercialDetails.client_cnpj}</p>
            </div>
          )}

          {comercialDetails.client_phone && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Telefone
              </h4>
              <a
                href={`tel:${comercialDetails.client_phone.replace(/\D/g, '')}`}
                className="text-primary hover:underline"
              >
                {comercialDetails.client_phone}
              </a>
            </div>
          )}

          {comercialDetails.client_email && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                Email
              </h4>
              <a
                href={`mailto:${comercialDetails.client_email}`}
                className="text-primary hover:underline"
              >
                {comercialDetails.client_email}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
