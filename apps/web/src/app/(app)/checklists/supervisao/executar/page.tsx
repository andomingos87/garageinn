import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ClipboardList, Building2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { getSupervisionChecklists } from '../../executar/actions'
import { SupervisionStartCard } from './components/supervision-start-card'

async function SupervisionChecklistsContent() {
  const checklists = await getSupervisionChecklists()

  // Agrupar por status
  const pending = checklists.filter(c => !c.todayExecution)
  const inProgress = checklists.filter(c => c.todayExecution?.status === 'in_progress')
  const completed = checklists.filter(c => c.todayExecution?.status === 'completed')

  if (checklists.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nenhum checklist de supervisão disponível</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Você não tem unidades com cobertura de supervisão configuradas.
              </p>
              <p className="text-muted-foreground text-sm">
                Entre em contato com o administrador do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Em Andamento */}
      {inProgress.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-info" />
            Em Andamento ({inProgress.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((checklist) => (
              <SupervisionStartCard
                key={`${checklist.unit.id}-${checklist.template.id}`}
                checklist={checklist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pendentes */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Building2 className="h-5 w-5 text-warning" />
            Pendentes ({pending.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pending.map((checklist) => (
              <SupervisionStartCard
                key={`${checklist.unit.id}-${checklist.template.id}`}
                checklist={checklist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Concluídos */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2 text-muted-foreground">
            Concluídos Hoje ({completed.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((checklist) => (
              <SupervisionStartCard
                key={`${checklist.unit.id}-${checklist.template.id}`}
                checklist={checklist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ExecutarSupervisaoPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists/supervisao">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Executar Supervisão
            </h2>
            <p className="text-muted-foreground">
              Selecione uma unidade para iniciar o checklist de supervisão
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Supervisões de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-8 w-12" />}>
              <SupervisionStats type="total" />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-8 w-12" />}>
              <SupervisionStats type="pending" />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-8 w-12" />}>
              <SupervisionStats type="completed" />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <SupervisionChecklistsContent />
      </Suspense>
    </div>
  )
}

async function SupervisionStats({ type }: { type: 'total' | 'pending' | 'completed' }) {
  const checklists = await getSupervisionChecklists()

  const total = checklists.length
  const pending = checklists.filter(c => !c.todayExecution).length
  const completed = checklists.filter(c => c.todayExecution?.status === 'completed').length

  const value = type === 'total' ? total : type === 'pending' ? pending : completed

  return (
    <div className="text-2xl font-bold">
      {type === 'completed' ? `${completed}/${total}` : value}
    </div>
  )
}
