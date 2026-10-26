-- ============================================================
-- SQL SCRIPT: Tạo bảng posts chuẩn SEO cho N.A.T Automation
-- Chạy trên Supabase SQL Editor (https://app.supabase.com)
-- Idempotent script: Safe to run multiple times
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ PHƯƠNG ÁN A: TẠO MỚI TỪ ĐẦU (Nếu chưa có dữ liệu)        ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'kien-thuc',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sắp xếp và lọc (Cột slug UNIQUE đã tự động có UNIQUE index trong Postgres)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_posts_updated_at ON posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Bật Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Dọn sạch policies cũ nếu có
DROP POLICY IF EXISTS "Allow public read" ON posts;
DROP POLICY IF EXISTS "Allow all write" ON posts;
DROP POLICY IF EXISTS "authenticated_insert_posts" ON posts;
DROP POLICY IF EXISTS "service_role_insert_posts" ON posts;
DROP POLICY IF EXISTS "authenticated_update_posts" ON posts;
DROP POLICY IF EXISTS "service_role_update_posts" ON posts;
DROP POLICY IF EXISTS "authenticated_delete_posts" ON posts;
DROP POLICY IF EXISTS "service_role_delete_posts" ON posts;

-- Policy 1: Mọi người (public + bot SEO) đều được phép đọc bài viết
CREATE POLICY "Allow public read" ON posts
  FOR SELECT
  USING (true);

-- Policy 2: Chỉ tài khoản authenticated (Admin) hoặc service_role mới được thêm/sửa/xóa bài viết
CREATE POLICY "authenticated_insert_posts" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_insert_posts" ON posts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "authenticated_update_posts" ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_update_posts" ON posts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_posts" ON posts
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "service_role_delete_posts" ON posts
  FOR DELETE
  TO service_role
  USING (true);

-- ╔══════════════════════════════════════════════════════════╗
-- ║ PHƯƠNG ÁN B: GIỮ DỮ LIỆU CŨ (Nếu đã có bài viết)         ║
-- ║ Chỉ chạy các lệnh ALTER bên dưới thay cho Phương Án A    ║
-- ╚══════════════════════════════════════════════════════════╝
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'kien-thuc';
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
