"use client";

import {
  Building2,
  CheckSquare,
  Home,
  MessageSquareMore,
  Settings,
  ShieldCheck,
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
} from "@/components/ui/sidebar";
import { RequirePermission } from "@/components/auth/require-permission";
import type { Permission } from "@/lib/auth/permissions";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Permissões necessárias para visualizar este menu */
  requirePermission?: Permission | Permission[];
  /** Modo de verificação: 'any' = qualquer permissão, 'all' = todas */
  permissionMode?: "any" | "all";
}

const menuItems: MenuItem[] = [
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
    // Visível para quem pode ler tickets ou admins
    requirePermission: ["tickets:read", "admin:all"],
    permissionMode: "any",
  },
  {
    title: "Checklists",
    href: "/checklists",
    icon: CheckSquare,
  },
  {
    title: "Supervisão",
    href: "/checklists/supervisao",
    icon: ShieldCheck,
    // Visível para quem pode executar checklists (supervisores e admins)
    requirePermission: ["checklists:execute", "admin:all"],
    permissionMode: "any",
  },
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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const menuItemElement = (
      <MenuItemLink
        key={item.href}
        item={item}
        isActive={isActive(item.href)}
      />
    );

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
            <SidebarMenu>{menuItems.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>{configItems.map(renderMenuItem)}</SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
