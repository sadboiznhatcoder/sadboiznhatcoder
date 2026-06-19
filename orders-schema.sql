-- ============================================================
-- SQL SCRIPT: Tạo bảng orders cho hệ thống Checkout
-- N.A.T Automation - Thanh toán VietQR
-- Chạy trên Supabase SQL Editor (https://app.supabase.com)
-- ============================================================

-- Bước 1: Tạo bảng orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  company_name TEXT,                          -- Optional: Tên công ty (xuất hóa đơn VAT)
  tax_code TEXT,                              -- Optional: Mã số thuế
  total_amount NUMERIC NOT NULL,
  transfer_content TEXT NOT NULL,             -- Nội dung CK tự động: TENKHACHHANG0912345678
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | paid | shipped | completed | cancelled
  items JSONB,                                -- Snapshot giỏ hàng: [{name, price, quantity, image}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bước 2: Tạo index để query nhanh
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Bước 3: Bật Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Bước 4: Policy cho phép user ẩn danh (anon) INSERT đơn hàng
-- Khách hàng không cần đăng nhập vẫn đặt hàng được
CREATE POLICY "Allow anon insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Bước 5: Policy cho phép đọc (dành cho Admin xem đơn hàng)
-- Trong thực tế bạn có thể giới hạn chỉ authenticated users mới đọc được
CREATE POLICY "Allow authenticated read orders" ON orders
  FOR SELECT
  USING (true);

-- ============================================================
-- DONE! Sau khi chạy xong, kiểm tra:
-- 1. Vào Table Editor → orders → đã tạo thành công
-- 2. Vào Authentication → Policies → orders → 2 policies đã bật
-- ============================================================
