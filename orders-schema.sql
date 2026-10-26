-- ============================================================
-- SQL SCRIPT: Tạo bảng orders cho hệ thống Checkout
-- N.A.T Automation - Thanh toán VietQR
-- Chạy trên Supabase SQL Editor (https://app.supabase.com)
-- Idempotent script: Safe to run multiple times
-- ============================================================

-- Bước 1: Tạo extension pgcrypto nếu chưa có
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bước 2: Tạo bảng orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  company_name TEXT,                          -- Optional: Tên công ty (xuất hóa đơn VAT)
  tax_code TEXT,                              -- Optional: Mã số thuế
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  transfer_content TEXT NOT NULL,             -- Nội dung CK: order_code (VD: NAT-AB12CD)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  items JSONB,                                -- Snapshot giỏ hàng: [{id, name, price, quantity, image}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bước 3: Tạo index để query nhanh
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);

-- Bước 4: Bật Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Bước 5: Xóa các policy cũ để tránh trùng lặp hoặc lỏng lẻo
DROP POLICY IF EXISTS "Allow anon insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated read orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "service_role_select_orders" ON orders;
DROP POLICY IF EXISTS "service_role_update_orders" ON orders;
DROP POLICY IF EXISTS "service_role_insert_orders" ON orders;
DROP POLICY IF EXISTS "authenticated_select_orders" ON orders;
DROP POLICY IF EXISTS "authenticated_update_orders" ON orders;

-- Bước 6: Thiết lập Policies bảo mật chuẩn
-- 6a. Cho phép anon và service_role INSERT đơn hàng (được server API validate)
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "service_role_insert_orders" ON orders
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 6b. Chỉ authenticated (Admin) và service_role được xem đơn hàng (BẢO VỆ THÔNG TIN KHÁCH HÀNG)
CREATE POLICY "authenticated_select_orders" ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "service_role_select_orders" ON orders
  FOR SELECT
  TO service_role
  USING (true);

-- 6c. Chỉ authenticated (Admin) và service_role được cập nhật trạng thái đơn
CREATE POLICY "authenticated_update_orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_update_orders" ON orders
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
