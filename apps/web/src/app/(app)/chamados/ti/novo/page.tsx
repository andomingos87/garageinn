import { Laptop } from "lucide-react";
import { getUserUnits, getUserFixedUnit } from "@/lib/units";
import { AccessDenied } from "@/components/auth/access-denied";
import { createTiTicket, getTiAccessContext, getTiCategories } from "../actions";
import { TiTicketForm } from "../components";

export default async function NovoChamadoTiPage() {
  const access = await getTiAccessContext();
  if (!access.canAccess) {
    return <AccessDenied />;
  }

  const [categories, units, fixedUnit] = await Promise.all([
    getTiCategories(),
    getUserUnits(),
    getUserFixedUnit(),
  ]);

  async function handleCreateTicket(formData: FormData) {
    "use server";
    return createTiTicket(formData);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Laptop className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">
            Novo Chamado de TI
          </h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Preencha o formulario para solicitar suporte tecnico
        </p>
      </div>

      <div className="max-w-3xl">
        <TiTicketForm
          categories={categories}
          units={units}
          fixedUnit={fixedUnit}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  );
}
