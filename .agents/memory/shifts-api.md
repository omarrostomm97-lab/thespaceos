---
name: Shifts API — no-shift response
description: GET /api/shifts/current must return 200+null, not 404, when no shift is open.
---

## Rule
`GET /api/shifts/current` returns `200` with body `null` when no shift is currently open.
It does NOT return 404.

**Why:** React Query treats 404 as a network error and retries 3× with backoff (~7s total).
During retries `isLoading` stays true, so the Shifts page shows a spinner and never renders.
"No current shift" is a valid normal state, not an error condition.

**How to apply:**
- API route (`shifts.ts`): `if (!shift) { res.json(null); return; }`
- UI (`shifts.tsx`): also guard `(isLoadingCurrent && !isCurrentShiftError) || isLoadingList`
  so a real API error (500) also unblocks the spinner.
