-- ============================================================
-- Banana Gaming Center — Initial Stock Count
-- Run this against your PRODUCTION PostgreSQL database.
-- Tenant: Banana Gaming Center (tenant_id = 3)
-- Created by: Platform Admin (user_id = 1)
-- Movement reason: Initial Banana stock count
-- ============================================================

BEGIN;

-- ── STEP 1: Confirm Banana tenant_id ─────────────────────────
-- This will error if Banana is not tenant_id=3, keeping you safe.
DO $$
DECLARE
  t_id INTEGER;
BEGIN
  SELECT id INTO t_id FROM tenants WHERE name ILIKE '%banana%' LIMIT 1;
  IF t_id IS NULL THEN
    RAISE EXCEPTION 'Banana tenant not found. Check your tenants table.';
  END IF;
  IF t_id != 3 THEN
    RAISE EXCEPTION 'Banana tenant_id is % (expected 3). Update this script before running.', t_id;
  END IF;
  RAISE NOTICE 'Banana tenant confirmed: id=%', t_id;
END $$;

-- ── STEP 2: Update existing items for Banana (tenant_id=3) ───
UPDATE inventory_items
SET
  current_stock   = CASE id
    WHEN 61 THEN 5     -- Redbull  → cans
    WHEN 62 THEN 40    -- Fury     → cans
    WHEN 70 THEN 21    -- Todo     → pieces
    WHEN 67 THEN 10    -- Moro     → pieces
    WHEN 68 THEN 12    -- Galaxy Flutes → pieces
    WHEN 64 THEN 20    -- Hohos    → pieces
    WHEN 65 THEN 44    -- Twinkies → pieces
    WHEN 73 THEN 14    -- Doro     → packets
    WHEN 71 THEN 12    -- Oreo     → packets
    WHEN 72 THEN 13    -- Ulker    → packets
    WHEN 22 THEN 225   -- Tea      → packets
    WHEN 23 THEN 42    -- Green Tea → packets
    WHEN 25 THEN 100   -- Roselle (Hibiscus) → packets
    WHEN 26 THEN 100   -- Mint     → packets
    WHEN 24 THEN 92    -- Anise    → packets
  END,
  unit            = CASE id
    WHEN 61 THEN 'cans'    WHEN 62 THEN 'cans'
    WHEN 70 THEN 'pieces'  WHEN 67 THEN 'pieces'
    WHEN 68 THEN 'pieces'  WHEN 64 THEN 'pieces'
    WHEN 65 THEN 'pieces'
    WHEN 73 THEN 'packets' WHEN 71 THEN 'packets'
    WHEN 72 THEN 'packets' WHEN 22 THEN 'packets'
    WHEN 23 THEN 'packets' WHEN 25 THEN 'packets'
    WHEN 26 THEN 'packets' WHEN 24 THEN 'packets'
  END,
  min_stock_level = CASE id
    WHEN 22 THEN 20  WHEN 23 THEN 20
    WHEN 24 THEN 20  WHEN 25 THEN 20  WHEN 26 THEN 20
    ELSE 5
  END
WHERE id IN (22,23,24,25,26,61,62,64,65,67,68,70,71,72,73)
  AND tenant_id = 3;

-- ── STEP 3: Create new items (skip if already exist) ─────────
INSERT INTO inventory_items (tenant_id, name, name_ar, unit, current_stock, min_stock_level)
VALUES
  (3, 'Pepsi',                    'بيبسي',                  'cans',    49,     5  ),
  (3, '7up',                      'سفن أب',                 'cans',    40,     5  ),
  (3, 'Birell',                   'بيريل',                  'cans',    20,     5  ),
  (3, 'Fayrouz',                  'فيروز',                  'cans',    14,     5  ),
  (3, 'Fanta',                    'فانتا',                  'cans',    19,     5  ),
  (3, 'V Cola',                   'في كولا',                'cans',    6,      5  ),
  (3, 'V Pink Lemonade',          'في بينك ليمونيد',        'cans',    17,     5  ),
  (3, 'Twist',                    'تويست',                  'cans',    23,     5  ),
  (3, 'Sting',                    'ستينج',                  'cans',    12,     5  ),
  (3, 'Aquafina',                 'أكوافينا',               'bottles', 80,     5  ),
  (3, 'Galaxy Hazelnut',          'جالاكسي هازلنت',         'pieces',  12,     5  ),
  (3, 'Snickers',                 'سنيكرز',                 'pieces',  8,      5  ),
  (3, 'Sunbites Cheese Motabbala','صن بايتس جبنة متبلة',    'packets', 12,     5  ),
  (3, 'Sunbites Sweet Pepper',    'صن بايتس فلفل حلو',      'packets', 14,     5  ),
  (3, 'Crunchy Chili & Lemon',    'كرانشي شطة و ليمون',     'packets', 7,      5  ),
  (3, 'Doritos Cheese',           'دوريتوس جبنة',           'packets', 5,      5  ),
  (3, 'Doritos Sweet Pepper',     'دوريتوس فلفل حلو',       'packets', 12,     5  ),
  (3, 'Chipsy Cheese',            'شيبسي جبنة',             'packets', 5,      5  ),
  (3, 'Chipsy Kebab',             'شيبسي كباب',             'packets', 12,     5  ),
  (3, 'Chipsy Tomato',            'شيبسي طماطم',            'packets', 12,     5  ),
  (3, 'Chipsy Vinegar & Salt',    'شيبسي خل و ملح',         'packets', 15,     5  ),
  (3, 'Flamenco Peanuts',         'فلامنكو سوداني',          'packets', 18,     5  ),
  (3, 'Sugar',                    'سكر',                    'kg',      9,      2  ),
  (3, 'Light Plain Coffee',       'بن فاتح سادة',           'kg',      2.3,    0.1),
  (3, 'Light Mixed Coffee',       'فاتح محوج',              'kg',      0.47,   0.1),
  (3, 'Medium Plain Coffee',      'وسط سادة',               'kg',      0.45,   0.1),
  (3, 'Medium Mixed Coffee',      'وسط محوج',               'kg',      0.23,   0.1),
  (3, 'Dark Plain Coffee',        'غامق سادة',              'kg',      0.115,  0.1)
ON CONFLICT DO NOTHING;

-- ── STEP 4: Stock movement records (all 43 items) ────────────
-- Movements for the 15 updated items
INSERT INTO inventory_movements (tenant_id, inventory_item_id, type, quantity, reason, created_by_user_id)
VALUES
  (3, 22, 'count', 225,   'Initial Banana stock count', 1),
  (3, 23, 'count', 42,    'Initial Banana stock count', 1),
  (3, 24, 'count', 92,    'Initial Banana stock count', 1),
  (3, 25, 'count', 100,   'Initial Banana stock count', 1),
  (3, 26, 'count', 100,   'Initial Banana stock count', 1),
  (3, 61, 'count', 5,     'Initial Banana stock count', 1),
  (3, 62, 'count', 40,    'Initial Banana stock count', 1),
  (3, 64, 'count', 20,    'Initial Banana stock count', 1),
  (3, 65, 'count', 44,    'Initial Banana stock count', 1),
  (3, 67, 'count', 10,    'Initial Banana stock count', 1),
  (3, 68, 'count', 12,    'Initial Banana stock count', 1),
  (3, 70, 'count', 21,    'Initial Banana stock count', 1),
  (3, 71, 'count', 12,    'Initial Banana stock count', 1),
  (3, 72, 'count', 13,    'Initial Banana stock count', 1),
  (3, 73, 'count', 14,    'Initial Banana stock count', 1);

-- Movements for the 28 newly created items (using subquery to get their IDs)
INSERT INTO inventory_movements (tenant_id, inventory_item_id, type, quantity, reason, created_by_user_id)
SELECT 3, id,
  'count',
  current_stock,
  'Initial Banana stock count',
  1
FROM inventory_items
WHERE tenant_id = 3
  AND name IN (
    'Pepsi','7up','Birell','Fayrouz','Fanta','V Cola','V Pink Lemonade',
    'Twist','Sting','Aquafina','Galaxy Hazelnut','Snickers',
    'Sunbites Cheese Motabbala','Sunbites Sweet Pepper','Crunchy Chili & Lemon',
    'Doritos Cheese','Doritos Sweet Pepper','Chipsy Cheese','Chipsy Kebab',
    'Chipsy Tomato','Chipsy Vinegar & Salt','Flamenco Peanuts','Sugar',
    'Light Plain Coffee','Light Mixed Coffee','Medium Plain Coffee',
    'Medium Mixed Coffee','Dark Plain Coffee'
  );

-- ── STEP 5: Verification ─────────────────────────────────────
SELECT name, name_ar, unit, current_stock, min_stock_level
FROM inventory_items
WHERE tenant_id = 3
  AND name IN (
    'Pepsi','7up','Fury','Redbull','Tea','Green Tea',
    'Sugar','Light Plain Coffee','Aquafina'
  )
ORDER BY name;

COMMIT;

-- Done! The transaction above is atomic — if anything fails, nothing is changed.
