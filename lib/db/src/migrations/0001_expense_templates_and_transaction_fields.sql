-- Migration: Add expense_templates table and extend finance_transactions
-- Applied: 2026-06-10

-- Expense templates table
CREATE TABLE IF NOT EXISTS expense_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  title TEXT NOT NULL,
  title_ar TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  category_id INTEGER REFERENCES finance_categories(id),
  account_id INTEGER REFERENCES finance_accounts(id),
  payment_method TEXT DEFAULT 'cash',
  frequency TEXT NOT NULL DEFAULT 'daily',
  apply_day INTEGER,
  auto_apply BOOLEAN NOT NULL DEFAULT FALSE,
  deduct_from_shift BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Extend finance_transactions with template tracking and shift deduction fields
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES expense_templates(id);
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS deduct_from_shift BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS shift_id INTEGER REFERENCES shifts(id);

-- Add apply_day and account_id to expense_templates (idempotent)
ALTER TABLE expense_templates ADD COLUMN IF NOT EXISTS apply_day INTEGER;
ALTER TABLE expense_templates ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES finance_accounts(id);
