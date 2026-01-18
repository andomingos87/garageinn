# Testing Strategy

This document outlines the testing approach and quality assurance processes for the GarageInn application. Our strategy focuses on maintaining high reliability across our role-based access control (RBAC), complex state transitions in tickets (Purchases, Maintenance, Claims), and the data integrity of our management systems.

## Test Environment & Tools

- **Framework**: [Vitest](https://vitest.dev/) (compatible with Jest syntax, optimized for Vite/Next.js)
- **Library**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component testing
- **Utilities**: `msw` (Mock Service Worker) for API mocking, `jsdom` for browser environment simulation
- **Mocking**: Custom mocks for Supabase clients located in `src/lib/supabase/__tests__/mocks.ts`

## Test Types

### 1. Unit Tests
Focus on isolated logic, utility functions, and individual components.
- **Location**: Adjacent to the source file with `.test.ts` or `.test.tsx` extension.
- **Scope**:
    - Permission logic (`src/lib/auth/rbac.ts`)
    - Utility formatters (`src/lib/utils.ts`)
    - Schema validations (Zod schemas)
    - Pure UI components (buttons, badges, inputs)

**Example**:
```typescript
// src/lib/auth/__tests__/rbac.test.ts
import { hasPermission } from '../rbac';

describe('RBAC System', () => {
  it('should grant access when user has specific permission', () => {
    const permissions = ['units.view', 'units.edit'];
    expect(hasPermission(permissions, 'units.view')).toBe(true);
  });
});
```

### 2. Integration Tests
Verify that multiple parts of the system work together, particularly Server Actions and Hooks.
- **Scope**:
    - **Server Actions**: Testing database interactions (using mocks) and authorization checks.
    - **Custom Hooks**: Testing `usePermissions`, `useAuth`, and `useProfile` with the `renderHook` utility.
    - **Form Submissions**: Testing the flow from user input to action call.

### 3. End-to-End (E2E) & Role Validation
Given the security-sensitive nature of the app, we utilize specific scripts to validate RBAC integrity across the system.
- **RBAC Validation**: Use `scripts/validate-rbac.ts` to ensure role definitions align with expected database permissions.
- **Impersonation Flow**: Tests for the `ImpersonationService` to ensure admins can safely switch contexts without leaking credentials.

## Execution Commands

| Command | Description |
| :--- | :--- |
| `npm run test` | Run all test suites once. |
| `npm run test:watch` | Run tests in interactive watch mode. |
| `npm run test:ui` | Open Vitest UI for a visual debugging experience. |
| `npm run test:coverage` | Generate a code coverage report in `/coverage`. |
| `npm run lint` | Run ESLint and Prettier checks. |

## Quality Gates

To maintain codebase health, the following criteria must be met before merging into `main`:

1.  **Linting & Formatting**: All files must pass `npm run lint`.
2.  **Type Safety**: No TypeScript errors (`tsc --noEmit`).
3.  **Core Coverage**:
    - Auth & Permissions: **100% coverage** required.
    - Server Actions: **>70% coverage** recommended.
    - Utils: **>90% coverage** required.
4.  **Action Safety**: All new Server Actions must include a call to `checkIsAdmin` or appropriate permission validators.

## Testing Best Practices

### Mocking Supabase
Do not use the real Supabase client in unit tests. Import the mocked client from our test utils:
```typescript
import { createMockClient } from '@/lib/supabase/__tests__/mocks';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => createMockClient()
}));
```

### Testing Server Actions
When testing actions in `app/(app)/.../actions.ts`, always test for:
1.  **Unauthorized access**: Ensure the action throws or returns an error if the user is not logged in.
2.  **Forbidden access**: Ensure the action fails if the user lacks the specific `Permission`.
3.  **Validation errors**: Ensure Zod schema validation catches malformed input.

## Troubleshooting

### Flaky Tests
- **Timers**: If testing loaders or timeouts, use `vi.useFakeTimers()`.
- **Async components**: Always use `findBy*` or `waitFor` from React Testing Library for elements that appear after an action.

### Common Issues
- **Missing `vi.mock`**: If a test fails with "cannot read property of undefined (reading 'auth')", you likely forgot to mock the Supabase client.
- **Environment Variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are defined in your `.env.test` file.
- **Zustand State**: When testing components using the sidebar or theme stores, clear the store in `afterEach` to avoid state leakage between tests.
