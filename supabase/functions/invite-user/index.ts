/**
 * Edge Function: invite-user
 * 
 * Cria um novo usuário no sistema enviando um convite por email.
 * 
 * Requisitos:
 * - Usuário chamador deve estar autenticado
 * - Usuário chamador deve ter permissão para criar usuários (admin ou users:create)
 * - Email deve ser válido e não estar em uso
 * 
 * Funcionalidades:
 * - Envia convite via supabase.auth.admin.inviteUserByEmail()
 * - Cria registro em profiles com status 'pending'
 * - Vincula roles em user_roles (se fornecidas)
 * - Registra ação em audit_logs
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Roles que podem criar usuários
const ALLOWED_CREATOR_ROLES = ["Administrador", "Desenvolvedor", "Diretor"];

interface InviteUserRequest {
  email: string;
  full_name: string;
  phone?: string;
  cpf?: string;
  role_ids?: string[];
}

interface InviteUserResponse {
  user_id: string;
  message: string;
}

interface ErrorResponse {
  error: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Apenas POST é permitido
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Obter token de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Token de autorização não fornecido" } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Criar cliente Supabase com service role para operações admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verificar usuário autenticado usando o token JWT
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obter body da requisição
    const body: InviteUserRequest = await req.json();
    const { email, full_name, phone, cpf, role_ids } = body;

    // Validar campos obrigatórios
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!full_name || !full_name.trim()) {
      return new Response(
        JSON.stringify({ error: "Nome é obrigatório" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário chamador tem permissão para criar usuários
    const { data: callerRoles, error: callerRolesError } = await supabaseAdmin
      .from("user_roles")
      .select(`
        role:roles(
          name,
          is_global
        )
      `)
      .eq("user_id", callerUser.id);

    if (callerRolesError) {
      console.error("Erro ao buscar roles do chamador:", callerRolesError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar permissões" } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se tem role permitida E é global (ou é RH com permissão)
    const hasGlobalPermission = callerRoles?.some((ur) => {
      const role = ur.role as { name: string; is_global: boolean } | null;
      return role && ALLOWED_CREATOR_ROLES.includes(role.name) && role.is_global;
    });

    // Verificar também se é do RH (pode criar usuários)
    const isRH = callerRoles?.some((ur) => {
      const role = ur.role as { name: string; is_global: boolean } | null;
      // RH com cargos específicos pode criar usuários
      return role && ["Analista Júnior", "Analista Pleno", "Analista Sênior", "Supervisor", "Gerente"].includes(role.name);
    });

    // Buscar departamento do chamador para verificar se é RH
    const { data: callerRolesWithDept } = await supabaseAdmin
      .from("user_roles")
      .select(`
        role:roles(
          name,
          department:departments(name)
        )
      `)
      .eq("user_id", callerUser.id);

    const isRHDepartment = callerRolesWithDept?.some((ur) => {
      const role = ur.role as { name: string; department: { name: string } | null } | null;
      return role?.department?.name === "RH";
    });

    if (!hasGlobalPermission && !(isRH && isRHDepartment)) {
      return new Response(
        JSON.stringify({ 
          error: "Você não tem permissão para criar usuários. Apenas Administradores, Desenvolvedores ou RH podem usar esta funcionalidade." 
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o email já está em uso
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id, email, deleted_at")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existingUser && !existingUser.deleted_at) {
      return new Response(
        JSON.stringify({ error: "Este email já está em uso" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enviar convite via Supabase Auth
    const redirectUrl = `${req.headers.get("origin") || supabaseUrl}/auth/callback`;
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: redirectUrl,
        data: {
          full_name: full_name.trim(),
          phone: phone?.trim() || null,
          cpf: cpf?.trim() || null,
        },
      }
    );

    if (inviteError) {
      console.error("Erro ao enviar convite:", inviteError);
      return new Response(
        JSON.stringify({ 
          error: inviteError.message || "Erro ao enviar convite de email" 
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!inviteData?.user) {
      return new Response(
        JSON.stringify({ error: "Erro ao criar usuário" } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const newUserId = inviteData.user.id;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Criar/atualizar registro em profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        email: email.trim().toLowerCase(),
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        cpf: cpf?.trim() || null,
        status: "pending",
        invitation_sent_at: now.toISOString(),
        invitation_expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: "id",
      });

    if (profileError) {
      console.error("Erro ao criar profile:", profileError);
      // Não falha - o trigger do auth pode ter criado
    }

    // Vincular roles se fornecidas
    if (role_ids && role_ids.length > 0) {
      const roleInserts = role_ids.map(roleId => ({
        user_id: newUserId,
        role_id: roleId,
      }));

      const { error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .insert(roleInserts);

      if (rolesError) {
        console.error("Erro ao vincular roles:", rolesError);
        // Não falha a operação, apenas loga
      }
    }

    // Registrar ação para auditoria
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: callerUser.id,
        action: "invite_user",
        resource_type: "user",
        resource_id: newUserId,
        details: {
          new_user_email: email.trim().toLowerCase(),
          new_user_name: full_name.trim(),
          role_ids: role_ids || [],
          caller_email: callerUser.email,
          timestamp: now.toISOString(),
        },
      });

    if (auditError) {
      console.warn("Aviso: Não foi possível registrar auditoria:", auditError.message);
    }

    // Retornar resposta de sucesso
    const response: InviteUserResponse = {
      user_id: newUserId,
      message: `Convite enviado com sucesso para ${email}`,
    };

    console.log(`Usuário convidado: ${email} por ${callerUser.email}`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na função invite-user:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
