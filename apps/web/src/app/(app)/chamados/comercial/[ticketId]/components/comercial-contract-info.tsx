'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Calendar } from 'lucide-react'

interface ComercialContractInfoProps {
  comercialDetails: {
    contract_value: number | null
    contract_start_date: string | null
    contract_end_date: string | null
    proposal_deadline: string | null
  } | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd 'de' MMM 'de' yyyy", { locale: ptBR })
}

export function ComercialContractInfo({ comercialDetails }: ComercialContractInfoProps) {
  if (!comercialDetails) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Dados do Contrato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {comercialDetails.contract_value && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Valor do Contrato</h4>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(comercialDetails.contract_value)}
              </p>
            </div>
          )}

          {comercialDetails.proposal_deadline && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Prazo da Proposta
              </h4>
              <p className="font-medium">{formatDate(comercialDetails.proposal_deadline)}</p>
            </div>
          )}

          {comercialDetails.contract_start_date && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Inicio do Contrato
              </h4>
              <p>{formatDate(comercialDetails.contract_start_date)}</p>
            </div>
          )}

          {comercialDetails.contract_end_date && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Fim do Contrato
              </h4>
              <p>{formatDate(comercialDetails.contract_end_date)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
