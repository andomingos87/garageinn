"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { addFinanceiroTicketComment } from "../../actions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface FinanceiroCommentsProps {
  ticketId: string;
  comments: Comment[];
}

export function FinanceiroComments({
  ticketId,
  comments,
}: FinanceiroCommentsProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Comentario nao pode estar vazio");
      return;
    }

    startTransition(async () => {
      const result = await addFinanceiroTicketComment(
        ticketId,
        content,
        isInternal
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comentario adicionado");
        setContent("");
        setIsInternal(false);
      }
    });
  };

  // Ordenar comentarios por data (mais recente primeiro)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comments.length})
        </CardTitle>
        <CardDescription>
          Adicione comentarios para comunicacao sobre este chamado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulario de novo comentario */}
        <div className="space-y-4">
          <Textarea
            placeholder="Digite seu comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internal"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked === true)}
                disabled={isPending}
              />
              <Label htmlFor="internal" className="text-sm">
                Comentario interno (visivel apenas para a equipe)
              </Label>
            </div>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Comentar
            </Button>
          </div>
        </div>

        {/* Lista de comentarios */}
        {sortedComments.length > 0 ? (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 border-b pb-4 last:border-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.user?.full_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.user?.full_name || "Desconhecido"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {comment.is_internal && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        Interno
                      </Badge>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhum comentario ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
}
