import { getComercialCategories, createComercialTicket } from "../actions";
import { getUserUnits, getUserFixedUnit } from "@/lib/units";
import { ComercialForm } from "../components";

export default async function NovoComercialPage() {
  const [categories, units, fixedUnit] = await Promise.all([
    getComercialCategories(),
    getUserUnits(),
    getUserFixedUnit(),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <ComercialForm
        categories={categories}
        units={units}
        fixedUnit={fixedUnit}
        onSubmit={createComercialTicket}
      />
    </div>
  );
}
