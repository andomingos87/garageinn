# Authentication (Web + Mobile)

This repository uses **Supabase Auth** as the single source of truth for authentication across:

- **Web** (`apps/web`) — Next.js App Router
- **Mobile** (`apps/mobile`) — React Native

Authentication is responsible for:

1. Creating and maintaining a Supabase session (access/refresh tokens)
2. Exposing the current auth state to the UI (logged in/out/loading)
3. Enabling protected routes/screens
4. Supporting common flows like login, logout, password recovery/reset
5. (Web) Supporting additional admin flows like **impersonation** (where applicable)

---

## High-level flow

### 1) User signs in
- Web: login UI posts to server actions in `apps/web/src/app/(auth)/login/actions.ts`, which uses Supabase Auth to authenticate and establish a session (cookie-based on the server, depending on the Supabase client setup).
- Mobile: login screen triggers auth methods exposed via the `AuthProvider` context in `apps/mobile/src/modules/auth/context/AuthContext.tsx`.

### 2) Session is persisted
- Supabase persists session tokens.
- The app restores the session on startup and updates UI based on `AuthState`.

### 3) App reads user profile/permissions
Authentication answers **“who are you?”**. Authorization answers **“what can you do?”**.

After auth, the apps typically load:
- Profile data (web hook: `apps/web/src/hooks/use-profile.ts`)
- Permissions/roles (web hook: `apps/web/src/hooks/use-permissions.ts`)
- RBAC helpers (web: `apps/web/src/lib/auth/rbac.ts`, `apps/web/src/lib/auth/permissions.ts`)

### 4) Protected UX
- Web: protected route patterns typically use server-side checks + redirect / access denied components.
- Mobile: `ProtectedView` guard components show an access denied message/screen if the user is missing permissions.

---

## Web authentication

### Relevant files

- UI shell for auth pages:
  - `apps/web/src/app/(auth)/components/auth-card.tsx` (export: `AuthCard`)
- Auth flows (server actions):
  - `apps/web/src/app/(auth)/login/actions.ts`
  - `apps/web/src/app/(auth)/recuperar-senha/actions.ts`
  - `apps/web/src/app/(auth)/redefinir-senha/actions.ts`
- Auth callback handling:
  - `apps/web/src/app/auth/callback/*` (OAuth/magic-link style callbacks)
- Auth state hooks:
  - `apps/web/src/hooks/use-auth.ts` (exports: `useAuth`, `useRequireAuth`)
- Access denied UI:
  - `apps/web/src/components/auth/access-denied.tsx` (export: `AccessDenied`)

### Typical page structure

Auth pages live under the `(auth)` route group:

- `/login`
- `/recuperar-senha` (forgot password)
- `/redefinir-senha` (reset password)

App pages live under `(app)` and are expected to require an authenticated session.

### Using the AuthCard component

`AuthCard` is the common wrapper layout for auth screens (login/forgot/reset). It’s used to keep auth pages visually consistent.

Example (simplified):

```tsx
import { AuthCard } from "../components/auth-card";

export default function LoginPage() {
  return (
    <AuthCard title="Entrar">
      {/* login form */}
    </AuthCard>
  );
}
```

### Requiring authentication in web pages/components

Use `useRequireAuth()` from `apps/web/src/hooks/use-auth.ts` when building client-side gated UI that should redirect or block when no session exists.

Example pattern (conceptual):

```tsx
"use client";

import { useRequireAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;
  return <div>Olá, {user.email}</div>;
}
```

> For server components/routes, prefer server-side session checks (based on your Supabase server client pattern) to avoid flashing protected content.

---

## Mobile authentication

### Relevant files

- Auth context/provider:
  - `apps/mobile/src/modules/auth/context/AuthContext.tsx` (export: `AuthProvider`)
- Auth types:
  - `apps/mobile/src/modules/auth/types/auth.types.ts` (exports: `AuthActions`, `AuthState`, `AuthError`, etc.)
- Auth screens:
  - `apps/mobile/src/modules/auth/screens/LoginScreen.tsx`
  - `apps/mobile/src/modules/auth/screens/ForgotPasswordScreen.tsx`
- Guards:
  - `apps/mobile/src/components/guards/ProtectedView.tsx` (exports: `AccessDeniedMessage`, `AccessDeniedScreen`)

### AuthProvider

Mobile authentication is driven by a React Context that encapsulates:

- current session/user
- loading state
- actions such as sign-in/sign-out
- error handling mapped to `AuthErrorCode`

Wrap the app (typically at the root navigator entry point):

```tsx
import { AuthProvider } from "@/modules/auth/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      {/* Navigators */}
    </AuthProvider>
  );
}
```

### AuthState / AuthActions (mobile)

Defined in `apps/mobile/src/modules/auth/types/auth.types.ts`.

You’ll see these concepts:

- `AuthState`: the current state (e.g., loading, authenticated, unauthenticated, user info)
- `AuthActions`: functions that mutate auth state (sign in, sign out, restore session, etc.)
- `AuthError` + `AuthErrorCode`: normalized errors suitable for UI messages

This gives the app a consistent way to:
- show form errors (invalid credentials, network issues)
- drive navigation (show auth stack vs main tabs)
- avoid duplicating Supabase error parsing throughout screens

### Protecting screens (mobile)

Use the `ProtectedView` guard to block UI when the user lacks a session and/or permissions.

Conceptual usage:

```tsx
import { ProtectedView } from "@/components/guards/ProtectedView";

export function SomeScreen() {
  return (
    <ProtectedView>
      {/* protected content */}
    </ProtectedView>
  );
}
```

If access is denied, the component can display:
- `AccessDeniedMessage` (inline)
- `AccessDeniedScreen` (full screen)

---

## Password recovery & reset

### Web
- Forgot password flow uses `apps/web/src/app/(auth)/recuperar-senha/actions.ts`
- Reset password flow uses `apps/web/src/app/(auth)/redefinir-senha/actions.ts`

These actions return an `ActionResult` type (shared shape across the auth actions) to standardize:
- success boolean/state
- user-friendly error messages

### Mobile
Mobile exposes similar flows via auth services/actions used by:
- `ForgotPasswordScreen.tsx`
- reset/update password screens (if present in the module)

---

## Impersonation (Web, admin feature)

The repo includes an impersonation capability on the web side:

- Service: `apps/web/src/lib/services/impersonation-service.ts`
- State helper: `apps/web/src/lib/auth/impersonation.ts` (export: `ImpersonationState`)
- Edge function: `supabase/functions/impersonate-user/index.ts`

This allows privileged users (typically admin/support) to act as another user for debugging/support workflows.

> Treat impersonation as an authorization-sensitive flow: it must be gated by server-side permission checks and logged/audited where possible.

---

## Testing authentication (Web E2E)

Web E2E tests include auth helpers:

- `apps/web/e2e/fixtures/auth.ts` exports:
  - `login`
  - `loginAsAdmin`, `loginAsSupervisor`, `loginAsGerente`, etc.
  - `logout`
  - `isLoggedIn`

Example usage (pattern from tests):

```ts
import { test } from "@playwright/test";
import { loginAsAdmin } from "./fixtures/auth";

test("admin can access settings", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/configuracoes");
  // assertions...
});
```

These helpers keep tests independent of UI changes in the login screen and speed up authentication setup.

---

## Common pitfalls & conventions

- **Don’t mix auth and permissions**: auth identifies the user; permissions/roles decide access.
- **Prefer server-side checks on web for sensitive routes** to avoid client-side content flashes.
- **Normalize errors**: mobile’s `AuthErrorCode` pattern is a good reference for consistent UX.
- **Keep auth UI consistent**: web uses `AuthCard` for a uniform layout across auth screens.

---

## Related documentation / code references

- Authorization / RBAC:
  - `apps/web/src/lib/auth/rbac.ts`
  - `apps/web/src/lib/auth/permissions.ts`
  - `apps/web/src/hooks/use-permissions.ts`
- Profile loading:
  - `apps/web/src/hooks/use-profile.ts`
- Mobile permission model (types):
  - `apps/mobile/src/modules/user/types/permissions.types.ts`
