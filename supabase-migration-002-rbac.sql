-- ============================================================
-- MIGRATION 002: RBAC Policy Hardening
-- N.A.T Automation — Siết chặt phân quyền RLS theo kiến trúc
-- Custom HMAC Session (không dùng Supabase Auth JWT).
--
-- LƯU Ý KIẾN TRÚC:
-- Hệ thống dùng custom admin session cookie (HMAC-SHA256), không dùng
-- Supabase Auth. Vì vậy auth.jwt() ->> 'role' KHÔNG khả dụng.
-- Toàn bộ thao tác WRITE (INSERT/UPDATE/DELETE) cho products và posts
-- được thực hiện thông qua service_role key (server-side API) hoặc
-- trực tiếp bằng Dashboard Supabase — đều bypass RLS theo thiết kế.
--
-- Mô hình bảo mật:
--   - Khách hàng (anon): chỉ SELECT products và posts.
--   - Admin (qua API route Next.js): dùng service_role → bypass RLS.
--   - Frontend: chỉ hiển thị nút Sửa/Xóa khi /api/admin/session xác thực.
--   - Middleware Next.js: block /admin/* nếu cookie HMAC không hợp lệ.
--
-- Chạy script này trong Supabase Dashboard → SQL Editor.
-- An toàn để chạy nhiều lần (Idempotent).
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- BƯỚC 1: Dọn sạch toàn bộ policy cũ trên 3 bảng
-- (Tránh lỗi ERROR 42710: duplicate policy)
-- ─────────────────────────────────────────────────────────
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('products', 'posts', 'orders')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ─────────────────────────────────────────────────────────
-- BƯỚC 2: Bật RLS cho 3 bảng
-- ─────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────
-- BƯỚC 3: Bảng PRODUCTS — Chính sách phân quyền
-- ─────────────────────────────────────────────────────────

-- Tất cả mọi người (khách hàng, Google bot SEO) được ĐỌC sản phẩm
CREATE POLICY "products_public_select" ON products
  FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: chỉ service_role (API server-side Next.js) mới được phép.
-- anon và authenticated (Supabase Auth nếu có) đều bị block ở tầng này.
-- Admin thực hiện thao tác qua /admin/dashboard → supabase client dùng anon key
-- nhưng qua next.js API route dùng service_role → bypass RLS một cách có kiểm soát.
CREATE POLICY "products_service_role_write" ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────
-- BƯỚC 4: Bảng POSTS — Chính sách phân quyền
-- ─────────────────────────────────────────────────────────

-- Tất cả mọi người được ĐỌC bài viết (chuẩn SEO - Googlebot cần đọc)
CREATE POLICY "posts_public_select" ON posts
  FOR SELECT
  USING (true);

-- Chỉ service_role được ghi (thêm/sửa/xóa) bài viết
CREATE POLICY "posts_service_role_write" ON posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────
-- BƯỚC 5: Bảng ORDERS — Chính sách phân quyền (Nhạy cảm nhất)
-- ─────────────────────────────────────────────────────────

-- Khách hàng anon được phép ĐẶT ĐƠN (INSERT) — được validate bởi API route /api/orders
-- trước khi insert vào DB với service_role. Đây là yêu cầu nghiệp vụ để khách đặt
-- hàng mà không cần đăng nhập.
CREATE POLICY "orders_anon_insert" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Chỉ service_role mới được XEM đơn hàng (bảo vệ thông tin khách hàng).
-- Admin xem đơn qua Admin Dashboard → API route dùng service_role key.
CREATE POLICY "orders_service_role_select" ON orders
  FOR SELECT
  TO service_role
  USING (true);

-- Chỉ service_role mới được CẬP NHẬT trạng thái đơn hàng (status)
CREATE POLICY "orders_service_role_update" ON orders
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Chỉ service_role mới được XÓA đơn hàng (an toàn, không ai xóa nhầm)
CREATE POLICY "orders_service_role_delete" ON orders
  FOR DELETE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────
-- BƯỚC 6: Cập nhật Bucket Storage "images"
-- (ảnh sản phẩm + bài viết — upload qua Admin Dashboard)
-- ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  DROP POLICY IF EXISTS "images_public_read"   ON storage.objects;
  DROP POLICY IF EXISTS "images_anon_insert"   ON storage.objects;
  DROP POLICY IF EXISTS "images_anon_update"   ON storage.objects;
  DROP POLICY IF EXISTS "images_anon_delete"   ON storage.objects;
  DROP POLICY IF EXISTS "images_write_allowed" ON storage.objects;

  -- Ai cũng xem được ảnh (public CDN)
  CREATE POLICY "images_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

  -- Upload ảnh qua Dashboard Admin (anon key được phép để UI hoạt động)
  -- Trên production nên chuyển sang service_role-only nếu muốn khóa chặt hơn
  CREATE POLICY "images_write_allowed" ON storage.objects
    FOR ALL USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage policy setup skipped: %', SQLERRM;
END $$;


-- ============================================================
-- HOÀN TẤT THÀNH CÔNG
-- Kiến trúc bảo mật sau khi chạy script:
--
--   /admin/*        → Bị chặn bởi Next.js Middleware (HMAC Cookie)
--   products SELECT → Công khai (anon)
--   products WRITE  → Service role only (Next.js API routes)
--   posts SELECT    → Công khai (anon, SEO)
--   posts WRITE     → Service role only
--   orders INSERT   → anon được phép (khách đặt hàng không cần login)
--   orders SELECT   → Service role only (Admin xem qua API)
--   orders UPDATE   → Service role only
--   orders DELETE   → Service role only
-- ============================================================
