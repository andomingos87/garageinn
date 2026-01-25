# CLAUDE.md - Web App

This file provides guidance specific to the Next.js web application.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **TypeScript**: 5.x (strict mode)
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Playwright E2E

## Commands

```bash
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production (runs typecheck first)
npm run lint:fix        # Auto-fix ESLint errors
npm run format          # Format with Prettier
npm run typecheck       # TypeScript check
npm run test:e2e        # Run Playwright tests
npm run test:e2e:ui     # Playwright with UI
npm run test:e2e:debug  # Debug Playwright tests
```

## Directory Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (layout with sidebar)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── chamados/       # Tickets hub + type-specific subdirectories
│   │   │   ├── compras/    # Purchase tickets
│   │   │   ├── manutencao/ # Maintenance tickets
│   │   │   ├── rh/         # HR tickets
│   │   │   ├── ti/         # IT tickets
│   │   │   ├── sinistros/  # Claims tickets
│   │   │   ├── comercial/  # Commercial tickets
│   │   │   └── financeiro/ # Financial tickets
│   │   ├── checklists/     # Checklist management
│   │   ├── usuarios/       # User management
│   │   ├── unidades/       # Unit management
│   │   ├── configuracoes/  # System settings
│   │   └── relatorios/     # Reports
│   └── (auth)/             # Public auth routes
├── components/
│   ├── layout/             # App shell, sidebar, header
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
└── lib/
    ├── auth/               # RBAC system
    │   ├── permissions.ts  # Role/permission definitions
    │   ├── rbac.ts         # Permission checking utilities
    │   ├── impersonation.ts# User impersonation logic
    │   └── ti-access.ts    # TI department access rules
    └── supabase/           # Supabase clients
        ├── client.ts       # Browser client
        ├── server.ts       # Server-side client
        └── middleware.ts   # Auth middleware
```

## Conventions

### Route Structure

Each route follows this pattern:
- `page.tsx` - Page component (Server Component by default)
- `actions.ts` - Server Actions for the route
- `loading.tsx` - Loading UI (optional)
- `components/` - Route-specific components
- `[id]/` - Dynamic route segments

### Path Alias

Use `@/*` for imports from `src/*`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
```

### Server Actions

Co-locate Server Actions with pages in `actions.ts`:
```typescript
// src/app/(app)/chamados/actions.ts
"use server";

export async function createTicket(formData: FormData) {
  // ...
}
```

### Component Patterns

- Server Components are the default
- Use `"use client"` directive only when needed
- Prefer composition over prop drilling
- Export components via `index.ts` barrel files

## RBAC System

### Role Hierarchy

1. **Global Roles** (full `admin:all` access):
   - Desenvolvedor
   - Diretor
   - Administrador

2. **Department Roles** (scoped permissions):
   - Gerente [Department]
   - Supervisor [Department]
   - Encarregado [Department]
   - Manobrista (Operações only)

### Permission Types

- `users:read`, `users:create`, `users:update`, `users:delete`
- `units:read`, `units:create`, `units:update`, `units:delete`
- `tickets:[type]:read/create/update/delete/triage/close`
- `checklists:read`, `checklists:create`, `checklists:execute`, `checklists:configure`
- `settings:read`, `settings:update`
- `reports:read`, `reports:export`
- `admin:all` (superuser access)

### Checking Permissions

```typescript
import { hasPermission, canAccessTicketType } from "@/lib/auth/rbac";

// In Server Components/Actions
const canEdit = await hasPermission(userId, "tickets:compras:update");

// For ticket type access
const canView = await canAccessTicketType(userId, "compras", "read");
```

## E2E Testing

Tests are in the `e2e/` directory using Playwright:

```typescript
// e2e/example.spec.ts
import { test, expect } from "@playwright/test";

test("should load dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

### Test Fixtures

Auth fixtures are in `e2e/fixtures/auth.ts` for authenticated tests.

### Screenshots

Save validation screenshots to `.playwright-mcp/` when using Playwright MCP.

## Database

### Supabase Clients

```typescript
// Client-side
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Server-side (Server Components, Actions, Route Handlers)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### Type Generation

Regenerate types after schema changes:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

## Common Patterns

### Form Handling

Use Server Actions with `useActionState`:
```typescript
"use client";
import { useActionState } from "react";
import { createTicket } from "./actions";

export function TicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, null);
  return <form action={formAction}>...</form>;
}
```

### Data Fetching

Prefer Server Components for data fetching:
```typescript
// page.tsx (Server Component)
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("tickets").select("*");
  return <TicketList tickets={data} />;
}
```

### Toast Notifications

Use Sonner for notifications:
```typescript
import { toast } from "sonner";
toast.success("Ticket created successfully");
toast.error("Failed to create ticket");
```
