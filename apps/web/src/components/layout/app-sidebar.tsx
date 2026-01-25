"use client";

import {
  BarChart3,
  Building2,
  CheckSquare,
  Home,
  MessageSquareMore,
  Monitor,
  Settings,
  Users,
  Wallet,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { RequirePermission } from "@/components/auth/require-permission";
import { usePermissions } from "@/hooks/use-permissions";
import { useProfile } from "@/hooks/use-profile";
import { canAccessTiArea, TI_DEPARTMENT_NAME } from "@/lib/auth/ti-access";
import type { Permission } from "@/lib/auth/permissions";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Permissões necessárias para visualizar este menu */
  requirePermission?: Permission | Permission[];
  /** Modo de verificação: 'any' = qualquer permissão, 'all' = todas */
  permissionMode?: "any" | "all";
  /** Restringe visualização por departamento */
  requireDepartment?: string;
}

interface SubMenuItem {
  title: string;
  href: string;
  requirePermission?: Permission | Permission[];
  permissionMode?: "any" | "all";
}

const menuItemsBeforeChecklists: MenuItem[] = [
  {
    title: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Chamados",
    href: "/chamados",
    icon: MessageSquareMore,
  },
  {
    title: "Financeiro",
    href: "/chamados/financeiro",
    icon: Wallet,
    // Visível apenas para usuários do departamento Financeiro ou admins
    requireDepartment: "Financeiro",
  },
  {
    title: "TI",
    href: "/chamados/ti",
    icon: Monitor,
    // Visivel apenas para usuarios do departamento TI ou admins
    requireDepartment: TI_DEPARTMENT_NAME,
  },
];

const checklistSubItems: SubMenuItem[] = [
  {
    title: "Abertura",
    href: "/checklists",
  },
  {
    title: "Supervisão",
    href: "/checklists/supervisao",
    requirePermission: "supervision:read",
  },
];

const menuItemsAfterChecklists: MenuItem[] = [
  {
    title: "Unidades",
    href: "/unidades",
    icon: Building2,
    // Oculto para quem não tem permissão de unidades (ex: Manobrista)
    requirePermission: ["units:read", "admin:all"],
    permissionMode: "any",
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: Users,
    // Visível para RH (users:read) e admins
    requirePermission: ["users:read", "admin:all"],
    permissionMode: "any",
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    // Visível para quem pode ver relatórios ou admins
    requirePermission: ["reports:read", "admin:all"],
    permissionMode: "any",
  },
];

const configItems: MenuItem[] = [
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    // Visível para gerentes com settings:read e admins
    requirePermission: ["settings:read", "admin:all"],
    permissionMode: "any",
  },
];

function MenuItemLink({
  item,
  isActive,
}: {
  item: MenuItem;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const { profile, isLoading: profileLoading } = useProfile();

  const hasDepartmentAccess = (department: string) => {
    if (permissionsLoading || profileLoading) return false;
    if (department === TI_DEPARTMENT_NAME) {
      return canAccessTiArea({ isAdmin, roles: profile?.roles });
    }
    if (isAdmin) return true;
    return (
      profile?.roles.some((role) => role.department_name === department) ??
      false
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const isChecklistsSupervisionActive = pathname.startsWith(
    "/checklists/supervisao"
  );
  const isChecklistsActive = pathname.startsWith("/checklists");
  const isChecklistsOpeningActive =
    isChecklistsActive && !isChecklistsSupervisionActive;

  const renderMenuItem = (item: MenuItem) => {
    const menuItemElement = (
      <MenuItemLink
        key={item.href}
        item={item}
        isActive={isActive(item.href)}
      />
    );

    if (item.requireDepartment && !hasDepartmentAccess(item.requireDepartment)) {
      return null;
    }

    if (item.requirePermission) {
      return (
        <RequirePermission
          key={item.href}
          permission={item.requirePermission}
          mode={item.permissionMode || "any"}
        >
          {menuItemElement}
        </RequirePermission>
      );
    }

    return menuItemElement;
  };

  const isChecklistSubActive = (href: string) => {
    if (href === "/checklists") return isChecklistsOpeningActive;
    if (href === "/checklists/supervisao") return isChecklistsSupervisionActive;
    return pathname.startsWith(href);
  };

  const renderChecklistSubItem = (item: SubMenuItem) => {
    const subItemElement = (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          size="sm"
          isActive={isChecklistSubActive(item.href)}
        >
          <Link href={item.href}>{item.title}</Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );

    if (item.requirePermission) {
      return (
        <RequirePermission
          key={item.href}
          permission={item.requirePermission}
          mode={item.permissionMode || "any"}
        >
          {subItemElement}
        </RequirePermission>
      );
    }

    return (
      <SidebarMenuSubItem key={item.href}>
        <SidebarMenuSubButton
          asChild
          size="sm"
          isActive={isChecklistSubActive(item.href)}
        >
          <Link href={item.href}>{item.title}</Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  const renderChecklistsMenu = () => (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isChecklistsActive}
        tooltip="Checklists"
      >
        <Link href="/checklists">
          <CheckSquare className="h-4 w-4" />
          <span>Checklists</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuSub>
        {checklistSubItems.map((item) => renderChecklistSubItem(item))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative h-8 w-32">
            <Image
              src="/logo-garageinn.png"
              alt="GarageInn Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItemsBeforeChecklists.map(renderMenuItem)}
              {renderChecklistsMenu()}
              {menuItemsAfterChecklists.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>{configItems.map(renderMenuItem)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
