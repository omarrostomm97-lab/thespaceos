# Gaming Lounge OS — Full System Reference

> Last updated: May 30, 2026  
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
| actualCash | numeric nullable | entered by cashier |
| difference | numeric nullable | actual - expected |
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

**Role hierarchy (highest → lowest):**  
`platform_owner` → `owner` → `manager` → `cashier` → `buffet_worker`

**RBAC shorthands:**
- `MGMT` = platform_owner, owner, manager
- `CASHIER_UP` = + cashier
- `STAFF` = + buffet_worker (all roles)

### Auth (`/api/auth`)

| Method | Path | Auth Required | Description | Status |
|--------|------|--------------|-------------|--------|
| POST | `/auth/login` | No | Email + password → JWT + refreshToken | ✅ Working |
| POST | `/auth/logout` | Yes | Invalidate session | ✅ Working |
| GET | `/auth/me` | Yes | Return current user profile | ✅ Working |
| POST | `/auth/refresh` | No | Refresh expired access token | ✅ Working |

### Tenants (`/api/tenants`) — platform_owner only

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/tenants` | platform_owner | List all tenants | ✅ Working |
| POST | `/tenants` | platform_owner | Create new tenant | ✅ Working |
| GET | `/tenants/:tenantId` | platform_owner | Get tenant details | ✅ Working |
| PATCH | `/tenants/:tenantId` | platform_owner | Update tenant config | ✅ Working |

### Users (`/api/users`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/users` | Auth | List users (tenant-scoped) | ✅ Working |
| POST | `/users` | MGMT | Create new user | ✅ Working |
| GET | `/users/:userId` | Auth | Get user profile | ✅ Working |
| PATCH | `/users/:userId` | MGMT | Update user | ✅ Working |
| POST | `/users/:userId/deactivate` | MGMT | Deactivate user | ✅ Working |

### Assets (`/api/assets`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/assets` | Auth, Tenant | List all assets | ✅ Working |
| POST | `/assets` | MGMT | Create asset | ✅ Working |
| GET | `/assets/:assetId` | Auth, Tenant | Get asset details | ✅ Working |
| PATCH | `/assets/:assetId` | MGMT | Update asset | ✅ Working |
| POST | `/assets/:assetId/qr` | MGMT | Generate / revoke QR token | ✅ Working |

### Sessions (`/api/sessions`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/sessions` | Auth, Tenant | List all sessions | ✅ Working |
| GET | `/sessions/active` | Auth, Tenant | Active + paused sessions only | ✅ Working |
| GET | `/sessions/:sessionId` | Auth, Tenant | Session detail with orders + billing | ✅ Working |
| POST | `/sessions` | CASHIER_UP | Start a new session | ✅ Working |
| POST | `/sessions/:sessionId/pause` | CASHIER_UP | Pause active session | ✅ Working |
| POST | `/sessions/:sessionId/resume` | CASHIER_UP | Resume paused session | ✅ Working |
| POST | `/sessions/:sessionId/end` | CASHIER_UP | End session, calculate final bill | ✅ Working |
| POST | `/sessions/:sessionId/cancel` | MGMT | Cancel session | ✅ Working |

### Orders (`/api/orders`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/orders` | Auth, Tenant | List all orders | ✅ Working |
| GET | `/orders/kds` | Auth, Tenant | KDS view — pending/preparing only | ✅ Working |
| GET | `/orders/:orderId` | Auth, Tenant | Order details | ✅ Working |
| POST | `/orders` | CASHIER_UP | Create POS order (+ payment record) | ✅ Working |
| PATCH | `/orders/:orderId/status` | STAFF | Update order status | ✅ Working |
| PATCH | `/orders/:orderId/assign` | CASHIER_UP | Assign order to staff | ✅ Working |
| POST | `/orders/:orderId/cancel` | CASHIER_UP | Cancel order | ✅ Working |

### QR Ordering (`/api/qr`) — public, no auth

| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/qr/:token/menu` | None | Get menu for QR-scanned asset | ✅ Working |
| POST | `/qr/:token/order` | None | Place order from QR scan | ✅ Working |

### Payments (`/api/payments`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/payments` | Auth, Tenant | List payments | ✅ Working |
| POST | `/payments` | CASHIER_UP | Record new payment | ✅ Working |
| POST | `/payments/:paymentId/verify` | CASHIER_UP | Verify InstaPay / Visa payment | ✅ Working |

### Products & Categories (`/api/products`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/products` | Auth, Tenant | List all products | ✅ Working |
| POST | `/products` | Auth, Tenant | Create product | ✅ Working |
| GET | `/products/:productId` | Auth, Tenant | Get product | ✅ Working |
| PATCH | `/products/:productId` | Auth, Tenant | Update product | ✅ Working |
| GET | `/product-categories` | Auth, Tenant | List categories | ✅ Working |
| POST | `/product-categories` | Auth, Tenant | Create category | ✅ Working |

### Inventory (`/api/inventory`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/inventory` | Auth, Tenant | List inventory items | ✅ Working |
| POST | `/inventory` | MGMT | Create inventory item | ✅ Working |
| PATCH | `/inventory/:itemId` | MGMT | Update inventory item | ✅ Working |
| GET | `/inventory/movements` | Auth, Tenant | Movement history | ✅ Working |
| POST | `/inventory/movements` | Auth, Tenant | Record stock movement | ✅ Working |
| GET | `/inventory/alerts` | Auth, Tenant | Low-stock alerts | ✅ Working |

### Shifts (`/api/shifts`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/shifts` | Auth, Tenant | List shift history | ✅ Working |
| GET | `/shifts/current` | Auth, Tenant | Current open shift | ✅ Working |
| POST | `/shifts` | CASHIER_UP | Open a shift | ✅ Working |
| POST | `/shifts/:shiftId/close` | MGMT | Close shift + cash reconciliation | ✅ Working |

### Dashboard (`/api/dashboard`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/dashboard/summary` | Auth, Tenant | Today's KPI tiles | ✅ Working |
| GET | `/dashboard/revenue` | Auth, Tenant | Revenue over time | ✅ Working |
| GET | `/dashboard/employee-performance` | Auth, Tenant | Per-employee order/session stats | ✅ Working |

### Audit Logs (`/api/audit-logs`)

| Method | Path | Roles | Description | Status |
|--------|------|-------|-------------|--------|
| GET | `/audit-logs` | Auth, Tenant | Paginated audit trail | ✅ Working |

### Health

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/healthz` | Service liveness check | ✅ Working |

---

## 3. Frontend Pages

All pages use Arabic RTL UI. Auth is handled via JWT stored in `localStorage`. Protected routes redirect to `/login` if unauthenticated.

| Route | File | Description | Status |
|-------|------|-------------|--------|
| `/login` | `auth/login.tsx` | Email + password login form | ✅ Working |
| `/` | `dashboard.tsx` | Real-time KPI tiles + active sessions list, auto-refreshes every 10s | ✅ Working |
| `/sessions` | `sessions.tsx` | Active/paused sessions with pause/resume/end actions, 8s refresh | ✅ Working |
| `/sessions/:id` | `sessions/[id].tsx` | Session detail: billing, orders placed, payments, cancel button | ✅ Working |
| `/assets` | `assets.tsx` | Device list with QR generation and status management | ✅ Working |
| `/pos` | `pos.tsx` | POS terminal: category filter, cart, 3 payment method buttons (Cash/InstaPay/Visa) | ✅ Working |
| `/orders` | `orders.tsx` | Full order list with status tabs, 10s auto-refresh, deliver button | ✅ Working |
| `/kds` | `kds.tsx` | Kitchen Display: pending/preparing orders, 5s refresh, mark preparing/ready | ✅ Working |
| `/qr/:token` | `qr/[token].tsx` | Public QR menu — customers browse and place orders from their table | ✅ Working |
| `/payments` | `payments.tsx` | Payment list with verify button for InstaPay/Visa | ✅ Working |
| `/menu` | `menu.tsx` | Product + category CRUD with Arabic names | ✅ Working |
| `/inventory` | `inventory.tsx` | Stock levels, low-stock alerts, movement log, add/adjust stock | ✅ Working |
| `/shifts` | `shifts.tsx` | Open/close shifts, opening/closing cash entry, history table | ✅ Working |
| `/users` | `users.tsx` | General user list | ✅ Working |
| `/admin/users` | `admin/users.tsx` | Full user management: create, role assign, deactivate | ✅ Working |
| `/admin/tenants` | `admin/tenants.tsx` | Platform-level tenant management (platform_owner only) | ✅ Working |
| `/audit` | `audit.tsx` | Audit log viewer | ✅ Working |
| `/settings` | `settings.tsx` | Tenant settings (name, language, etc.) | ✅ Working |
| `/unauthorized` | `unauthorized.tsx` | 403 page | ✅ Working |
| `*` | `not-found.tsx` | 404 page | ✅ Working |

### Shared Components

| Component | Purpose | Status |
|-----------|---------|--------|
| `AuthProvider` / `useAuth` | JWT auth context, auto-logout on 401, stores token in localStorage | ✅ Working |
| `ProtectedRoute` | Wraps routes — redirects unauthenticated users to `/login` | ✅ Working |
| `Layout` | Sidebar nav with role-based menu items, logout, Arabic RTL | ✅ Working |
| `api-client-react` lib | Orval-generated React Query hooks for every endpoint | ✅ Working |

---

## 4. What Is Working

### Core Platform
- ✅ Multi-tenant isolation — every DB query is scoped by `tenantId`; cross-tenant FK inputs validated before insert
- ✅ JWT authentication with refresh token flow
- ✅ Role-based access control on every route (5 roles: platform_owner, owner, manager, cashier, buffet_worker)
- ✅ Full Arabic RTL UI throughout the frontend
- ✅ Seed data: 1 tenant, 5 demo users, 8 assets, 6 products, 3 categories

### Gaming Sessions
- ✅ Start, pause (with time tracking), resume, end, cancel
- ✅ Automatic billing calculation (minutes × price per hour)
- ✅ Asset status updated in real time (available ↔ busy)
- ✅ Session detail page shows all related orders and payments

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

### Inventory
- ✅ Stock items with units and minimum level thresholds
- ✅ Manual stock movements (in / out / adjust)
- ✅ Auto-deduction when order delivered (requires recipe_items to be configured)
- ✅ Low-stock alerts endpoint

### Shifts
- ✅ Open shift with opening cash amount
- ✅ Close shift with actual cash count
- ✅ Automatic difference calculation (actual vs expected)
- ✅ Full shift history

### Admin
- ✅ User management with role assignment and deactivation
- ✅ Tenant management for platform_owner
- ✅ Audit log on key actions (login, order create, session end, payment verify)
- ✅ Asset QR code generation and revocation

---

## 5. What Is Not Yet Done

### High Priority — Core SaaS Gaps

| Feature | Detail | Effort |
|---------|--------|--------|
| **RBAC tightening on products/categories** | `POST/PATCH /products` and `/product-categories` are only `requireAuth` — should restrict mutations to MGMT (owner/manager), cashiers should be read-only | Small |
| **Audit coverage gaps** | Many mutation endpoints (assets, inventory, users PATCH, payments record) don't write to `audit_logs`. Goal: every mutating action logged with old + new value snapshot | Medium |
| **Refresh token usage in frontend** | `useRefreshToken` hook exists in the client but `AuthProvider` doesn't call it — expired tokens just log the user out instead of auto-refreshing silently | Small |
| **shift_cash_logs not used** | Table exists but no route records mid-shift cash in/out entries (e.g., cash drops, petty cash) | Small |
| **session_logs not written** | Table exists in DB but `session_logs` are never inserted when session status changes | Small |
| **Recipe management UI** | `recipes` and `recipe_items` tables exist and drive inventory deduction, but there is no UI page to view or edit recipes (what ingredients each product uses) | Medium |
| **Product image upload** | Products have no image field — menu cards show text only | Medium |

### Medium Priority — Reporting & Analytics

| Feature | Detail | Effort |
|---------|--------|--------|
| **Revenue charts on dashboard** | `/dashboard/revenue` endpoint exists but the dashboard page only shows KPI number tiles, no chart | Medium |
| **Date-range revenue reports** | No way to filter/export revenue or orders by custom date range | Medium |
| **Employee performance page** | `/dashboard/employee-performance` endpoint exists but no frontend page consumes it | Small |
| **Shift cash log page** | No UI to record mid-shift cash movements or view `shift_cash_logs` | Small |
| **Payments by session summary** | Session detail shows payments but there's no aggregate "end of night" payment report | Medium |

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
| **Two-factor / IP-pinning** | No 2FA support — relevant for owner/manager accounts | Large |
| **Mobile-responsive layout** | Frontend is desktop-optimized; sidebar and tables are not fully mobile-friendly | Medium |

### Not Started — Future SaaS Features

| Feature | Detail |
|---------|--------|
| **Subscription billing** | No Stripe/payment gateway integration for charging tenants |
| **Multi-branch under one owner** | Owner can only have one tenant (one branch) — no multi-branch hierarchy |
| **Customer loyalty / membership** | No customer accounts, points, or membership tiers |
| **Custom pricing tiers** | Pricing is flat per-hour; no peak/off-peak rates or package deals |
| **Staff scheduling** | No shift planning or staff availability management |
| **Notifications** | No email/SMS/push notifications for low stock, session overruns, payment failures |
| **Table/floor map** | No visual layout of assets (drag-and-drop floor plan) |
| **API rate limiting** | No rate limiting on public endpoints (`/qr/...`) |

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

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (reads PORT env var)
pnpm --filter @workspace/gaming-lounge run dev
```
