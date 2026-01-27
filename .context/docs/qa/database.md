# Database (Supabase) — Data Storage & Access

This project uses **Supabase Postgres** as the primary database. Both the **Web app** (`apps/web`) and **Mobile app** (`apps/mobile`) interact with Supabase using a **typed database schema** generated into TypeScript.

The goal is to ensure:
- **Strong typing** for tables, inserts, and updates
- **Consistent access patterns** across apps
- A single source of truth for database structure and enums

---

## Where the database schema types live

### Web (source of truth for types)
- **`apps/web/src/lib/supabase/database.types.ts`**
  - Contains the generated `Database` type and helper generic types used to type Supabase queries.
  - Also exports schema helpers such as `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, and `CompositeTypes`.

### Additional custom types (domain-focused)
- **`apps/web/src/lib/supabase/custom-types.ts`**
  - Defines app-level types built on top of the raw DB types (examples include `AuditLog`, `Unit`, `UserWithRoles`, and status enums like `UserStatus`, `InvitationStatus`, `UnitStatus`).

---

## The central type: `Database`

The generated `Database` type represents the full Supabase schema (tables, views, functions, enums). It is intended to be used when creating a Supabase client so that:

- `from("<table>")` is restricted to known tables
- `select()` results are typed
- `insert()`/`update()` payloads are validated at compile-time

**Referenced symbol**
- `Database` — `apps/web/src/lib/supabase/database.types.ts`

---

## Helper types you’ll use in code

From `apps/web/src/lib/supabase/database.types.ts`:

- **`Tables<"table_name">`**  
  Type of a row returned from a table (the “Row” type).

- **`TablesInsert<"table_name">`**  
  Type for inserting into a table (the “Insert” type). Optional fields match DB defaults and nullable columns.

- **`TablesUpdate<"table_name">`**  
  Type for updating a table (the “Update” type). Typically all properties are optional.

- **`Enums<"enum_name">`**  
  Union type of possible enum values.

These utilities allow you to strongly type your application models without manually duplicating the schema.

---

## Typical access patterns

Although Supabase client initialization may differ between Web and Mobile, the same principle applies: **type the client with `Database`**, then use `Tables*` helpers for explicit typing where useful.

### 1) Typing a table row in application code

```ts
import type { Tables } from "@/lib/supabase/database.types";

type UnitRow = Tables<"units">;
```

Use this when you want to declare variables, component props, or function return types that represent a database record.

---

### 2) Typing insert/update payloads

```ts
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

type NewUnit = TablesInsert<"units">;
type UnitPatch = TablesUpdate<"units">;
```

This reduces runtime bugs by ensuring you only send valid columns and compatible value types.

---

### 3) Typing enums from the schema

```ts
import type { Enums } from "@/lib/supabase/database.types";

type TicketStatus = Enums<"ticket_status">;
```

If the project defines “domain enums” in `custom-types.ts` (like `UserStatus`, `InvitationStatus`, `UnitStatus`), prefer those where they exist, because they typically represent the app’s canonical naming and usage.

---

## Relationship to the rest of the codebase

### Services and data access
In this repository, “database access” is typically wrapped by **service modules** rather than being performed directly in UI components:

- Web services: `apps/web/src/lib/services/*`
- Mobile services: `apps/mobile/src/modules/*/services/*`

This encourages:
- Centralized query logic
- Reuse across screens/pages
- Easier testing and refactoring

### Custom domain types
Use `apps/web/src/lib/supabase/custom-types.ts` when you want:
- Aggregated/denormalized shapes returned by RPCs or complex queries
- Consistent naming for status types and user/unit models

---

## Conventions and best practices

### Prefer generated types over hand-written interfaces
Use:
- `Tables<"...">` for returned row types
- `TablesInsert<"...">` for inserts
- `TablesUpdate<"...">` for updates
- `Enums<"...">` for enums

Avoid manually re-declaring DB fields in separate interfaces—this tends to drift from the real schema.

### Keep domain models close to Supabase types
If you need a richer type (e.g., “unit with staff count”), add it to:
- `apps/web/src/lib/supabase/custom-types.ts`

That file is the preferred place for types that represent query results not directly equal to a single table row.

---

## Related files

- **Schema / generated typing**
  - `apps/web/src/lib/supabase/database.types.ts`

- **App-level, domain-focused types**
  - `apps/web/src/lib/supabase/custom-types.ts`

- **Services that typically perform database calls**
  - `apps/web/src/lib/services/*`
  - `apps/mobile/src/modules/*/services/*`

---

## Troubleshooting

### “Type ‘"my_table"’ does not satisfy the constraint…”
This usually means:
- The table name is wrong (pluralization, casing)
- The `database.types.ts` file is outdated compared to the Supabase schema

Regenerate or update the schema types, then ensure the code references the correct table identifiers.

### Insert/update payload type errors
If `TablesInsert<"...">` or `TablesUpdate<"...">` rejects your payload:
- You might be sending a column that doesn’t exist
- A column expects a different type (e.g., UUID vs string, timestamp format)
- A non-nullable column is missing (for inserts)

Use the generated type errors as guidance—they usually mirror DB constraints accurately.
