# GAPP - Coding Conventions

This document establishes the coding conventions and standards for the GarageInn App (GAPP) monorepo.

## Project Structure

```
garageinn-app/
├── apps/
│   ├── web/          # Next.js 16 web application
│   └── mobile/       # Expo/React Native mobile app
├── supabase/         # Supabase configuration and Edge Functions
├── projeto/          # Documentation (PRD, specs, tests, database)
└── docs/             # Additional documentation
```

## Language

- **Code**: English (variable names, function names, comments)
- **UI Text**: Portuguese (PT-BR) for user-facing content
- **Documentation**: Portuguese for user docs, English for technical docs

## Naming Conventions

### Files and Folders

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserCard.tsx`, `ClaimForm.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-auth.ts`, `use-permissions.ts` |
| Utilities | kebab-case | `format-date.ts`, `cn.ts` |
| Server Actions | `actions.ts` in feature folder | `chamados/actions.ts` |
| Types | kebab-case or in component file | `types.ts`, `database.types.ts` |
| Constants | kebab-case | `constants.ts`, `status-labels.ts` |

### Variables and Functions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `ticketCount` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL` |
| Functions | camelCase | `getUserProfile()`, `handleSubmit()` |
| React Components | PascalCase | `function UserCard() {}` |
| Types/Interfaces | PascalCase | `interface UserProfile {}` |
| Enums | PascalCase | `enum TicketStatus {}` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case (plural) | `tickets`, `user_roles` |
| Columns | snake_case | `created_at`, `full_name` |
| Foreign Keys | `{table}_id` | `user_id`, `ticket_id` |
| Junction Tables | `{table1}_{table2}` | `user_roles`, `user_units` |

## Code Organization

### Imports Order

1. React/Framework imports
2. Third-party libraries
3. Internal components (`@/components/`)
4. Internal hooks (`@/hooks/`)
5. Internal utilities (`@/lib/`)
6. Types
7. Relative imports

```tsx
// 1. Framework
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal hooks
import { useAuth, usePermissions } from '@/hooks';

// 5. Internal utilities
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// 6. Types
import type { UserProfile } from '@/types';

// 7. Relative imports
import { TicketCard } from './components/ticket-card';
import { STATUS_LABELS } from './constants';
```

### Barrel Exports

Use `index.ts` files for cleaner imports:

```ts
// hooks/index.ts
export { useAuth } from './use-auth';
export { usePermissions } from './use-permissions';

// Usage
import { useAuth, usePermissions } from '@/hooks';
```

### Component Structure

```tsx
'use client'; // Only if needed

// Imports (ordered as above)

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Constants (if specific to this component)
const ITEMS_PER_PAGE = 20;

// Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const router = useRouter();
  const [state, setState] = useState();

  // 2. Derived state / memoization
  const derivedValue = useMemo(() => /* ... */, []);

  // 3. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4. Event handlers
  const handleClick = () => {
    // ...
  };

  // 5. Render helpers (if needed)
  const renderItem = (item: Item) => (
    // ...
  );

  // 6. Main render
  return (
    // ...
  );
}
```

## React Patterns

### Server vs Client Components

- **Default**: Server Components
- **Client Components**: Only when needed (interactivity, hooks, browser APIs)
- Mark with `'use client'` directive at the top

### Server Actions

Place in `actions.ts` files with `'use server'` directive:

```ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTicket(formData: FormData) {
  const supabase = await createClient();
  // ...
  revalidatePath('/chamados');
}
```

### Hooks

- Prefix with `use`
- One hook per file
- Export from barrel `index.ts`

## TypeScript

### Type Definitions

```ts
// Prefer interfaces for objects
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use type for unions, intersections, primitives
type Status = 'active' | 'inactive' | 'pending';
type UserId = string;
```

### Generic Components

```tsx
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  // ...
}
```

## Styling

### Tailwind CSS

- Use utility classes directly
- Use `cn()` for conditional classes
- Follow design system tokens

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center gap-2 p-4',
  'rounded-lg border bg-card',
  isActive && 'border-primary',
  className
)}>
```

### CSS Variables

Reference design system tokens from `globals.css`:

```tsx
<div className="bg-primary text-primary-foreground" />
<div className="text-muted-foreground" />
<div className="border-destructive" />
```

## Git Conventions

### Commit Messages

Follow Conventional Commits:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(tickets): add status filter to claims list
fix(auth): handle expired session redirect
docs(readme): update installation instructions
refactor(hooks): extract shared permission logic
```

### Branch Naming

```
feature/short-description
fix/issue-description
docs/what-documented
refactor/what-refactored
```

## Testing

### Web (Playwright E2E)

- Tests in `apps/web/e2e/`
- Name: `feature.spec.ts`
- Use Page Object pattern for complex flows

### Mobile (Jest)

- Tests alongside code: `__tests__/`
- Name: `Component.test.tsx`
- Minimum 70% coverage for critical paths

## Error Handling

### Client Components

```tsx
try {
  await action();
} catch (error) {
  toast.error('Erro ao processar solicitação');
  console.error('Error details:', error);
}
```

### Server Actions

```ts
export async function action(data: FormData) {
  try {
    // ...
    return { success: true };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Mensagem amigável para o usuário' };
  }
}
```

## Performance

### Data Fetching

- Prefer Server Components for initial data
- Use `Promise.all()` for parallel requests
- Implement pagination for large lists

### Memoization

- `useMemo` for expensive calculations
- `useCallback` for callback props
- Avoid premature optimization

## Accessibility

- Use semantic HTML elements
- Include `aria-*` attributes where needed
- Test with keyboard navigation
- Maintain color contrast ratios

---

_Last updated: January 2025_
