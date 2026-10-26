-- ============================================================
-- MIGRATION 001: Security Hardening
-- N.A.T Automation — Idempotent migration for Supabase SQL Editor
-- Safe to run multiple times. NO DROP TABLE — preserves all data.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ────────────────────────────────────────────────────────────
-- 1. ORDERS TABLE — add columns & constraints
-- ────────────────────────────────────────────────────────────

-- 1a. Add order_code column (idempotent via IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_code TEXT UNIQUE NOT NULL DEFAULT '';
  END IF;
END $$;

-- 1b. CHECK constraint: status must be one of the allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled'));
  END IF;
END $$;

-- 1c. CHECK constraint: total_amount must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_total_amount_positive'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_total_amount_positive
      CHECK (total_amount > 0);
  END IF;
END $$;

-- 1d. RLS must be enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1e. DROP the dangerous "Allow authenticated read orders" policy (USING true = anyone reads everything)
DROP POLICY IF EXISTS "Allow authenticated read orders" ON orders;

-- 1f. DROP old anon insert policy (will recreate below)
DROP POLICY IF EXISTS "Allow anon insert orders" ON orders;

-- 1g. CREATE new policies — service_role only for SELECT and UPDATE
DROP POLICY IF EXISTS "service_role_select_orders" ON orders;
CREATE POLICY "service_role_select_orders" ON orders
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "service_role_update_orders" ON orders;
CREATE POLICY "service_role_update_orders" ON orders
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 1h. Keep INSERT for anon — server API route handles validation before insert
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow service_role to insert (for our API route)
DROP POLICY IF EXISTS "service_role_insert_orders" ON orders;
CREATE POLICY "service_role_insert_orders" ON orders
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 2. POSTS TABLE — harden write policies
-- ────────────────────────────────────────────────────────────

-- 2a. Ensure RLS is on
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 2b. DROP the dangerous "Allow all write" policy
DROP POLICY IF EXISTS "Allow all write" ON posts;

-- 2c. Keep public read (idempotent re-create)
DROP POLICY IF EXISTS "Allow public read" ON posts;
CREATE POLICY "Allow public read" ON posts
  FOR SELECT
  USING (true);

-- 2d. INSERT only for authenticated or service_role
DROP POLICY IF EXISTS "authenticated_insert_posts" ON posts;
CREATE POLICY "authenticated_insert_posts" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_insert_posts" ON posts;
CREATE POLICY "service_role_insert_posts" ON posts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2e. UPDATE only for authenticated or service_role
DROP POLICY IF EXISTS "authenticated_update_posts" ON posts;
CREATE POLICY "authenticated_update_posts" ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_update_posts" ON posts;
CREATE POLICY "service_role_update_posts" ON posts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2f. DELETE only for authenticated or service_role
DROP POLICY IF EXISTS "authenticated_delete_posts" ON posts;
CREATE POLICY "authenticated_delete_posts" ON posts
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "service_role_delete_posts" ON posts;
CREATE POLICY "service_role_delete_posts" ON posts
  FOR DELETE
  TO service_role
  USING (true);

-- 2g. Remove redundant idx_posts_slug — the UNIQUE constraint on slug already creates an index
DROP INDEX IF EXISTS idx_posts_slug;

-- 2h. Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and re-create trigger (idempotent)
DROP TRIGGER IF EXISTS set_posts_updated_at ON posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- DONE. Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================
