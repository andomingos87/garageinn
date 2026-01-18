'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, ArrowRight } from 'lucide-react'
import { statusLabels } from '../../constants'

interface HistoryItem {
  id: string
  action: string
  field_name?: string | null
  old_value?: string | null
  new_value?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ComercialTimelineProps {
  history: HistoryItem[]
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    created: 'Criou o chamado',
    updated: 'Atualizou o chamado',
    triaged: 'Realizou triagem',
    status_changed: 'Alterou status',
    resolution_updated: 'Atualizou resolucao',
    assigned: 'Atribuiu responsavel',
    commented: 'Adicionou comentario',
  }
  return labels[action] || action
}

function formatValue(value: string | null | undefined): string {
  if (!value) return '-'
  // Check if it's a status key
  if (statusLabels[value]) {
    return statusLabels[value]
  }
  return value
}

export function ComercialTimeline({ history }: ComercialTimelineProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum historico ainda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {item.user?.full_name?.slice(0, 2).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {item.user?.full_name || 'Sistema'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getActionLabel(item.action)}
                      </span>
                    </div>

                    {/* Show status change */}
                    {item.action === 'status_changed' && item.old_value && item.new_value && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-muted-foreground">
                          {formatValue(item.old_value)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {formatValue(item.new_value)}
                        </span>
                      </div>
                    )}

                    {/* Show other value changes */}
                    {item.new_value && item.action !== 'status_changed' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.new_value}
                      </p>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
