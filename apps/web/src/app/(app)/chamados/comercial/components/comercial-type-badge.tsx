'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { COMERCIAL_TYPE_LABELS, RESOLUTION_TYPE_LABELS } from '../constants'

const COMERCIAL_TYPE_COLORS: Record<string, string> = {
  novo_contrato: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  renovacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelamento: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  proposta: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  reclamacao: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  outros: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

interface ComercialTypeBadgeProps {
  type: string
  className?: string
}

export function ComercialTypeBadge({ type, className }: ComercialTypeBadgeProps) {
  const label = COMERCIAL_TYPE_LABELS[type] || type
  const colorClass = COMERCIAL_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800'

  return (
    <Badge variant="outline" className={cn(colorClass, 'border-0', className)}>
      {label}
    </Badge>
  )
}

const RESOLUTION_TYPE_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  negotiating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

interface ResolutionTypeBadgeProps {
  type: string
  className?: string
}

export function ResolutionTypeBadge({ type, className }: ResolutionTypeBadgeProps) {
  const label = RESOLUTION_TYPE_LABELS[type] || type
  const colorClass = RESOLUTION_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800'

  return (
    <Badge variant="outline" className={cn(colorClass, 'border-0', className)}>
      {label}
    </Badge>
  )
}

export { COMERCIAL_TYPE_LABELS }
