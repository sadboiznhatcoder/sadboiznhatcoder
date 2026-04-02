import { createClient } from "@supabase/supabase-js";

// === SUPABASE CLIENT ===
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// TypeScript Interfaces (Strict Typing)
// ============================================================

/** Cấu trúc đầy đủ của một bài viết SEO trong Supabase */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  category: string;
  image: string;
  created_at: string;
  updated_at: string;
}

/** Dữ liệu cần thiết khi tạo/cập nhật bài viết */
export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  category: string;
  image: string;
}

/** Cấu trúc sản phẩm (giữ nguyên logic cũ) */
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: number;
  images: string[];
  created_at: string;
}

// ============================================================
// Hàm tiện ích: Tạo slug từ tiếng Việt
// ============================================================

/** Chuyển đổi tiêu đề tiếng Việt thành slug URL-safe */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Chỉ giữ chữ, số, space, gạch ngang
    .replace(/\s+/g, "-") // Space → gạch ngang
    .replace(/-+/g, "-") // Gộp nhiều gạch ngang
    .replace(/^-|-$/g, ""); // Xóa gạch ngang đầu/cuối
}

// ============================================================
// API FUNCTIONS: Posts (Bài viết SEO)
// ============================================================

/** Lấy tất cả bài viết, sắp xếp mới nhất trước */
export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPosts error:", error.message);
    return [];
  }

  return (data as Post[]) || [];
}

/** Lấy bài viết theo slug (chính xác) */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Post;
}

/** Tạo bài viết mới */
export async function createPost(
  formData: PostFormData
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("posts").insert([
    {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      meta_description: formData.meta_description,
      category: formData.category,
      image: formData.image,
    },
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Cập nhật bài viết theo ID */
export async function updatePost(
  id: string,
  formData: PostFormData
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("posts")
    .update({
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      meta_description: formData.meta_description,
      category: formData.category,
      image: formData.image,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Xóa bài viết theo ID */
export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// API FUNCTIONS: Posts cho Sitemap (chỉ lấy slug + date)
// ============================================================

/** Lấy danh sách slug + ngày cho sitemap (tối ưu query) */
export async function getPostSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPostSlugs error:", error.message);
    return [];
  }

  return (data as { slug: string; updated_at: string }[]) || [];
}