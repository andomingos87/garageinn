"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Laptop, Loader2, Save } from "lucide-react";
import type { TiCategory } from "../types";
import type { UserUnit } from "@/lib/units";

interface TiTicketFormProps {
  categories: TiCategory[];
  units: UserUnit[];
  fixedUnit?: UserUnit | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function TiTicketForm({
  categories,
  units,
  fixedUnit,
  onSubmit,
}: TiTicketFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    equipment_type: "",
    unit_id: fixedUnit?.id || "",
    description: "",
    perceived_urgency: "",
  });
  const [attachments, setAttachments] = useState<FileList | null>(null);

  const hasUnits = units.length > 0;
  const isUnitFixed = !!fixedUnit;
  const showUnitWarning = !hasUnits && !isUnitFixed;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.length < 5) {
      setError("Titulo deve ter pelo menos 5 caracteres");
      return;
    }
    if (!formData.category_id) {
      setError("Categoria e obrigatoria");
      return;
    }
    if (!formData.equipment_type.trim()) {
      setError("Tipo de equipamento e obrigatorio");
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError("Descricao deve ter pelo menos 10 caracteres");
      return;
    }

    const data = new FormData();
    data.set("title", formData.title);
    data.set("category_id", formData.category_id);
    data.set("equipment_type", formData.equipment_type);
    data.set("unit_id", formData.unit_id);
    data.set("description", formData.description);
    data.set("perceived_urgency", formData.perceived_urgency);

    if (attachments && attachments.length > 0) {
      Array.from(attachments).forEach((file) => {
        data.append("attachments", file);
      });
    }

    startTransition(async () => {
      const result = await onSubmit(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Solicitação de TI
          </CardTitle>
          <CardDescription>
            Informe o problema e os detalhes do equipamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Notebook nao liga"
              disabled={isPending}
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange("category_id", value)}
                disabled={isPending}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment_type">Tipo de Equipamento *</Label>
              <Input
                id="equipment_type"
                value={formData.equipment_type}
                onChange={(e) => handleChange("equipment_type", e.target.value)}
                placeholder="Ex: Notebook, Impressora, Roteador"
                disabled={isPending}
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unidade</Label>
              {showUnitWarning ? (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Voce nao possui unidades vinculadas. Entre em contato com o
                    administrador.
                  </span>
                </div>
              ) : (
                <Select
                  value={formData.unit_id}
                  onValueChange={(value) => handleChange("unit_id", value)}
                  disabled={isPending || isUnitFixed}
                >
                  <SelectTrigger id="unit_id">
                    <SelectValue
                      placeholder={
                        isUnitFixed
                          ? `${fixedUnit?.code} - ${fixedUnit?.name}`
                          : "Selecione a unidade (opcional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perceived_urgency">Urgencia Percebida</Label>
              <Select
                value={formData.perceived_urgency}
                onValueChange={(value) =>
                  handleChange("perceived_urgency", value)
                }
                disabled={isPending}
              >
                <SelectTrigger id="perceived_urgency">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa - Pode esperar</SelectItem>
                  <SelectItem value="medium">Media - Em breve</SelectItem>
                  <SelectItem value="high">Alta - Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o problema com detalhes"
              disabled={isPending}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Anexos (opcional)</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={(e) => setAttachments(e.target.files)}
              disabled={isPending}
              accept="image/*,.pdf,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground">
              Voce pode anexar imagens ou documentos para complementar o chamado.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados/ti">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando chamado...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Criar Chamado
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
