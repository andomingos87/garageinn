'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { statusLabels, statusColors, PRIORITY_LABELS, PRIORITY_COLORS } from '../constants'

interface ComercialStatusBadgeProps {
  status: string
  className?: string
}

export function ComercialStatusBadge({ status, className }: ComercialStatusBadgeProps) {
  const label = statusLabels[status] || status
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <Badge variant="outline" className={cn(colorClass, 'border-0', className)}>
      {label}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const label = PRIORITY_LABELS[priority] || priority
  const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800'

  return (
    <Badge variant="outline" className={cn(colorClass, 'border-0', className)}>
      {label}
    </Badge>
  )
}

export { PRIORITY_LABELS }
