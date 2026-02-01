"use client";

import { useState, useTransition } from "react";
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
import {
  Loader2,
  Save,
  ArrowLeft,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type { PurchaseCategory, UserUnit } from "../actions";

interface TicketFormProps {
  categories: PurchaseCategory[];
  units: UserUnit[];
  fixedUnit?: UserUnit | null; // Unidade fixa para Manobrista/Encarregado
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
}

// Unidades de medida comuns
const UNITS_OF_MEASURE = [
  { value: "un", label: "Unidade(s)" },
  { value: "kg", label: "Quilograma(s)" },
  { value: "g", label: "Grama(s)" },
  { value: "l", label: "Litro(s)" },
  { value: "ml", label: "Mililitro(s)" },
  { value: "m", label: "Metro(s)" },
  { value: "m2", label: "Metro² (m²)" },
  { value: "m3", label: "Metro³ (m³)" },
  { value: "cx", label: "Caixa(s)" },
  { value: "pc", label: "Pacote(s)" },
  { value: "rl", label: "Rolo(s)" },
  { value: "par", label: "Par(es)" },
  { value: "jg", label: "Jogo(s)" },
  { value: "kit", label: "Kit(s)" },
];

type PurchaseItemForm = {
  id: string;
  item_name: string;
  quantity: string;
  unit_of_measure: string;
  estimated_price: string;
};

const createItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createEmptyItem = (): PurchaseItemForm => ({
  id: createItemId(),
  item_name: "",
  quantity: "",
  unit_of_measure: "un",
  estimated_price: "",
});

export function TicketForm({
  categories,
  units,
  fixedUnit,
  onSubmit,
}: TicketFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Flags de comportamento baseado no role do usuário
  const isUnitFixed = !!fixedUnit; // Unidade fixa para Manobrista/Encarregado
  const hasUnits = units.length > 0; // Usuário tem unidades disponíveis
  const isUnitRequired = hasUnits; // Obrigatório se tem unidades
  const showUnitWarning = !hasUnits && !isUnitFixed; // Aviso se sem unidades

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    unit_id: fixedUnit?.id || "", // Auto-preencher se tiver unidade fixa
    description: "",
    perceived_urgency: "",
  });
  const [items, setItems] = useState<PurchaseItemForm[]>([createEmptyItem()]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleItemChange = (
    itemId: string,
    field: keyof PurchaseItemForm,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setError(null);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.title.trim() || formData.title.length < 5) {
      setError("Título deve ter pelo menos 5 caracteres");
      return;
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um item para compra");
      return;
    }
    for (const [index, item] of items.entries()) {
      if (!item.item_name.trim() || item.item_name.trim().length < 3) {
        setError(`Nome do item ${index + 1} deve ter pelo menos 3 caracteres`);
        return;
      }
      const quantity = parseInt(item.quantity);
      if (!quantity || quantity <= 0) {
        setError(`Quantidade do item ${index + 1} deve ser maior que zero`);
        return;
      }
      if (item.estimated_price) {
        const price = parseFloat(item.estimated_price);
        if (Number.isNaN(price) || price <= 0) {
          setError(
            `Preço estimado do item ${index + 1} deve ser maior que zero`
          );
          return;
        }
      }
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError("Justificativa deve ter pelo menos 10 caracteres");
      return;
    }

    // Validação de unidade (obrigatória se usuário tem unidades disponíveis)
    if (isUnitRequired && !formData.unit_id) {
      setError("Selecione uma unidade para continuar");
      return;
    }

    const data = new FormData();
    data.set("title", formData.title);
    data.set("category_id", formData.category_id);
    data.set("unit_id", formData.unit_id);
    data.set("description", formData.description);
    data.set("perceived_urgency", formData.perceived_urgency);

    const itemsPayload = items.map((item) => ({
      item_name: item.item_name.trim(),
      quantity: parseInt(item.quantity),
      unit_of_measure: item.unit_of_measure || "un",
      estimated_price: item.estimated_price
        ? parseFloat(item.estimated_price)
        : null,
    }));
    data.set("items", JSON.stringify(itemsPayload));

    startTransition(async () => {
      const result = await onSubmit(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Item Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Itens para Compra
          </CardTitle>
          <CardDescription>
            Adicione todos os itens que precisam ser comprados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Compra de material de limpeza"
              disabled={isPending}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Um título curto e descritivo para o chamado
            </p>
          </div>

          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange("category_id", value)}
                disabled={isPending}
              >
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Itens *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={isPending}
              >
                Adicionar item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isPending}
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`item_name_${item.id}`}>
                        Nome do Item *
                      </Label>
                      <Input
                        id={`item_name_${item.id}`}
                        value={item.item_name}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "item_name",
                            e.target.value
                          )
                        }
                        placeholder="Ex: Detergente Neutro 5L"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity_${item.id}`}>
                        Quantidade *
                      </Label>
                      <Input
                        id={`quantity_${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="Ex: 10"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`unit_${item.id}`}>
                        Unidade de Medida
                      </Label>
                      <Select
                        value={item.unit_of_measure}
                        onValueChange={(value) =>
                          handleItemChange(item.id, "unit_of_measure", value)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger id={`unit_${item.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS_OF_MEASURE.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`estimated_price_${item.id}`}>
                        Preço Estimado (R$)
                      </Label>
                      <Input
                        id={`estimated_price_${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.estimated_price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "estimated_price",
                            e.target.value
                          )
                        }
                        placeholder="Ex: 150.00"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location and Urgency */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Urgência</CardTitle>
          <CardDescription>
            Onde será utilizado e qual a urgência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unidade{" "}
                {isUnitRequired && <span className="text-destructive">*</span>}
              </Label>

              {showUnitWarning ? (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Você não possui unidades vinculadas. Entre em contato com o
                    administrador para vincular sua unidade.
                  </span>
                </div>
              ) : (
                <>
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
                            : "Selecione a unidade"
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
                  {isUnitFixed && (
                    <p className="text-xs text-muted-foreground">
                      Sua unidade foi selecionada automaticamente
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perceived_urgency">Urgência Percebida</Label>
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
                  <SelectItem value="medium">Média - Em breve</SelectItem>
                  <SelectItem value="high">Alta - Urgente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Esta é apenas sua percepção. A prioridade final será definida na
                triagem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Justification */}
      <Card>
        <CardHeader>
          <CardTitle>Justificativa</CardTitle>
          <CardDescription>
            Explique por que você precisa deste item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Justificativa da Solicitação *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva detalhadamente a necessidade desta compra, para que será utilizado, e qualquer informação relevante para a avaliação..."
              disabled={isPending}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres. Quanto mais detalhado, mais rápida será a
              análise.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados/compras">
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
