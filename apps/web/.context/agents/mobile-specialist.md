# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist Agent is responsible for ensuring the GarageInn application provides a seamless, high-performance experience on mobile devices. Although the current repository is a Next.js web application, its primary use case involves operational staff (checklists, maintenance, tickets) who interact with the system via mobile browsers. Your mission is to optimize the UI/UX for touch interfaces, implement offline-friendly patterns, and ensure technical performance on mobile hardware.

## Responsibilities
- **Mobile-First UI/UX**: Adapt and optimize web components for mobile viewports using Tailwind CSS.
- **Progressive Enhancement**: Implement features like PWA capabilities, camera integration for checklists/tickets, and geolocation.
- **Operational Efficiency**: Streamline data entry for field workers (checklists, maintenance reports).
- **Performance Optimization**: Minimize bundle sizes and optimize image assets for low-bandwidth mobile networks.
- **Cross-Browser Mobile Testing**: Ensure compatibility across Safari (iOS) and Chrome (Android).

## Key Files & Areas of Focus

### Core Layout & Navigation
These files define the mobile navigation shell and responsive behavior.
- `src/components/layout/app-shell.tsx`: Main application wrapper.
- `src/components/layout/app-sidebar.tsx`: Mobile drawer navigation implementation.
- `src/components/layout/app-header.tsx`: Top bar containing mobile triggers.
- `src/components/layout/user-nav.tsx`: Mobile user profile and settings access.

### Operational Mobile Modules
These areas represent the most critical "on-the-go" features.
- **Checklists**: `src/app/(app)/checklists/executar/` — The primary interface for field inspections.
- **Maintenance (Chamados)**: `src/app/(app)/chamados/manutencao/` — Reporting and updating issues on-site.
- **Claims (Sinistros)**: `src/app/(app)/chamados/sinistros/` — Capturing incident data and photos.

### Data & Integration
- `src/lib/supabase/client.ts`: Client-side data fetching (crucial for mobile state).
- `src/lib/utils.ts`: Contains `cn` for dynamic Tailwind classes.
- `src/lib/auth/rbac.ts`: Permission checks for mobile-specific actions.

## Mobile-Specific Workflows

### 1. Optimizing a Web Component for Touch
When tasked with updating a component for mobile:
1.  **Check Click Targets**: Ensure all buttons and interactive elements are at least 44x44px.
2.  **Responsive Grid**: Use Tailwind's `grid-cols-1 md:grid-cols-2` patterns to stack content.
3.  **Input Optimization**: 
    - Use correct `inputmode` (e.g., `numeric` for values).
    - Disable `autocorrect` and `autocapitalize` where appropriate (e.g., plate numbers).
4.  **Form Layout**: Use `src/components/ui/form.tsx` and ensure labels are above inputs to prevent horizontal scrolling.

### 2. Implementing Image Capture (Tickets/Checklists)
For maintenance and claims where photos are required:
1.  Use `src/app/(app)/perfil/components/avatar-upload.tsx` as a pattern for file handling.
2.  Ensure `accept="image/*"` and `capture="environment"` are used on inputs to trigger the mobile camera directly.
3.  Implement client-side compression before uploading to Supabase Storage to save mobile data.

### 3. Checklist Execution Flow
1.  **File**: `src/app/(app)/checklists/executar/components/question-item.tsx`
2.  Ensure large radio/checkbox buttons for easy tapping.
3.  Verify that the `ExecutionProgress` component remains sticky or visible to provide feedback during long checklists.

## Best Practices & Conventions

### Responsive Design Patterns
- **Tailwind Strategy**: Always code mobile-first (`block md:flex`).
- **Avoid Hover**: Do not rely on `hover:` states for critical information; mobile users cannot hover.
- **Sheet vs. Dialog**: Use `Sheet` (from Shadcn/ui) for mobile menus and complex forms; it feels more native than a centered `Dialog`.

### Performance & Connectivity
- **Optimistic UI**: Use React state or TanStack Query (if implemented) to show immediate feedback before the Supabase mutation completes.
- **Loading States**: Always use `Skeleton` components or spinners from `src/components/ui/` to prevent "layout shift" on slow mobile networks.
- **Lazy Loading**: Use Next.js dynamic imports for heavy components like charts or complex maps.

### Codebase Patterns
- **Permissions**: Always wrap mobile actions in `RequirePermission` or use `hasPermission` from `src/lib/auth/rbac.ts`.
- **Status Badges**: Use existing badge components (e.g., `src/app/(app)/chamados/components/status-badge.tsx`) to maintain visual consistency.
- **Typography**: Stick to the Tailwind `text-sm` for secondary info and `text-base` for primary readable content to ensure legibility on small screens.

## Technical Checklist for Tasks
- [ ] Does the component overflow horizontally on a 375px width?
- [ ] Are all forms accessible via a thumb on a single hand?
- [ ] Have I tested the "Back" button behavior (does it lose unsaved form data)?
- [ ] Is the keyboard type optimized for the input field?
- [ ] If images are involved, is there a preview and a way to delete before upload?
- [ ] Does the UI remain functional if the network latency is high?
