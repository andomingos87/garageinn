import { redirect } from "next/navigation";
import { canAccessReports } from "./chamados/actions";
import { canAccessSupervisionReports } from "./supervisao/actions";

/**
 * Hub de relatórios - redireciona para relatórios de chamados
 */
export default async function RelatoriosPage() {
  const canAccessChamados = await canAccessReports();
  if (!canAccessChamados) {
    const canAccessSupervisao = await canAccessSupervisionReports();
    if (canAccessSupervisao) {
      redirect("/relatorios/supervisao");
    }
    redirect("/dashboard");
  }

  redirect("/relatorios/chamados");
}
