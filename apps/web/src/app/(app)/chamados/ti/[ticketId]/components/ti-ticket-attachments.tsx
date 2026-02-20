"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Paperclip, Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addTiAttachments } from "../../actions";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at: string;
  uploader: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface TiTicketAttachmentsProps {
  ticketId: string;
  ticketStatus: string;
  canExecute: boolean;
  attachments: Attachment[];
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function TiTicketAttachments({
  ticketId,
  ticketStatus,
  canExecute,
  attachments,
}: TiTicketAttachmentsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canUpload = canExecute && ticketStatus === "in_progress";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!canUpload) {
      toast.error("Anexos disponíveis apenas quando o chamado estiver em andamento");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("attachments", file));

    setIsUploading(true);
    try {
      const result = await addTiAttachments(ticketId, formData);
      if (result.error) {
        if (result.code === "conflict") {
          toast.warning(result.error);
          router.refresh();
          return;
        }
        toast.error(result.error);
        return;
      }
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso`);
      router.refresh();
    } catch {
      toast.error("Erro ao enviar arquivos");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadFile = (attachment: Attachment) => {
    window.open(attachment.file_path, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Anexos
            {attachments.length > 0 && (
              <Badge variant="secondary">{attachments.length}</Badge>
            )}
          </CardTitle>

          {canExecute && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !canUpload}
                title={
                  canUpload
                    ? "Adicionar anexos"
                    : "Disponível apenas em andamento"
                }
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {isUploading ? "Enviando..." : "Adicionar"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum anexo adicionado ainda
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-background border">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {attachment.file_size ? (
                        <>
                          <span>{formatFileSize(attachment.file_size)}</span>
                          <span>•</span>
                        </>
                      ) : null}
                      <span>
                        {formatDistanceToNow(new Date(attachment.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => downloadFile(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

