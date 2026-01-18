'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { addComercialTicketComment } from '../../actions'

interface Comment {
  id: string
  content: string
  is_internal: boolean
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ComercialCommentsProps {
  ticketId: string
  comments: Comment[]
  canManage: boolean
}

export function ComercialComments({ ticketId, comments, canManage }: ComercialCommentsProps) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      const result = await addComercialTicketComment(ticketId, content.trim(), isInternal)
      if (result.success) {
        setContent('')
        setIsInternal(false)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios
          {comments.length > 0 && (
            <Badge variant="secondary">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de comentarios */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex gap-3 p-4 rounded-lg ${
                  comment.is_internal
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-muted/50'
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.user?.full_name?.slice(0, 2).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user?.full_name || 'Usuario'}
                    </span>
                    {comment.is_internal && (
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Interno
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentario ainda
          </p>
        )}

        {/* Formulario de novo comentario */}
        {canManage && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
            <Textarea
              placeholder="Escreva um comentario..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_internal"
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                  disabled={isPending}
                />
                <Label htmlFor="is_internal" className="text-sm">
                  Comentario interno (visivel apenas para equipe)
                </Label>
              </div>
              <Button type="submit" disabled={isPending || !content.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
