---
name: Leads management system
description: Schema, API routes, and gaming-lounge admin UI for landing page leads
---

## Schema (lib/db/src/schema/leads.ts)
Table `leads` has: fullName, phone, email (nullable), businessType, businessName, branchesCount, preferredContactMethod, message, source (default 'landing_page'), status (default 'new'), createdAt, updatedAt.
Old columns (name, company, city) still exist in DB for backward compat — not in Drizzle schema.

**Why:** Landing page collects richer lead data than the original minimal schema; old rows were migrated with name→full_name, company→business_name.

## API pattern
- POST /api/leads — public, honeypot + in-memory rate limit 5/hr per IP
- GET/PATCH /api/admin/leads, GET /api/admin/leads/:id — requireAuth + requireRole("platform_owner")

## Gaming-lounge integration
- Permission key: `/admin/leads: ["platform_owner"]` in permissions.ts
- i18n keys: `nav_leads`, `nav_admin_section` added to both ar+en sections
- Sidebar: `platformAdminNavigation` array + `PLATFORM_ADMIN_ROLES` Set in layout.tsx; purple theme distinguishes from blue (main nav) and green (finance)
- Page: src/pages/admin/leads.tsx — inline StatusPicker dropdown, LeadDetail modal, summary cards, search+filter+pagination
