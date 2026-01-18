'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { deleteTicket } from '../admin/actions'

interface DeleteTicketButtonProps {
  ticketId: string
  ticketNumber: number
  ticketTitle: string
  redirectTo?: string
}

export function DeleteTicketButton({ 
  ticketId, 
  ticketNumber, 
  ticketTitle,
  redirectTo = '/chamados'
}: DeleteTicketButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  
  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTicket(ticketId)
      
      if (result.success) {
        toast.success(`Chamado #${ticketNumber} excluído com sucesso`)
        setIsOpen(false)
        router.push(redirectTo)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao excluir chamado')
      }
    })
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Excluir Chamado
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Chamado</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o chamado <strong>#{ticketNumber}</strong>: {ticketTitle}.
            <br /><br />
            Esta ação é <strong>permanente</strong> e removerá todos os dados relacionados
            (comentários, anexos, histórico, aprovações).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Chamado'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
