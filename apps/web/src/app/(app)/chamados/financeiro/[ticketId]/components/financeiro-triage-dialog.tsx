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
import { Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { triageFinanceiroTicket } from "../../actions";
import { PRIORITIES } from "../../constants";

interface DepartmentMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface FinanceiroTriageDialogProps {
  ticketId: string;
  departmentMembers: DepartmentMember[];
}

export function FinanceiroTriageDialog({
  ticketId,
  departmentMembers,
}: FinanceiroTriageDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    if (!priority) {
      toast.error("Prioridade e obrigatoria");
      return;
    }

    const formData = new FormData();
    formData.set("priority", priority);
    if (assignedTo) formData.set("assigned_to", assignedTo);
    if (dueDate) formData.set("due_date", dueDate);

    startTransition(async () => {
      const result = await triageFinanceiroTicket(ticketId, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Chamado triado com sucesso");
        setOpen(false);
        setPriority("");
        setAssignedTo("");
        setDueDate("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Triar Chamado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Triagem do Chamado</DialogTitle>
          <DialogDescription>
            Defina a prioridade e atribua um responsavel para este chamado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Prioridade <span className="text-destructive">*</span>
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsavel */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Responsavel</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assigned_to">
                <SelectValue placeholder="Selecione um responsavel" />
              </SelectTrigger>
              <SelectContent>
                {departmentMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Previsao de Conclusao</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Triagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
