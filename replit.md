# Gaming Lounge OS

Multi-tenant SaaS platform for Egyptian gaming centers — Arabic-first RTL UI for managing gaming assets, sessions, orders, shifts, bookings, and payments.

## Run & Operate

| Command | Purpose |
|---|---|
| `pnpm --filter @workspace/api-server run dev` | Build + start API server (port 8080) |
| `pnpm --filter @workspace/gaming-lounge run dev` | Start frontend dev server |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks + Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes to Postgres (dev only) |
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |

**Required env:** `DATABASE_URL` — Postgres connection string

> ⚠️ The API server compiles to a dist bundle (esbuild) — there is **no hot-reload**. Any backend change requires restarting the `artifacts/api-server: API Server` workflow to rebuild and apply.

## Stack

- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9
- **API:** Express 5, compiled via esbuild to `dist/index.mjs`
- **DB:** PostgreSQL + Drizzle ORM — schema push only (no migration files), `drizzle-zod` for schema validation
- **API contract:** OpenAPI spec (`lib/api-spec/openapi.yaml`) is the single source of truth
- **Codegen:** Orval generates React Query hooks → `lib/api-client-react` and Zod schemas → `lib/api-zod`
- **Frontend:** React + Vite, HeroUI v3, Tailwind CSS v4, Radix UI (for Dialog/Select/AlertDialog), React Query, Wouter (routing), Sonner (toasts)
- **Mobile:** Expo (kiosk app)
- **i18n:** Arabic/English via `getT(lang)` in `i18n.ts`; `useLang()` hook returns `{ t, dir, lang, toggleLang }`

## Where Things Live

```
artifacts/
  api-server/         Express API server
    src/routes/       One file per domain (assets, sessions, shifts, bookings …)
    src/lib/auth.ts   requireAuth, requireTenant, requireRole, requireOpenShift
    src/lib/audit.ts  writeAuditLog helper
  gaming-lounge/      React + Vite web app (main cashier/manager UI)
    src/pages/        One file per page
    src/components/   layout.tsx, shift-gate.tsx, ui/*
    src/hooks/        use-auth, use-language, use-booking-alerts
  kiosk-app/          Expo mobile kiosk
  mockup-sandbox/     Canvas design sandbox (Vite)

lib/
  api-spec/           openapi.yaml — edit here, then run codegen
  api-client-react/   Generated hooks (api.ts) — do NOT edit manually
  api-zod/            Generated Zod schemas — do NOT edit manually
  db/src/schema/      Drizzle table definitions — source of truth for DB shape
    assets.ts, sessions.ts, shifts.ts, bookings.ts, orders.ts,
    products.ts, payments.ts, inventory.ts, recipes.ts,
    users.ts, tenants.ts, roles.ts, audit_logs.ts …
```

## Roles & Permissions

| Role | Description |
|---|---|
| `platform_owner` | Full access across all tenants |
| `owner` | Full access within their tenant |
| `manager` | Operational management (MGMT) |
| `cashier` | Sessions, orders, shifts, POS |
| `buffet_worker` | KDS / order fulfillment only |

**Middleware constants** (defined per-router file):
- `MGMT` = `requireRole("platform_owner", "owner", "manager")`
- `CASHIER_UP` = `requireRole("platform_owner", "owner", "manager", "cashier")`
- `requireOpenShift` — rejects non-MGMT roles if no shift is open (used on `POST /sessions`)

Cashiers **can** open **and** close their own shifts (both routes use `CASHIER_UP`).

## DB Tables (Drizzle schema)

`tenants`, `users`, `roles`, `user_roles`, `assets`, `asset_qr_codes`, `sessions`, `session_logs`, `orders`, `order_assignments`, `products`, `inventory`, `recipes`, `payments`, `shifts`, `shift_cash_logs`, `audit_logs`, `bookings`

## Architecture Decisions

- **Booking status is computed at read-time** via `computeStatus(booking, now)` in `bookings.ts` — the DB stores only `startsAt`/`endsAt`; `upcoming`, `active`, `completed` are derived. The `status` column stores "upcoming"/"cancelled" only (the two persisted states).
- **One OpenAPI spec → everything**: `openapi.yaml` drives codegen for both the React hooks and Zod validators. Always run codegen after editing the spec.
- **HeroUI v3**: No `<HeroUIProvider>` wrapper. Dark mode via CSS class. Use compound component API. Use Radix UI for Dialog, Select, AlertDialog.
- **Card styling**: Cards use the `.card-base` CSS class (plain `div`, no HeroUI wrapper); shadows come from `--card-shadow` CSS variable per theme.
- **i18n dynamic labels**: Build label functions inside the component (not at module level) so they always run after `useLang()` initializes.
- **Shift gate (frontend)**: `<ShiftGate>` wraps pages that require an open shift (e.g. assets page) — blocks cashiers when no shift is open. Backend enforces the same via `requireOpenShift`.

## Gotchas

- **API server has no hot-reload** — restart the workflow after every backend change.
- **Codegen always after spec changes** — editing `openapi.yaml` without running codegen leaves hooks and Zod types out of sync.
- **Route ordering matters in Express**: specific paths (e.g. `/bookings/upcoming-soon`) must be declared before parameterized paths (e.g. `/bookings/:id`).
- **Drizzle push, not migrate**: run `pnpm --filter @workspace/db run push` in dev; never use `migrate()`.
- **api-zod codegen strips an errant export** from the zod index — this is intentional, do not revert.
- **Booking status query**: the `status` column value in DB is always `"upcoming"` (new bookings) or `"cancelled"`; filtering by `"active"` or `"completed"` must use `computeStatus()` in application code, not a DB `WHERE status = 'active'` clause.

## User Preferences

- Arabic-first UI — all user-visible strings go through the i18n system (`t()`)
- RTL layout (`dir="rtl"`) on Arabic
