# Gaming Lounge OS — Dashboard Guide

## Overview

The Dashboard is the main control panel for your gaming lounge. It gives you a real-time financial and operational view of everything happening in the venue — active sessions, revenue, orders, shifts, and room performance — all in one screen.

Key data auto-refreshes every **10 seconds** so you always see an up-to-date picture.

---

## Filters (Apply to the Whole Dashboard)

Before diving into each section, these three filters sit at the top of the dashboard and control what data is shown everywhere:

### 1. Period
Defines the time window for all revenue and statistics.

| Option | What it covers |
|--------|----------------|
| **Today** | From midnight today until now |
| **This Week** | Last 7 days (today + 6 previous days) |
| **This Month** | Last 30 days (today + 29 previous days) |

### 2. Source
Narrows the data to a specific type of revenue.

| Option | What it shows |
|--------|---------------|
| **All** | Gaming + room orders + buffet/POS combined |
| **Gaming** | Only revenue from gaming sessions and orders placed inside rooms |
| **Buffet** | Only revenue from walk-up POS sales (no linked session) |

### 3. Payment Method
Filters by how customers paid.

| Option | Description |
|--------|-------------|
| **All** | Every payment regardless of method |
| **Cash** | Cash payments only |
| **InstaPay** | InstaPay mobile transfers only |
| **Visa** | Card payments only |

> On mobile, filters are accessed via the **filter button** in the top bar and open as a bottom sheet.

---

## Tabs

The dashboard is split into four tabs. On desktop they appear as a horizontal tab bar; on mobile they appear as a bottom navigation bar.

---

### Tab 1 — Overview

The main at-a-glance view. Contains KPI cards, quick-action shortcuts, and a live sessions list.

#### KPI Cards

All money values are in **Egyptian Pounds (EGP)**. Numbers animate upward when they load or change (count-up animation).

| Card | What it measures | Live? |
|------|-----------------|-------|
| **Total Revenue** | Grand total of all verified payments in the selected period. This is the ground-truth figure — it comes directly from confirmed payment records, not estimates. | — |
| **Gaming Revenue** | Revenue purely from gaming time. Calculated as: *session-linked verified payments − room orders*. This removes double-counting when a player's session payment also bundled their food/drinks. | — |
| **Room Orders** | Revenue from food and drinks ordered through a room's QR code or by staff during an active session. These are delivered/closed orders that have a session linked to them. | — |
| **Buffet / POS** | Revenue from counter sales with no active session attached — walk-in customers buying something directly. | — |
| **Active Sessions** | Number of sessions currently in "active" or "paused" status right now. | ✅ |
| **Occupied Rooms** | How many assets (consoles, tables, etc.) currently have `busy` status, shown as `X / Total`. | ✅ |
| **Pending Orders** | Orders that have been placed but not yet started preparing. | ✅ |
| **Preparing Orders** | Orders currently being prepared in the kitchen/buffet. | ✅ |
| **Low Stock Alerts** | Count of inventory items where current stock is at or below the minimum threshold you configured. | — |
| **Cash Discrepancies** | Number of shifts closed today where the actual cash counted does not match the expected cash total. A discrepancy of even 1 piastre is flagged. | — |

> **Ground Truth explained:** Revenue numbers are always calculated from *verified payment records*, never from session cost estimates. This means if a session was ended without a payment being logged, it does not appear in revenue.

#### Quick Actions

Four shortcut buttons that take you directly to the most-used screens:

- **POS** → Opens the Point of Sale screen
- **Rooms** → Opens the Assets / Rooms management screen
- **Kitchen** → Opens the KDS (Kitchen Display System)
- **Orders** → Opens the Orders list

#### Live Sessions Widget

A scrollable list of every currently active or paused session. For each session you can see:

- **Room name** (Arabic if set, English otherwise)
- **Session status** (Active / Paused) with a live pulsing indicator
- **Duration** — how many minutes the session has been running
- **Current cost** — calculated live based on minutes elapsed × room price per hour
- **Started at** time

Sessions are sorted so the ones running longest appear first.

---

### Tab 2 — Sales

Detailed breakdown of revenue for the selected period.

#### Daily Revenue Chart

A bar chart (today) or area chart (week/month) showing revenue per day. The X-axis shows day labels (Today, Yesterday, day of the week). Hovering over a bar shows the exact EGP amount for that day.

- When viewing **Today**, the chart shows a single bar for the current day's total.
- When viewing **Week** or **Month**, it shows one bar/area per day for the full range.

The chart respects the **Source** and **Payment Method** filters — so if you select "Gaming" + "Cash", the chart shows only cash revenue from gaming sessions.

#### Revenue Breakdown Rows

Three summary rows showing the split between revenue types for the period:

| Row | Description |
|-----|-------------|
| **Gaming Revenue** | Pure gaming time income |
| **Room Orders** | Food/drinks ordered in rooms during sessions |
| **Buffet / POS** | Counter sales without a session |

Each row shows the EGP amount and its percentage of the total.

#### Payment Method Breakdown

Shows how much of the total came from each payment method, with a horizontal progress bar for each:

| Method | Icon |
|--------|------|
| Cash | 💵 |
| InstaPay | 📱 |
| Visa | 💳 |

Each method shows its EGP total and percentage share of the overall revenue.

---

### Tab 3 — Details

A granular drill-down into what exactly generated the revenue during the selected period.

#### Gaming by Room Type

A ranked list of every asset *type* (not individual rooms) showing how much revenue each category generated. Types supported:

| Type | Icon | Arabic |
|------|------|--------|
| PlayStation | 🎮 | بلايستيشن |
| Billiards | 🎱 | بلياردو |
| Air Hockey | 🏒 | هوكي الهواء |
| Babyfoot | ⚽ | كرة القدم المصغرة |
| Other | 🕹️ | أخرى |

For each type you see:
- Total EGP revenue
- Number of sessions completed
- Share bar (percentage of gaming total)

#### Room Orders by Category

A list of product categories (e.g. Drinks, Snacks) for orders placed inside rooms. Each category expands to show individual products with:
- Product name
- Quantity sold
- Total EGP earned

Categories are ranked highest revenue first. Products within each category are also ranked highest first.

#### Buffet / POS by Category

Identical layout to Room Orders above, but for walk-up counter sales that have no session attached.

---

### Tab 4 — Shifts

Analytics for each staff shift within the selected period. Shows newest shifts first.

#### Shift Card

Each shift displays:

| Field | Description |
|-------|-------------|
| **Staff name** | The cashier or manager who opened the shift |
| **Status** | Open (currently active) or Closed |
| **Duration** | How long the shift lasted (or has been running if still open) |
| **Opened at / Closed at** | Exact timestamps |
| **Sessions** | Number of gaming sessions started during this shift |
| **Orders** | Number of delivered/closed orders during this shift |
| **Gaming Revenue** | EGP from gaming during this shift |
| **Room Orders** | EGP from room orders during this shift |
| **POS Revenue** | EGP from counter sales during this shift |
| **Total Revenue** | Sum of all three above |
| **Cash breakdown** | How much came in via Cash / InstaPay / Visa |
| **Opening cash** | Cash float the cashier started the shift with |
| **Expected cash** | What the system calculated should be in the till at close |
| **Actual cash** | What the cashier actually counted at close |
| **Difference** | Expected minus actual. Zero = balanced ✅. Any other value = discrepancy ⚠️ |

> The cash reconciliation fields only appear on **closed** shifts that were closed with a cash count.

---

## Rooms Panel (inside Overview)

Below the KPI cards on some screen sizes (or accessible via a separate section), the **Rooms Panel** shows per-asset performance for the selected period. For each room/console:

- Asset name + type emoji
- Current status (Available / Busy / Maintenance)
- Sessions count and total minutes played
- Gaming revenue for the period
- Room orders revenue generated from this room
- Total combined revenue
- Price per hour

Rooms are sorted by total revenue (highest earner first).

---

## Permissions

| Role | Can see dashboard |
|------|-------------------|
| Platform Owner | ✅ Full access |
| Owner | ✅ Full access |
| Manager | ✅ Full access |
| Cashier | ✅ Full access |
| Staff / Kitchen | ❌ No access |

---

## How Revenue Is Calculated (Technical Notes)

Understanding these rules helps avoid confusion when comparing numbers:

1. **Ground truth = verified payments.** Revenue is always summed from the `payments` table where `status = 'verified'`. Unverified or pending payments do not count.

2. **Gaming Revenue = Session Payments − Room Orders.** When a session is closed and paid, the payment often covers both the gaming time *and* any food/drinks consumed in the room. To avoid counting room orders twice (once in Gaming, once in Room Orders), the formula subtracts room order totals from session-linked payments.

3. **Buffet / POS Revenue = orders with no session.** Any delivered or closed order that has no `sessionId` attached is counted as Buffet/POS income regardless of where it was placed from.

4. **Period boundaries.** "Today" = midnight of today's date. "Week" = today minus 6 full days. "Month" = today minus 29 full days. All comparisons are inclusive of the start date.

5. **Shifts use their own time window.** Each shift's analytics are computed using that shift's `openedAt` → `closedAt` window, not the global period filter. This means the same order can appear in both the "Today" period view and in a shift that spans midnight.

---

## Mobile Experience

On screens narrower than 768 px the dashboard adapts:

- Tab navigation moves to a **bottom bar** with icons and labels
- The **filter button** (top-right) opens a full bottom sheet instead of inline pills
- Revenue cards switch to a compact **hero card** layout to maximize vertical space
- The pending orders count shows as a **blue dot badge** on the Overview tab icon when there are outstanding orders

---

## Auto-Refresh

| Data | Refresh interval |
|------|-----------------|
| Summary KPIs (revenue today, active sessions, orders) | Every 10 seconds |
| Active sessions list | Every 10 seconds |
| Revenue / breakdown / rooms / shifts | On-demand (when you change a filter or tab) |
