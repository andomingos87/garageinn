"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building, Tag, FileText } from "lucide-react";

interface FinanceiroInfoProps {
  ticket: {
    description: string;
    perceived_urgency: string | null;
    creator: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    } | null;
    assignee: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    } | null;
    unit: {
      id: string;
      name: string;
      code: string;
    } | null;
    category: {
      id: string;
      name: string;
    } | null;
  };
}

export function FinanceiroInfo({ ticket }: FinanceiroInfoProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Descricao */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Descricao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categoria */}
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">
                {ticket.category?.name || "Nao informada"}
              </p>
            </div>
          </div>

          {/* Unidade */}
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Unidade</p>
              <p className="font-medium">
                {ticket.unit
                  ? `${ticket.unit.code} - ${ticket.unit.name}`
                  : "Nao informada"}
              </p>
            </div>
          </div>

          {/* Urgencia Percebida */}
          {ticket.perceived_urgency && (
            <div>
              <p className="text-sm text-muted-foreground">
                Urgencia Percebida
              </p>
              <Badge variant="outline" className="mt-1">
                {ticket.perceived_urgency.charAt(0).toUpperCase() +
                  ticket.perceived_urgency.slice(1)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pessoas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pessoas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Criador */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.creator?.avatar_url || undefined} />
              <AvatarFallback>
                {ticket.creator?.full_name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Criado por</p>
              <p className="font-medium">
                {ticket.creator?.full_name || "Desconhecido"}
              </p>
            </div>
          </div>

          {/* Responsavel */}
          <div className="flex items-center gap-3">
            {ticket.assignee ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ticket.assignee.avatar_url || undefined} />
                  <AvatarFallback>
                    {ticket.assignee.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Responsavel</p>
                  <p className="font-medium">{ticket.assignee.full_name}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsavel</p>
                  <p className="text-muted-foreground">Nao atribuido</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
