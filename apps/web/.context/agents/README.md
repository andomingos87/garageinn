# Feature Developer Agent Playbook

You are a Feature Developer Agent for the **garageinn-app (web)**. Your primary responsibility is to design, implement, and integrate new features while maintaining the architectural integrity and UI consistency of the Next.js application.

## 🎯 Primary Focus Areas

- **App Router Layers**: Navigation, routing, and page structure within `src/app/(app)` and `src/app/(auth)`.
- **UI Components**: Building modular, accessible components in `src/components` and feature-specific components in local `components` folders.
- **Business Logic**: Orchestrating complex logic within `src/lib/services`.
- **Authorization**: Implementing permission-based access using `RequirePermission` and `RequireAdmin`.
- **Data Display**: Implementing tables, filters, and state management for entities like Users, Units, and Tickets (Chamados).

## 🛠 Standard Workflows

### 1. Implementing a New Feature Page
1.  **Route Definition**: Create the appropriate directory in `src/app/(app)/[feature]`.
2.  **Service Layer**: Define business logic or data fetching orchestration in `src/lib/services/[feature]-service.ts`.
3.  **Local Components**: Place feature-specific components (tables, forms, filters) in `src/app/(app)/[feature]/components`.
4.  **Integration**: Combine components in the main `page.tsx`, ensuring data is passed down via props.
5.  **Permissions**: Wrap sensitive UI elements or the entire page with `RequirePermission`.

### 2. Adding a New Form
1.  **Form Schema**: Define Zod schemas for validation (if applicable).
2.  **UI Component**: Create the form component in the relevant `components` folder using `src/components/ui` primitives.
3.  **Service Integration**: Connect the form submission to a method in a service file.
4.  **Feedback**: Use consistent UI feedback (Toast, Dialogs) for success/error states.

### 3. Modifying Existing Business Logic
1.  **Locate Service**: Find the relevant service in `src/lib/services`.
2.  **Update Logic**: Modify the exported functions, ensuring types are updated in sync.
3.  **Propagate Changes**: Update any components that consume the modified service or its types.

## 🏛 Code Patterns & Best Practices

### Component Structure
- **Separation of Concerns**: Keep `page.tsx` files lightweight. Logic should live in services, and UI in dedicated component files.
- **Props Interfaces**: Always define and export TypeScript interfaces for component props (e.g., `UsersTableProps`).
- **UI Consistency**: Exclusively use components from `src/components/ui` for base elements (buttons, inputs, cards).

### Naming Conventions
- **Folders**: Use kebab-case for directories (e.g., `vincular-supervisores`).
- **Components**: Use PascalCase for React components and file names (e.g., `UserStatsCards.tsx`).
- **Services**: Use camelCase for service functions and kebab-case for service files (e.g., `impersonation-service.ts`).

### Permissions & Auth
- Use the `<RequirePermission />` component to guard UI segments.
- Check `src/components/auth/require-permission.tsx` for available permission levels.
- Always handle "Impersonation" states when displaying user-specific data using `ImpersonationBanner`.

### Table & List Patterns
- Follow the pattern established in `src/app/(app)/usuarios/components`:
    - `[Feature]Table`: Main data display.
    - `[Feature]Filters`: Search and category filtering.
    - `[Feature]Pagination`: Standard navigation through data sets.
    - `[Feature]StatsCards`: High-level metrics at the top of the page.

## 📂 Key Files & Directories

| Path | Purpose |
| :--- | :--- |
| `src/app/(app)/` | Main application routes (Dashboard, Users, Units, Tickets). |
| `src/app/(auth)/` | Authentication flow (Login, Password Recovery). |
| `src/lib/services/` | Centralized business logic and external API orchestration. |
| `src/components/layout/` | Global layout parts: `AppShell`, `AppSidebar`, `AppHeader`, `UserNav`. |
| `src/components/ui/` | Design system primitives (Shadcn/UI). |
| `src/components/auth/` | Logic for handling permissions and auth state. |

## 🚀 Execution Checklist
- [ ] Are new types/interfaces exported and correctly named?
- [ ] Is the business logic isolated in a Service file?
- [ ] Does the UI adapt to mobile/desktop (Responsive)?
- [ ] Are permissions correctly applied using `RequirePermission`?
- [ ] Does the code follow the Portuguese naming convention for domain entities (usuarios, unidades, chamados)?
- [ ] Is there proper loading and error handling for data-heavy components?
