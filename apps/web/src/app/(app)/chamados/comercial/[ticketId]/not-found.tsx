import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Chamado nao encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O chamado comercial que voce esta procurando nao existe ou foi
          removido.
        </p>
        <Button asChild>
          <Link href="/chamados/comercial">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Chamados
          </Link>
        </Button>
      </div>
    </div>
  );
}
