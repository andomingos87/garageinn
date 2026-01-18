'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react'
import { statusLabels, statusColors, PRIORITY_LABELS, PRIORITY_COLORS } from '../../constants'
import { ComercialTypeBadge } from '../../components/comercial-type-badge'

interface ComercialHeaderProps {
  ticket: {
    id: string
    ticket_number: number
    title: string
    status: string
    priority: string | null
    perceived_urgency: string | null
    created_at: string
    unit?: { id: string; name: string; code: string } | null
    category?: { id: string; name: string } | null
    creator?: { id: string; full_name: string; email: string; avatar_url: string | null } | null
    comercial_details?: Array<{ comercial_type: string }> | null
  }
}

export function ComercialHeader({ ticket }: ComercialHeaderProps) {
  const comercialType = ticket.comercial_details?.[0]?.comercial_type

  return (
    <div className="flex flex-col gap-4">
      {/* Back button and ticket number */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chamados/comercial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground font-mono">
          #{ticket.ticket_number}
        </span>
        {comercialType && (
          <ComercialTypeBadge type={comercialType} />
        )}
      </div>

      {/* Title and status */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {ticket.unit && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {ticket.unit.code} - {ticket.unit.name}
              </span>
            )}
            {ticket.category && (
              <Badge variant="outline">{ticket.category.name}</Badge>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(ticket.created_at), "dd 'de' MMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge className={statusColors[ticket.status]}>
            {statusLabels[ticket.status] || ticket.status}
          </Badge>
          {ticket.priority && (
            <Badge className={PRIORITY_COLORS[ticket.priority]}>
              {PRIORITY_LABELS[ticket.priority]}
            </Badge>
          )}
        </div>
      </div>

      {/* Creator info */}
      {ticket.creator && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Criado por</span>
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.creator.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {ticket.creator.full_name?.slice(0, 2).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{ticket.creator.full_name}</span>
        </div>
      )}
    </div>
  )
}
