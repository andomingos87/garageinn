import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Chamado nao encontrado</h2>
      <p className="text-muted-foreground">
        O chamado que voce esta procurando nao existe ou foi removido.
      </p>
      <Button asChild>
        <Link href="/chamados/financeiro">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Link>
      </Button>
    </div>
  );
}
