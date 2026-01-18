# Frontend Specialist Agent Playbook

## Mission
To design, implement, and maintain high-quality, accessible, and performant user interfaces for the GarageInn web application. The agent ensures consistent UI patterns across dashboards, ticket management systems, and configuration modules while integrating seamlessly with Supabase and Next.js App Router.

## Focus Areas
- **App Directory (`src/app`)**: Route-specific layouts and pages, grouped by `(auth)` and `(app)` (authenticated core).
- **Component Architecture**: 
  - `src/components/ui`: Low-level, reusable Shadcn-based primitives.
  - `src/components/layout`: Global shell components (Sidebar, Header, Shell).
  - `Feature Components`: Located within their respective route folders (e.g., `src/app/(app)/usuarios/components`).
- **State & Logic**: 
  - `src/hooks`: Custom hooks for Auth, Permissions, and Profile management.
  - `src/lib/auth`: RBAC (Role-Based Access Control) implementation.
- **Data Flow**: Server Actions (`actions.ts`) located within feature directories.

## Core Workflows

### 1. Implementing a New Feature Page
When creating a new route (e.g., `/manutencao`):
1. **Define the Route**: Create `src/app/(app)/feature-name/page.tsx`.
2. **Setup Server Actions**: Create `actions.ts` in the same directory to handle data fetching/mutations via Supabase.
3. **Build the Page Structure**: Use a Server Component for the main page to fetch data.
4. **Delegate to Components**: Create a `components/` sub-folder for specific UI parts (table, filters, cards).
5. **Apply Permissions**: Wrap sensitive UI or logic with `RequirePermission` or `isAdmin`.

### 2. Creating Reusable UI Components
1. **Style with Tailwind**: Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging.
2. **Responsive Design**: Use the `useIsMobile` hook for viewport-specific logic.
3. **Accessibility**: Follow Radix UI patterns (already integrated via `components/ui`).
4. **Consistency**: Use existing Badge patterns for statuses (see `src/app/(app)/chamados/components/status-badge.tsx`).

### 3. Handling Permissions and Auth
1. **Client Side**: Use `usePermissions()` hook to check for specific capabilities.
2. **Component Protection**: Wrap components in `<RequirePermission permission="specific:action">`.
3. **Server Side**: Check permissions within Server Actions using `hasPermission` or `isAdmin` from `src/lib/auth/rbac.ts`.

## Best Practices & Conventions

### Styling & UI
- **Tailwind CSS**: Strict adherence to Tailwind for all styling.
- **Icons**: Use `Lucide-React` as the primary icon set.
- **Loading States**: Implement `loading.tsx` for route segments or Skeleton components for granular loading.
- **Forms**: Use `React Hook Form` combined with `Zod` for validation (see `src/app/(app)/unidades/components/unit-form.tsx`).

### Data Fetching
- **Server Components**: Prefer fetching data in Server Components and passing props down.
- **Server Actions**: Centralize all mutations and Supabase calls in feature-specific `actions.ts` files.
- **Real-time**: Use `createClient` from `src/lib/supabase/client.ts` for client-side subscriptions if needed.

### Code Organization
- **Prop Typing**: Always define TypeScript interfaces for props (e.g., `UsersTableProps`).
- **Feature Encapsulation**: Keep components, actions, and constants together within the feature's directory under `src/app/(app)/...`.
- **Naming**: Use PascalCase for components and kebab-case for directories.

## Key Project Resources

### Essential Key Files
- **Global Layout**: `src/components/layout/app-shell.tsx`
- **Navigation**: `src/components/layout/app-sidebar.tsx` & `user-nav.tsx`
- **Auth Hooks**: `src/hooks/use-auth.ts` & `use-permissions.ts`
- **Utility**: `src/lib/utils.ts` (contains `cn` and URL helpers)

### Reference Implementations
- **Data Table Pattern**: `src/app/(app)/usuarios/components/users-table.tsx`
- **Complex Form Pattern**: `src/app/(app)/chamados/sinistros/components/claim-form.tsx`
- **Status Badges**: `src/app/(app)/unidades/components/unit-status-badge.tsx`
- **Dialog/Modals**: `src/app/(app)/usuarios/components/impersonate-dialog.tsx`

## Common Task Checklist

- [ ] **New Route**: Did you add the route to the `AppSidebar` in `src/components/layout/app-sidebar.tsx`?
- [ ] **Permissions**: Is the new feature protected by the correct RBAC permission?
- [ ] **Responsive**: Have you tested the view with the `useIsMobile` hook or Tailwind's `sm/md/lg` breakpoints?
- [ ] **Errors**: Are Server Action errors handled via `toast` notifications on the client?
- [ ] **Performance**: Are you using Client Components (`"use client"`) only where interactive state is required?

## Hand-off Protocol
- Ensure all new components are exported if intended for reuse.
- Document any new permission keys added to `src/lib/auth/permissions.ts`.
- Verify that Supabase types are updated if the database schema changed during frontend development.
