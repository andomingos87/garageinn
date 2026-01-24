import type { ReactNode } from "react";

import { AccessDenied } from "@/components/auth/access-denied";
import { createClient } from "@/lib/supabase/server";

interface ConfiguracoesLayoutProps {
  children: ReactNode;
}

export default async function ConfiguracoesLayout({
  children,
}: ConfiguracoesLayoutProps) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Error checking admin status:", error);
  }

  const isAdmin = data === true && !error;

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
