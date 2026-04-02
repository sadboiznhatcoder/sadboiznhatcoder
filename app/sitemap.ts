import { MetadataRoute } from "next";
import { supabase } from "./utils/supabase";

// Hàm tạo slug tự động từ title 
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Các trang dịch vụ Local SEO
const localServiceSlugs = [
  "sua-may-cnc-tay-ninh",
  "sua-may-cnc-tphcm",
  "sua-may-cnc-binh-duong",
  "sua-may-cnc-dong-nai",
  "sua-may-cnc-ha-noi",
  "sua-may-cnc-long-an",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tailieucnc.xyz";

  // === TRANG TĨNH ===
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/sua-chua`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bao-duong`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mua-ban`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/linh-kien`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kien-thuc`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // === TRANG DỊCH VỤ LOCAL SEO ===
  const localRoutes: MetadataRoute.Sitemap = localServiceSlugs.map((slug) => ({
    url: `${baseUrl}/dich-vu/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // === TRANG BÀI VIẾT ĐỘNG (TỪ SUPABASE) ===
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, slug, created_at")
      .order("created_at", { ascending: false });

    if (posts) {
      postRoutes = posts.map((post) => ({
        url: `${baseUrl}/kien-thuc/${post.slug || generateSlug(post.title) || `post-${post.id}`}`,
        lastModified: new Date(post.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Lỗi fetch bài viết:", error);
  }

  return [...staticRoutes, ...localRoutes, ...postRoutes];
}