"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFinanceiroTicket, type FinanceiroCategory } from "../actions";
import { PERCEIVED_URGENCY } from "../constants";

interface FinanceiroFormProps {
  categories: FinanceiroCategory[];
  units: { id: string; name: string; code: string }[];
  fixedUnitId?: string | null;
}

export function FinanceiroForm({
  categories,
  units,
  fixedUnitId,
}: FinanceiroFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createFinanceiroTicket(formData);
      if (result?.error) {
        toast.error(result.error);
      }
      // Se sucesso, o redirect e feito no server action
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Chamado Financeiro</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para abrir um novo chamado para o departamento
          Financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Titulo */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Titulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Digite um titulo para o chamado"
              required
              minLength={3}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Minimo de 3 caracteres
            </p>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category_id">
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select name="category_id" required disabled={isPending}>
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Selecione uma categoria" />
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

          {/* Unidade */}
          <div className="space-y-2">
            <Label htmlFor="unit_id">Unidade</Label>
            <Select
              name="unit_id"
              defaultValue={fixedUnitId || undefined}
              disabled={isPending || !!fixedUnitId}
            >
              <SelectTrigger id="unit_id">
                <SelectValue placeholder="Selecione uma unidade (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.code} - {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fixedUnitId && (
              <p className="text-xs text-muted-foreground">
                Unidade definida automaticamente com base no seu cadastro
              </p>
            )}
          </div>

          {/* Urgencia Percebida */}
          <div className="space-y-2">
            <Label htmlFor="perceived_urgency">Urgencia Percebida</Label>
            <Select name="perceived_urgency" disabled={isPending}>
              <SelectTrigger id="perceived_urgency">
                <SelectValue placeholder="Selecione a urgencia (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {PERCEIVED_URGENCY.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descricao */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descricao / Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva detalhadamente o motivo do chamado..."
              required
              minLength={10}
              rows={5}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Minimo de 10 caracteres
            </p>
          </div>

          {/* Acoes */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Chamado
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
