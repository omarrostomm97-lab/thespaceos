-- repair-closed-order-totals.sql
-- Idempotent repair: corrects total_cost only for ended sessions where the
-- stored value is LESS THAN the sum of all settled (delivered + closed) orders.
--
-- Why this condition is safe:
--   total_cost = gaming_cost + order_cost, and gaming_cost >= 0 always.
--   Therefore a correct total_cost can never be less than the sum of all settled
--   orders.  If total_cost < sum(delivered+closed), the session was ended while
--   closed orders were excluded — this uniquely identifies affected rows.
--
-- IDEMPOTENT: re-running will find 0 rows to update once all affected sessions
-- have been corrected, because after the update total_cost >= sum(settled orders).
--
-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1 — Preview affected sessions (review before running Step 2):
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  s.id                                                                       AS session_id,
  s.total_cost                                                               AS stored_total,
  COALESCE(SUM(o.total_amount::numeric) FILTER (WHERE o.status = 'closed'), 0)
                                                                             AS missed_closed_total,
  s.total_cost
    + COALESCE(SUM(o.total_amount::numeric) FILTER (WHERE o.status = 'closed'), 0)
                                                                             AS corrected_total
FROM sessions s
LEFT JOIN orders o ON o.session_id = s.id
WHERE s.status = 'ended'
GROUP BY s.id, s.total_cost
HAVING s.total_cost < COALESCE(
  SUM(o.total_amount::numeric) FILTER (WHERE o.status IN ('delivered', 'closed')), 0
)
ORDER BY s.id DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2 — Apply correction (uncomment after reviewing Step 1 output):
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE sessions s
-- SET total_cost = s.total_cost + sub.missed
-- FROM (
--   SELECT o.session_id,
--          SUM(o.total_amount::numeric) AS missed
--   FROM orders o
--   WHERE o.status = 'closed'
--   GROUP BY o.session_id
-- ) sub
-- WHERE s.id = sub.session_id
--   AND s.status = 'ended'
--   AND s.total_cost < (
--     SELECT COALESCE(SUM(o2.total_amount::numeric), 0)
--     FROM orders o2
--     WHERE o2.session_id = s.id
--       AND o2.status IN ('delivered', 'closed')
--   );
