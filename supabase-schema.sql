-- ============================================================
-- SQL SCRIPT: Tạo bảng posts chuẩn SEO cho N.A.T Automation
-- Chạy trên Supabase SQL Editor (https://app.supabase.com)
-- ============================================================

-- Bước 1: Xóa bảng posts cũ (nếu có) và tạo mới với đầy đủ cột SEO
-- ⚠️ CẢNH BÁO: Lệnh này sẽ XÓA toàn bộ dữ liệu bài viết cũ.
-- Nếu muốn giữ dữ liệu cũ, hãy dùng ALTER TABLE ở Bước 1b thay thế.

-- === CHỌN 1 TRONG 2 PHƯƠNG ÁN DƯỚI ĐÂY ===

-- ╔══════════════════════════════════════════════════════════╗
-- ║ PHƯƠNG ÁN A: TẠO MỚI TỪ ĐẦU (Nếu chưa có dữ liệu)  ║
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

-- Tạo index để tìm kiếm nhanh theo slug
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
-- Tạo index để sắp xếp theo ngày
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
-- Tạo index để lọc theo category
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Bật RLS (Row Level Security) - Cho phép đọc public
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép tất cả mọi người đọc
CREATE POLICY "Allow public read" ON posts
  FOR SELECT USING (true);

-- Policy: Cho phép insert/update/delete (cho authenticated hoặc anon key)
CREATE POLICY "Allow all write" ON posts
  FOR ALL USING (true) WITH CHECK (true);


-- ╔══════════════════════════════════════════════════════════╗
-- ║ PHƯƠNG ÁN B: GIỮ DỮ LIỆU CŨ (Nếu đã có bài viết)    ║
-- ║ Chỉ chạy các lệnh ALTER bên dưới thay cho Phương Án A  ║
-- ╚══════════════════════════════════════════════════════════╝

-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'kien-thuc';
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- 
-- Sau đó cập nhật slug cho các bài viết cũ (chạy riêng):
-- UPDATE posts SET slug = lower(
--   regexp_replace(
--     regexp_replace(
--       regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
--       '\s+', '-', 'g'
--     ),
--     '-+', '-', 'g'
--   )
-- ) WHERE slug IS NULL;
