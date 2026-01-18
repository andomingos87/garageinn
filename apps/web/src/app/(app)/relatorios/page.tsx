import { redirect } from "next/navigation";

/**
 * Hub de relatórios - redireciona para relatórios de chamados
 */
export default function RelatoriosPage() {
  redirect("/relatorios/chamados");
}
