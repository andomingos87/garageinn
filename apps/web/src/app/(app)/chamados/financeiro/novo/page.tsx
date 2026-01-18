import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getFinanceiroCategories } from "../actions";
import { getUserUnits, getUserFixedUnit } from "@/lib/units";
import { FinanceiroForm } from "../components";

export default async function NovoChamadoFinanceiroPage() {
  const [categories, units, fixedUnit] = await Promise.all([
    getFinanceiroCategories(),
    getUserUnits(),
    getUserFixedUnit(),
  ]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/chamados/financeiro">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Link>
      </Button>

      {/* Form */}
      <FinanceiroForm
        categories={categories}
        units={units}
        fixedUnitId={fixedUnit?.id || null}
      />
    </div>
  );
}
