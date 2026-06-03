# Gaming Lounge OS — Full System Reference

> Last updated: June 3, 2026  
> Stack: React + Vite (frontend) · Express + Drizzle ORM (backend) · PostgreSQL (database)  
> Auth: JWT (access token) + Refresh token · Multi-tenant SaaS · Arabic-first RTL UI

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Backend API Routes](#2-backend-api-routes)
3. [Frontend Pages](#3-frontend-pages)
4. [What Is Working](#4-what-is-working)
5. [What Is Not Yet Done](#5-what-is-not-yet-done)
6. [Seed Credentials](#6-seed-credentials)

---

## 1. Database Schema

### `tenants`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | English name |
| nameAr | text | Arabic name |
| slug | text unique | URL slug |
| isActive | boolean | default true |
| language | text | 'ar' or 'en' |
| createdAt | timestamp | |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| email | text unique | login credential |
| passwordHash | text | bcrypt |
| name | text | English name |
| nameAr | text | Arabic name |
| role | text | platform_owner / owner / manager / cashier / buffet_worker |
| tenantId | integer FK | null for platform_owner |
| isActive | boolean | default true |
| createdAt | timestamp | |

### `roles`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| name | text | |
| description | text | |
| isSystem | boolean | |
| createdAt | timestamp | |

### `user_roles`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| userId | integer FK | |
| roleId | integer FK | |
| assignedAt | timestamp | |

### `assets`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| name | text | e.g. "PlayStation 5 — Station 1" |
| nameAr | text | |
| type | text | pc / ps5 / ps4 / vr / other |
| pricePerHour | numeric | |
| status | text | available / busy / maintenance |
| qrToken | text | active QR token |
| createdAt | timestamp | |

### `asset_qr_codes`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| assetId | integer FK | |
| token | text unique | UUID |
| isActive | boolean | |
| generatedByUserId | integer FK | |
| createdAt | timestamp | |
| revokedAt | timestamp nullable | |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| assetId | integer FK | |
| customerName | text nullable | |
| startsAt | timestamp | |
| endsAt | timestamp | |
| notes | text nullable | |
| status | text | upcoming / cancelled (active/completed are **computed** at read-time, not stored) |
| createdAt | timestamp | |

> ⚠️ Booking status `active` and `completed` are derived at read-time via `computeStatus(booking, now)` — never filter the DB by these values. Only `"upcoming"` and `"cancelled"` are stored.

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| categoryId | integer FK nullable | |
| name | text | |
| nameAr | text | |
| description | text nullable | |
| descriptionAr | text nullable | |
| price | numeric | |
| isAvailable | boolean | default true |
| createdAt | timestamp | |

### `product_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| name | text | |
| nameAr | text | |
| sortOrder | integer | default 0 |
| createdAt | timestamp | |

### `recipes`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| productId | integer FK | |
| name | text | |
| createdAt | timestamp | |

### `recipe_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| productId | integer FK | |
| inventoryItemId | integer FK | |
| quantityUsed | numeric | units consumed per product sold |

### `inventory_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| name | text | |
| nameAr | text nullable | |
| unit | text | kg / litre / piece / etc |
| currentStock | numeric | |
| minStockLevel | numeric nullable | triggers low-stock alert |
| createdAt | timestamp | |

### `inventory_movements`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| inventoryItemId | integer FK | |
| type | text | in / out / adjust / sale |
| quantity | numeric | |
| reason | text nullable | |
| approvedByUserId | integer FK nullable | |
| createdByUserId | integer FK nullable | |
| createdAt | timestamp | |

### `sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| assetId | integer FK | |
| userId | integer FK | started by |
| status | text | active / paused / ended / cancelled |
| startedAt | timestamp | |
| pausedAt | timestamp nullable | |
| endedAt | timestamp nullable | |
| totalMinutes | numeric nullable | |
| totalCost | numeric nullable | |
| cancelReason | text nullable | |
| notes | text nullable | |
| pausedDurationMinutes | numeric | default 0 |

### `session_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| sessionId | integer FK | |
| action | text | started / paused / resumed / ended / cancelled |
| previousStatus | text | |
| newStatus | text | |
| note | text nullable | |
| performedByUserId | integer FK | |
| createdAt | timestamp | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| sessionId | integer FK nullable | null for standalone POS |
| assetId | integer FK nullable | |
| source | text | pos / qr / kds |
| status | text | pending / preparing / ready / delivered / closed / cancelled |
| totalAmount | numeric | |
| createdByUserId | integer FK nullable | |
| assignedToUserId | integer FK nullable | |
| customerName | text nullable | |
| cancelReason | text nullable | |
| preparingAt | timestamp nullable | |
| readyAt | timestamp nullable | |
| deliveredAt | timestamp nullable | |
| createdAt | timestamp | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| orderId | integer FK | |
| productId | integer FK | |
| quantity | integer | |
| unitPrice | numeric | |
| totalPrice | numeric | |
| notes | text nullable | |

### `order_assignments`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| orderId | integer FK | |
| userId | integer FK | |
| action | text | assigned / unassigned |
| assignedAt | timestamp | |

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| sessionId | integer FK nullable | null for standalone POS payment |
| method | text | cash / instapay / visa |
| amount | numeric | |
| status | text | pending / verified / rejected |
| transactionReference | text nullable | |
| instapayReference | text nullable | |
| verifiedByUserId | integer FK nullable | |
| verifiedAt | timestamp nullable | |
| createdAt | timestamp | |

### `shifts`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| userId | integer FK | |
| status | text | open / closed |
| openingCash | numeric | |
| expectedCash | numeric nullable | calculated on close |
| actualCash | numeric nullable | entered by cashier on close |
| difference | numeric nullable | actual − expected |
| differenceExplanation | text nullable | |
| openedAt | timestamp | |
| closedAt | timestamp nullable | |

### `shift_cash_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK | |
| shiftId | integer FK | |
| type | text | in / out |
| amount | numeric | |
| note | text nullable | |
| recordedByUserId | integer FK | |
| createdAt | timestamp | |

### `audit_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tenantId | integer FK nullable | |
| userId | integer FK nullable | |
| action | text | e.g. create_order, end_session |
| entityType | text | order / session / payment / etc |
| entityId | integer nullable | |
| oldValue | jsonb nullable | |
| newValue | jsonb nullable | |
| ipAddress | text nullable | |
| createdAt | timestamp | |

---

## 2. Backend API Routes

All routes are prefixed with `/api`. Most require `requireAuth` + `requireTenant` middleware.  
API server runs on **port 8080** and is compiled to a dist bundle — **must be rebuilt + restarted after any backend change**.

**Role hierarchy (highest → lowest):**  
`platform_owner` → `owner` → `manager` → `cashier` → `buffet_worker`

**RBAC shorthands:**
- `MGMT` = platform_owner, owner, manager
- `CASHIER_UP` = + cashier
- `STAFF` = + buffet_worker (all roles)
- `requireOpenShift` — blocks non-MGMT roles if no shift is currently open

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Email + password → JWT + refreshToken |
| POST | `/auth/logout` | Yes | Invalidate session |
| GET | `/auth/me` | Yes | Return current user profile |
| POST | `/auth/refresh` | No | Refresh expired access token |

### Tenants (`/api/tenants`) — platform_owner only

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/tenants` | platform_owner | List all tenants |
| POST | `/tenants` | platform_owner | Create new tenant |
| GET | `/tenants/:tenantId` | platform_owner | Get tenant details |
| PATCH | `/tenants/:tenantId` | platform_owner | Update tenant config |

### Users (`/api/users`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/users` | Auth | List users (tenant-scoped) |
| POST | `/users` | MGMT | Create new user |
| GET | `/users/:userId` | Auth | Get user profile |
| PATCH | `/users/:userId` | MGMT | Update user |
| POST | `/users/:userId/deactivate` | MGMT | Deactivate user |

### Assets (`/api/assets`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/assets` | Auth, Tenant | List all assets |
| POST | `/assets` | MGMT | Create asset |
| GET | `/assets/:assetId` | Auth, Tenant | Get asset details |
| PATCH | `/assets/:assetId` | MGMT | Update asset |
| POST | `/assets/:assetId/qr` | MGMT | Generate / revoke QR token |

### Bookings (`/api/bookings`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/bookings` | CASHIER_UP | List bookings — supports `?status=upcoming,active` and `?from=`/`?to=` date filters |
| POST | `/bookings` | MGMT | Create booking (validates asset ownership + overlap) |
| GET | `/bookings/upcoming-soon` | CASHIER_UP | Bookings starting within the next 30 min (for cashier alert banner) |
| POST | `/bookings/:id/cancel` | MGMT | Cancel a booking |

> ⚠️ `/bookings/upcoming-soon` must stay declared **before** `/bookings/:id` in the route file to avoid Express swallowing it as a parameterized match.

### Sessions (`/api/sessions`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/sessions` | Auth, Tenant | List all sessions |
| GET | `/sessions/active` | Auth, Tenant | Active + paused sessions only |
| GET | `/sessions/:sessionId` | Auth, Tenant | Session detail with orders, billing, and session logs |
| POST | `/sessions` | CASHIER_UP + requireOpenShift | Start a new session (blocked if asset is actively booked or no open shift for cashiers) |
| POST | `/sessions/:sessionId/pause` | CASHIER_UP | Pause active session |
| POST | `/sessions/:sessionId/resume` | CASHIER_UP | Resume paused session |
| POST | `/sessions/:sessionId/end` | CASHIER_UP | End session, calculate final bill |
| POST | `/sessions/:sessionId/cancel` | MGMT | Cancel session |

### Orders (`/api/orders`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/orders` | Auth, Tenant | List all orders |
| GET | `/orders/kds` | Auth, Tenant | KDS view — pending/preparing only |
| GET | `/orders/:orderId` | Auth, Tenant | Order details |
| POST | `/orders` | CASHIER_UP | Create POS order (+ payment record) |
| PATCH | `/orders/:orderId/status` | STAFF | Update order status |
| PATCH | `/orders/:orderId/assign` | CASHIER_UP | Assign order to staff |
| POST | `/orders/:orderId/cancel` | CASHIER_UP | Cancel order |

### QR Ordering (`/api/qr`) — public, no auth

| Method | Path | Description |
|--------|------|-------------|
| GET | `/qr/:token/menu` | Get menu for QR-scanned asset |
| POST | `/qr/:token/order` | Place order from QR scan |

### Payments (`/api/payments`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/payments` | Auth, Tenant | List payments |
| POST | `/payments` | CASHIER_UP | Record new payment |
| POST | `/payments/:paymentId/verify` | CASHIER_UP | Verify InstaPay / Visa payment |

### Products & Categories (`/api/products`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/products` | Auth, Tenant | List all products |
| POST | `/products` | Auth, Tenant | Create product |
| GET | `/products/:productId` | Auth, Tenant | Get product |
| PATCH | `/products/:productId` | Auth, Tenant | Update product |
| DELETE | `/products/:productId` | MGMT | Delete product |
| GET | `/product-categories` | Auth, Tenant | List categories |
| POST | `/product-categories` | Auth, Tenant | Create category |
| PATCH | `/product-categories/:categoryId` | MGMT | Update category |
| DELETE | `/product-categories/:categoryId` | MGMT | Delete category |

### Inventory (`/api/inventory`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/inventory` | Auth, Tenant | List inventory items |
| POST | `/inventory` | MGMT | Create inventory item |
| PATCH | `/inventory/:itemId` | MGMT | Update inventory item |
| DELETE | `/inventory/:itemId` | MGMT | Delete inventory item |
| GET | `/inventory/movements` | Auth, Tenant | Movement history |
| POST | `/inventory/movements` | Auth, Tenant | Record stock movement |
| GET | `/inventory/alerts` | Auth, Tenant | Low-stock alerts |

### Recipes (`/api/recipes`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/recipes` | Auth, Tenant | List recipes with items |
| POST | `/recipes` | MGMT | Create recipe |
| PATCH | `/recipes/:recipeId` | MGMT | Update recipe |
| DELETE | `/recipes/:recipeId` | MGMT | Delete recipe |

### Shifts (`/api/shifts`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/shifts` | Auth, Tenant | List shift history |
| GET | `/shifts/current` | Auth, Tenant | Current open shift |
| POST | `/shifts` | CASHIER_UP | Open a shift with opening cash amount |
| POST | `/shifts/:shiftId/close` | CASHIER_UP | Close shift + cash reconciliation (calculates expected vs actual) |

### Dashboard (`/api/dashboard`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/dashboard/summary` | Auth, Tenant | Today's KPI tiles (revenue, sessions, orders) |
| GET | `/dashboard/revenue` | Auth, Tenant | Revenue over time |
| GET | `/dashboard/breakdown` | Auth, Tenant | Revenue breakdown by category (sessions, buffet, etc.) |
| GET | `/dashboard/employee-performance` | Auth, Tenant | Per-employee order/session stats |

### Audit Logs (`/api/audit-logs`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit-logs` | Auth, Tenant | Paginated audit trail |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/healthz` | Service liveness check |

---

## 3. Frontend Pages

All pages use Arabic RTL UI. Auth is handled via JWT stored in `localStorage`. Protected routes redirect to `/login` if unauthenticated.

| Route | File | Roles | Description |
|-------|------|-------|-------------|
| `/login` | `auth/login.tsx` | Public | Email + password login form |
| `/` | `dashboard.tsx` | All | KPI tiles, active sessions, revenue charts, 10s refresh |
| `/sessions` | `sessions.tsx` | All | Active/paused sessions with pause/resume/end actions, 8s refresh |
| `/sessions/:id` | `sessions/[id].tsx` | All | Session detail: billing, orders, payments, session log timeline |
| `/assets` | `assets.tsx` | All | Device grid — start session, booking badges, QR generation, edit; **ShiftGate blocks cashiers without an open shift** |
| `/bookings` | `bookings.tsx` | MGMT (owner+) | Create/view/cancel room bookings with date/asset picker |
| `/pos` | `pos.tsx` | CASHIER_UP | POS terminal: category filter, cart, Cash/InstaPay/Visa payment buttons |
| `/orders` | `orders.tsx` | All | Full order list with status tabs, 10s auto-refresh, deliver button |
| `/kds` | `kds.tsx` | All | Kitchen Display: pending/preparing orders, 5s refresh, mark preparing/ready |
| `/qr/:token` | `qr/[token].tsx` | Public | Customer QR menu — browse and place orders without auth |
| `/payments` | `payments.tsx` | CASHIER_UP | Payment list with verify button for InstaPay/Visa |
| `/menu` | `menu.tsx` | MGMT | Product + category CRUD with Arabic names |
| `/inventory` | `inventory.tsx` | MGMT | Stock levels, low-stock alerts, movement log, add/adjust stock |
| `/recipes` | `recipes.tsx` | MGMT | Recipe management — ingredients per product, drives inventory deduction |
| `/shifts` | `shifts.tsx` | CASHIER_UP | Open/close shifts, opening/closing cash entry, shift history; **cashiers can close their own shifts** |
| `/performance` | `performance.tsx` | MGMT | Employee performance analytics |
| `/users` | `users.tsx` | All | General user list |
| `/admin/users` | `admin/users.tsx` | MGMT | Full user management: create, role assign, deactivate |
| `/admin/tenants` | `admin/tenants.tsx` | platform_owner | Platform-level tenant management |
| `/audit` | `audit.tsx` | MGMT | Audit log viewer |
| `/settings` | `settings.tsx` | MGMT | Tenant settings (name, language, etc.) |
| `/unauthorized` | `unauthorized.tsx` | — | 403 page |
| `*` | `not-found.tsx` | — | 404 page |

### Shared Components

| Component | Purpose |
|-----------|---------|
| `AuthProvider` / `useAuth` | JWT auth context, auto-logout on 401, stores token in localStorage |
| `ProtectedRoute` | Wraps routes — redirects unauthenticated users to `/login` |
| `Layout` | Sidebar nav with role-based menu items, booking alert banner (30-min window), logout, Arabic RTL |
| `ShiftGate` | Wraps cashier pages — shows "open a shift first" screen when no active shift |
| `api-client-react` lib | Orval-generated React Query hooks for every endpoint |

---

## 4. What Is Working

### Core Platform
- ✅ Multi-tenant isolation — every DB query scoped by `tenantId`; cross-tenant FK inputs validated before insert
- ✅ JWT authentication with refresh token flow
- ✅ Role-based access control on every route (5 roles)
- ✅ Full Arabic RTL UI throughout the frontend
- ✅ Seed data: 1 tenant, 5 demo users, 8 assets, 6 products, 3 categories

### Gaming Sessions
- ✅ Start, pause (with time tracking), resume, end, cancel
- ✅ Automatic billing calculation (minutes × price per hour)
- ✅ Asset status updated in real time (available ↔ busy)
- ✅ Session detail page shows all related orders, payments, and session log timeline
- ✅ Session start blocked when asset has an active booking (`asset_booked` error)
- ✅ Session start requires open shift for cashiers (`requireOpenShift` middleware)

### Room Bookings
- ✅ Create bookings with asset, customer name, start/end time, and notes
- ✅ Conflict detection — overlapping bookings on the same asset are rejected
- ✅ Booking status computed at read-time: upcoming / active / completed / cancelled
- ✅ Asset cards show booking badge (next booking time, "Reserved" indicator during active window)
- ✅ Cashier/manager alert banner in layout — fires 30 min before any booking starts
- ✅ Cancel bookings (MGMT)
- ✅ Date-range filter on booking list (`?from=` / `?to=`)

### Orders & KDS
- ✅ POS order creation with product catalog and cart
- ✅ 3 payment methods: Cash (auto-verified), InstaPay (pending), Visa (pending)
- ✅ QR-based self-ordering from customer devices (no auth required)
- ✅ KDS screen for buffet workers — real-time 5s polling
- ✅ Order status lifecycle: pending → preparing → ready → delivered
- ✅ Order cancellation with reason
- ✅ Inventory auto-deducted from stock when order is delivered (via recipe_items)

### Payments
- ✅ Payment recording for cash, InstaPay, and Visa
- ✅ Manual verification flow for digital payments
- ✅ Payments linked to sessions or standalone (POS)

### Inventory & Recipes
- ✅ Stock items with units and minimum level thresholds
- ✅ Manual stock movements (in / out / adjust)
- ✅ Auto-deduction when order delivered (requires recipe items to be configured)
- ✅ Low-stock alerts endpoint
- ✅ Recipe management UI — define which inventory items each product consumes

### Shifts
- ✅ Open shift with opening cash amount (CASHIER_UP)
- ✅ Close shift with actual cash count (CASHIER_UP — cashiers can close their own shifts)
- ✅ Automatic difference calculation (actual vs expected)
- ✅ Shift gate — cashiers blocked from starting sessions without an open shift
- ✅ Full shift history

### Admin & Reporting
- ✅ User management with role assignment and deactivation
- ✅ Tenant management for platform_owner
- ✅ Audit log on key actions (login, order create, session end, payment verify, shift open/close)
- ✅ Asset QR code generation and revocation
- ✅ Employee performance analytics page
- ✅ Dashboard KPI tiles + revenue breakdown by category

---

## 5. What Is Not Yet Done

### High Priority — Core SaaS Gaps

| Feature | Detail | Effort |
|---------|--------|--------|
| **RBAC tightening on products** | `POST/PATCH /products` and `/product-categories` are only `requireAuth` — should restrict creates to MGMT; cashiers should be read-only | Small |
| **Audit coverage gaps** | Many mutation endpoints (assets, inventory, users PATCH, payments record) don't write to `audit_logs`. Goal: every mutating action logged with old + new value snapshot | Medium |
| **Refresh token auto-use in frontend** | `useRefreshToken` hook exists but `AuthProvider` doesn't call it — expired tokens log the user out instead of auto-refreshing silently | Small |
| **shift_cash_logs not used** | Table exists but no route records mid-shift cash in/out entries (e.g., cash drops, petty cash) | Small |
| **Product image upload** | Products have no image field — menu cards show text only | Medium |

### Medium Priority — Reporting & UX

| Feature | Detail | Effort |
|---------|--------|--------|
| **Revenue charts on dashboard** | `/dashboard/revenue` and `/dashboard/breakdown` endpoints exist but the frontend dashboard page shows only KPI number tiles — no chart rendering yet | Medium |
| **Date-range revenue reports** | No way to filter/export revenue or orders by custom date range from the UI | Medium |
| **Shift cash log UI** | No UI to record mid-shift cash movements or view `shift_cash_logs` | Small |
| **Payments by session summary** | Session detail shows payments but there's no aggregate "end of night" payment report | Medium |
| **Booking alert window alignment** | Backend checks 30-min window; OpenAPI summary says 60 min; banner copy says "starting soon / within the hour" — pick one and align all three | Tiny |
| **Booking status i18n** | `booking_status_active` translation key is missing; active bookings may render a fallback key | Tiny |

### Lower Priority — Operations & UX

| Feature | Detail | Effort |
|---------|--------|--------|
| **Real-time updates** | All pages use polling (5–10s intervals). Replace with WebSocket or SSE for instant KDS/dashboard updates | Large |
| **Receipt printing** | No print-formatted receipt view for POS or session end | Medium |
| **Order notes per item** | `order_items.notes` column exists but POS UI has no input for it | Small |
| **Asset maintenance scheduling** | Assets can be set to "maintenance" but there's no scheduled maintenance or history log | Medium |
| **Customer-facing QR page enhancements** | No order status tracking after submission, no cart persistence (page reload clears cart) | Medium |
| **Pagination on list endpoints** | Inventory movements, audit logs, orders, payments all do in-memory slicing — needs SQL-level LIMIT/OFFSET for large tenants | Medium |
| **Role-scoped dashboard** | Cashier and buffet_worker see the full owner dashboard — should show a simplified view relevant to their role | Medium |
| **Password reset / forgot password** | No password reset flow exists | Medium |
| **Mobile-responsive layout** | Frontend is desktop-optimized; sidebar and tables are not fully mobile-friendly | Medium |

### Not Started — Future SaaS Features

| Feature | Detail |
|---------|--------|
| **Subscription billing** | No payment gateway integration for charging tenants |
| **Multi-branch under one owner** | Owner can only have one tenant (one branch) — no multi-branch hierarchy |
| **Customer loyalty / membership** | No customer accounts, points, or membership tiers |
| **Custom pricing tiers** | Pricing is flat per-hour; no peak/off-peak rates or package deals |
| **Staff scheduling** | No shift planning or staff availability management |
| **Notifications** | No email/SMS/push notifications for low stock, session overruns, payment failures |
| **Table/floor map** | No visual layout of assets (drag-and-drop floor plan) |
| **API rate limiting** | No rate limiting on public endpoints (`/qr/...`) |
| **Kiosk app features** | Expo kiosk app exists but feature parity with the web app is incomplete |

---

## 6. Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| platform_owner | platform@gaming-lounge.com | admin123 |
| owner | owner@gaming-lounge.com | owner123 |
| manager | manager@gaming-lounge.com | manager123 |
| cashier | cashier@gaming-lounge.com | cashier123 |
| buffet_worker | buffet@gaming-lounge.com | buffet123 |

---

## Quick Start

```bash
# Install deps
pnpm install

# Push DB schema
pnpm --filter @workspace/db run push

# Seed demo data
pnpm --filter @workspace/db run seed

# Start API server (port 8080) — compiles first, then runs
pnpm --filter @workspace/api-server run dev

# Start frontend (reads PORT env var)
pnpm --filter @workspace/gaming-lounge run dev

# Regenerate API hooks + Zod schemas after editing openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```
