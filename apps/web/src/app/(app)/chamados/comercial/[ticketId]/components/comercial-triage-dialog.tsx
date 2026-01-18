"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardList, Loader2 } from "lucide-react";
import { PRIORITIES, COMERCIAL_TYPE_LABELS } from "../../constants";
import { triageComercialTicket } from "../../actions";

interface DepartmentMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface ComercialTriageDialogProps {
  ticketId: string;
  ticketNumber: number;
  ticketTitle: string;
  perceivedUrgency: string | null;
  comercialType: string | null | undefined;
  departmentMembers: DepartmentMember[];
}

export function ComercialTriageDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  perceivedUrgency,
  comercialType,
  departmentMembers,
}: ComercialTriageDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!priority) {
      setError("Selecione a prioridade");
      return;
    }

    const formData = new FormData();
    formData.set("priority", priority);
    if (assignedTo) formData.set("assigned_to", assignedTo);
    if (dueDate) formData.set("due_date", dueDate);

    startTransition(async () => {
      const result = await triageComercialTicket(ticketId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setPriority("");
        setAssignedTo("");
        setDueDate("");
        setError(null);
      }
    });
  };

  // Sugerir prioridade baseado na urgencia percebida
  const suggestedPriority =
    perceivedUrgency === "alta"
      ? "high"
      : perceivedUrgency === "media"
        ? "medium"
        : "low";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <ClipboardList className="mr-2 h-4 w-4" />
          Realizar Triagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Triagem do Chamado</DialogTitle>
          <DialogDescription>
            <span className="font-mono">#{ticketNumber}</span> - {ticketTitle}
            {comercialType && (
              <span className="block mt-1 text-xs">
                Tipo: {COMERCIAL_TYPE_LABELS[comercialType] || comercialType}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade *</Label>
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value);
                setError(null);
              }}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                    {p.value === suggestedPriority && " (Sugerido)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {perceivedUrgency && (
              <p className="text-xs text-muted-foreground">
                Urgencia percebida pelo solicitante: {perceivedUrgency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Atribuir a</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assigned_to">
                <SelectValue placeholder="Selecione um responsavel (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {departmentMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Prazo</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar Triagem"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
