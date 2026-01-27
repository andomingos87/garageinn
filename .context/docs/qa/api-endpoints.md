# API Endpoints (Web + Supabase)

This document lists the API endpoints available in the **GarageInn** repository and how they are implemented/consumed. The project uses two main “API layers”:

1. **Next.js Route Handlers (Web)** under `apps/web/src/app/api/**`  
   Used primarily for server-side generation of files (PDF/Excel) and other web-only endpoints.
2. **Supabase Edge Functions** under `supabase/functions/**`  
   Used for privileged operations (admin/invite/impersonation/test users), typically called from the web app (or scripts) via Supabase Functions.

If you’re looking for “business CRUD endpoints”, most of the app talks directly to Supabase (tables, RPC, storage) through the Supabase client and server actions (not REST endpoints). See:
- `apps/web/src/lib/supabase/**`
- `apps/web/src/app/(app)/**/actions.ts`
- `apps/mobile/src/lib/supabase/**`
- `apps/mobile/src/modules/**/services/**`

---

## Conventions & How to Locate Endpoints

### Next.js API Routes (Route Handlers)
**Where:** `apps/web/src/app/api/**/route.ts` (and subfolders)

**URL shape:** `/api/<path-from-app/api>`  
Example: `apps/web/src/app/api/relatorios/supervisao/pdf/route.ts` → `GET /api/relatorios/supervisao/pdf`

**Typical use-case:** Generate and return binary files (PDF/Excel) for reports and checklists.

### Supabase Edge Functions
**Where:** `supabase/functions/<function-name>/index.ts`

**Invocation:** via Supabase Functions API  
- Local: `http://localhost:54321/functions/v1/<function-name>`
- Hosted: `https://<project-ref>.supabase.co/functions/v1/<function-name>`

**Auth:** usually requires a valid Supabase JWT, and some functions require **service role** or admin privileges.

---

## Next.js (Web) API Endpoints

These endpoints are implemented under `apps/web/src/app/api/**`.

### Reports — Supervisão (Supervision)

#### `GET /api/relatorios/supervisao/pdf`
**Source:** `apps/web/src/app/api/relatorios/supervisao/pdf`

Generates a **PDF** version of the supervision report.

**Typical response:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="...pdf"` (implementation-dependent)

#### `GET /api/relatorios/supervisao/excel`
**Source:** `apps/web/src/app/api/relatorios/supervisao/excel`

Generates an **Excel** version of the supervision report.

**Typical response:**
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

### Reports — Chamados (Tickets)

#### `GET /api/relatorios/chamados/pdf`
**Source:** `apps/web/src/app/api/relatorios/chamados/pdf`

Generates a **PDF** tickets report.

#### `GET /api/relatorios/chamados/excel`
**Source:** `apps/web/src/app/api/relatorios/chamados/excel`

Generates an **Excel** tickets report.

---

### Checklists

#### `GET /api/checklists/:executionId/pdf`
**Source:** `apps/web/src/app/api/checklists/[executionId]/pdf`

Generates a **PDF** for a specific checklist execution.

**Path params:**
- `executionId` (string): checklist execution identifier used by the backend.

**Typical response:**
- `Content-Type: application/pdf`

---

## Supabase Edge Functions

These functions live under `supabase/functions/**` and expose HTTP endpoints at `/functions/v1/<name>`.

### `POST /functions/v1/invite-user`
**Source:** `supabase/functions/invite-user/index.ts`  
**Types:**
- `InviteUserRequest`
- `InviteUserResponse`
- `ErrorResponse`

Invites a user (typically by email) into the system. This is usually an admin-only capability.

**Request body (shape):**
- See `InviteUserRequest` in `supabase/functions/invite-user/index.ts`

**Response (shape):**
- See `InviteUserResponse`

**Error response:**
- See `ErrorResponse`

---

### `POST /functions/v1/impersonate-user`
**Source:** `supabase/functions/impersonate-user/index.ts`  
**Types:**
- `ImpersonateRequest`
- `ImpersonateResponse`
- `ErrorResponse`

Creates an impersonation session/token so an admin can act as another user (useful for support/debugging).

**Related web service:**
- `apps/web/src/lib/services/impersonation-service.ts` (defines `ImpersonateResponse`, `ImpersonateError`)
- `apps/web/src/lib/auth/impersonation.ts` (client-side impersonation state)

---

### `POST /functions/v1/create-test-users`
**Source:** `supabase/functions/create-test-users/index.ts`  
**Types:**
- `TestUser`

Creates test users for QA/dev environments.

> Tip: this is often used by local development scripts or QA workflows. Ensure it is disabled or protected in production.

---

## Authentication & Authorization Notes

### Web (Next.js) API routes
These routes run server-side in the web app. Access control is typically enforced by:
- Supabase auth on the server (reading cookies/session)
- Role/permission checks in server code

Look for enforcement patterns in:
- `apps/web/src/lib/auth/**`
- `apps/web/src/hooks/use-permissions.ts`
- `apps/web/src/lib/auth/rbac.ts`
- `apps/web/scripts/validate-rbac.ts` (RBAC validation logic)

### Supabase Edge Functions
Edge Functions often require:
- A user JWT (`Authorization: Bearer <token>`)
- Role checks (admin/service role), depending on the function

---

## Usage Examples

### Calling a Next.js report endpoint (browser download)
```ts
// Opens in a new tab and triggers file download depending on headers.
window.open("/api/relatorios/chamados/pdf", "_blank");
```

### Calling a Supabase Edge Function (client-side)
```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const { data, error } = await supabase.functions.invoke("invite-user", {
  body: {
    // ...fields per InviteUserRequest
  },
});

if (error) throw error;
console.log(data);
```

---

## Related Files (Cross-References)

- **Supabase types & database**
  - `apps/web/src/lib/supabase/database.types.ts`
  - `apps/web/src/lib/supabase/custom-types.ts`

- **Impersonation (web)**
  - `apps/web/src/lib/services/impersonation-service.ts`
  - `apps/web/src/lib/auth/impersonation.ts`
  - `supabase/functions/impersonate-user/index.ts`

- **Web report UI (likely callers of `/api/relatorios/**`)**
  - `apps/web/src/app/(app)/relatorios/**`

---

## Adding a New Endpoint

### Add a new web API route (Next.js)
1. Create a folder under `apps/web/src/app/api/<path>/`
2. Add `route.ts` exporting `GET`, `POST`, etc.
3. Ensure appropriate auth/permission checks.
4. Update this doc with method + URL + purpose.

### Add a new Supabase Edge Function
1. Create `supabase/functions/<name>/index.ts`
2. Define request/response types (keep them in the same file for discoverability)
3. Enforce authorization (JWT, admin checks)
4. Deploy and document the function under “Supabase Edge Functions”.

---

## Endpoint Inventory (Quick List)

### Web (Next.js)
- `GET /api/relatorios/supervisao/pdf`
- `GET /api/relatorios/supervisao/excel`
- `GET /api/relatorios/chamados/pdf`
- `GET /api/relatorios/chamados/excel`
- `GET /api/checklists/:executionId/pdf`

### Supabase Edge Functions
- `POST /functions/v1/invite-user`
- `POST /functions/v1/impersonate-user`
- `POST /functions/v1/create-test-users`
