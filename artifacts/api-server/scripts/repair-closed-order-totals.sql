-- repair-closed-order-totals.sql
-- One-time repair: add closed-order amounts that were excluded from totalCost
-- for sessions that ended before the closed-order bug was fixed.
--
-- SAFE TO RUN MULTIPLE TIMES: the WHERE clause ensures only sessions that still
-- have an unaccounted closed-order balance are updated.
--
-- Step 1 — Preview affected sessions (run this first, review before updating):
SELECT
  s.id            AS session_id,
  s.total_cost    AS stored_total,
  COALESCE(
    SUM(o.total_amount::numeric) FILTER (WHERE o.status = 'closed'), 0
  )               AS closed_orders_total,
  s.total_cost + COALESCE(
    SUM(o.total_amount::numeric) FILTER (WHERE o.status = 'closed'), 0
  )               AS corrected_total
FROM sessions s
LEFT JOIN orders o ON o.session_id = s.id
WHERE s.status = 'ended'
GROUP BY s.id, s.total_cost
HAVING COALESCE(
  SUM(o.total_amount::numeric) FILTER (WHERE o.status = 'closed'), 0
) > 0
ORDER BY s.id DESC;

-- Step 2 — Apply the correction (uncomment after reviewing Step 1 output):
-- UPDATE sessions s
-- SET total_cost = s.total_cost + sub.missed
-- FROM (
--   SELECT
--     o.session_id,
--     SUM(o.total_amount::numeric) AS missed
--   FROM orders o
--   JOIN sessions s2 ON s2.id = o.session_id
--   WHERE s2.status = 'ended'
--     AND o.status = 'closed'
--   GROUP BY o.session_id
-- ) sub
-- WHERE s.id = sub.session_id;
