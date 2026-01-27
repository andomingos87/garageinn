Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.Using code analysis tools to inspect relevant error-handling implementations.# Error Handling

This document describes how the **GarageInn** codebase handles errors across the **mobile app** (React Native) and supporting services, with a focus on:

- **Typed/domain errors** (e.g., `AuthError`, `ChecklistError`) for predictable user-facing behavior
- **Observability** (Sentry) for unexpected failures and diagnostics
- **Practical patterns** to follow when implementing new flows

> Related files (primary references):
>
> - `apps/mobile/src/modules/auth/types/auth.types.ts` (auth error model)
> - `apps/mobile/src/modules/checklists/types/checklist.types.ts` (checklists error model)
> - `apps/mobile/src/lib/observability/sentry.ts` (Sentry integration: `captureException`, breadcrumbs)

---

## Goals & Principles

### 1) Errors should be **actionable**
For expected failures (invalid credentials, missing permission, offline, validation), the UI should be able to:

- show a clear message
- present next steps (retry, re-login, request permission)
- avoid crashing and avoid noisy logging

### 2) Errors should be **typed** when they are part of the domain
If the user can reasonably encounter the error during normal use, prefer a typed error such as:

- `AuthError` (authentication and session flows)
- `ChecklistError` (checklist flows)

Typed errors typically include a **code** (enum) and optionally a message/context.

### 3) Unexpected failures should be **observed**
If something indicates a bug, an unhandled edge case, or an external dependency failure that isn’t mapped to a known domain code:

- capture it via `captureException(...)`
- add breadcrumbs for relevant context
- still show a safe fallback message to the user

---

## Error Types (Domain Errors)

### Auth errors (`AuthError`)

`AuthError` is the central error shape for authentication-related failures on mobile.

Common usage patterns:

- Services throw or return `AuthError` when they can classify the failure into a known `AuthErrorCode`.
- Screens/contexts map `AuthErrorCode` to localized UI messages and actions.

**When to use**
- Login failures (invalid credentials, user disabled)
- Session/token issues
- Password reset flows
- Permission/role constraints directly tied to auth

**Where it lives**
- `apps/mobile/src/modules/auth/types/auth.types.ts`

**Recommended UI behavior**
- Show a specific message for known codes
- Offer retry or navigation (e.g., “Forgot password?”)
- Only send to Sentry if the error is unexpected (unknown code, invariant violation)

---

### Checklist errors (`ChecklistError`)

`ChecklistError` represents failures in checklist flows, commonly:

- data validation (missing required answers)
- sync/upload issues
- remote fetch errors
- permission/access issues

**When to use**
- Any checklist operation that can fail in a predictable way and should produce a user-friendly message.

**Where it lives**
- `apps/mobile/src/modules/checklists/types/checklist.types.ts`

**Recommended UI behavior**
- Provide a clear “what happened” and “what you can do now”
- For sync-related issues: allow retry, show offline state where applicable
- Capture unexpected errors in Sentry with execution/template identifiers as context

---

## Observability (Sentry)

The mobile app includes an observability layer that integrates with Sentry.

**Core functions**
- `captureException(error, context?)` — records exceptions in Sentry
- `addBreadcrumb(...)` — attaches a timeline of events leading up to an error

**Where it lives**
- `apps/mobile/src/lib/observability/sentry.ts`

### When to call `captureException`

Use `captureException` when:

- an error is **not** one of your expected domain error codes
- you detect an impossible state (“should never happen”)
- an upstream SDK throws an unknown exception
- you are about to show a generic error UI because you cannot classify the failure

Do **not** call `captureException` for every expected user error (e.g., invalid password), otherwise Sentry noise becomes unmanageable.

### Add context with breadcrumbs

Breadcrumbs should describe *what the user did* and *what system operation was happening* (without sensitive data).

Examples of good breadcrumbs:
- “User tapped ‘Submit checklist’”
- “Uploading photo for questionId=…”
- “Refreshing tickets list”
- “Supabase request: fetch checklist execution”

---

## Recommended Patterns

### Pattern A — Service returns a typed result (preferred for UI flows)

Use a result shape (e.g., `AsyncState`/`ActionResult`-style) when you want to avoid exception-driven flow in UI code.

**Pros**
- Predictable control flow
- Easy UI branching
- Errors stay typed

**Example (pseudo-pattern)**

```ts
type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

async function login(email: string, password: string): Promise<Result<User, AuthError>> {
  try {
    // ... call provider
    return { ok: true, data: user };
  } catch (e) {
    // map known errors
    return { ok: false, error: new AuthError(AuthErrorCode.InvalidCredentials) };
  }
}
```

UI:

```ts
const result = await login(email, password);

if (!result.ok) {
  // map AuthErrorCode -> message
  setError(result.error);
  return;
}

navigate("Home");
```

---

### Pattern B — Service throws domain errors; UI catches and maps

If existing code already uses exceptions, keep it consistent:

- Throw `AuthError` / `ChecklistError` for expected domain issues
- Throw (or rethrow) unknown errors and capture them near the boundary (screen, effect, or global handler)

```ts
try {
  await checklistService.submitExecution(executionId);
} catch (err) {
  if (err instanceof ChecklistError) {
    showToast(mapChecklistErrorToMessage(err));
  } else {
    captureException(err, { feature: "checklists", executionId });
    showToast("Não foi possível concluir. Tente novamente.");
  }
}
```

---

### Pattern C — Always enrich unexpected errors before capturing

When capturing, include identifiers that help debugging:

- user role (not user email)
- screen name / route
- IDs: ticketId, checklistTemplateId, executionId
- network state if available

```ts
captureException(err, {
  feature: "auth",
  screen: "LoginScreen",
  // avoid sensitive values
});
```

---

## What to Show to Users (Guidelines)

### Prefer clear messages for typed errors
- “Usuário ou senha inválidos.”
- “Você não tem permissão para acessar este recurso.”
- “Sem conexão. Verifique sua internet e tente novamente.”

### Use generic messages for unknown errors
- “Ocorreu um erro inesperado. Tente novamente.”
- Provide a retry action where possible.

### Don’t leak internal details
Avoid showing raw exception strings, stack traces, or backend error payloads directly.

---

## Cross-References

- **Mobile Auth state & errors**
  - `apps/mobile/src/modules/auth/types/auth.types.ts`
  - (Commonly used by) `apps/mobile/src/modules/auth/context/AuthContext.tsx` and auth screens

- **Mobile checklist types & errors**
  - `apps/mobile/src/modules/checklists/types/checklist.types.ts`
  - (Commonly used by) checklist services and execution screens

- **Observability utilities**
  - `apps/mobile/src/lib/observability/sentry.ts` (Sentry integration)
  - `apps/mobile/src/lib/observability/logger.ts` (structured logging, if used in the flow)

---

## Implementation Checklist (for new features)

1. **Define a domain error** (or reuse an existing one) if the failure is expected.
2. **Map upstream errors** (Supabase/network/validation) to domain error codes.
3. **Handle domain errors in UI** with specific messaging and actions.
4. **Capture unexpected errors** with `captureException` and useful context.
5. **Add breadcrumbs** around key user actions and network calls.
6. **Avoid sensitive data** in Sentry context and breadcrumbs.

---
