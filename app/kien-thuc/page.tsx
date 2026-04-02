import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, ArrowRight, Tag } from "lucide-react";
import { getPosts, type Post } from "../utils/supabase";

export const metadata: Metadata = {
  title: "Kiến Thức & Hướng Dẫn Sửa Chữa Máy CNC | N.A.T Automation",
  description:
    "Tổng hợp kiến thức kỹ thuật về máy CNC: Hướng dẫn sửa lỗi Fanuc, Siemens, Mitsubishi, cách bảo trì CNC định kỳ, xử lý lỗi trục X/Y/Z, servo overload, spindle alarm và nhiều bài viết chuyên sâu khác từ đội ngũ kỹ sư N.A.T.",
  keywords: [
    "kiến thức cnc",
    "tài liệu cnc",
    "hướng dẫn sửa máy cnc",
    "lỗi fanuc",
    "lỗi siemens",
    "lỗi mitsubishi",
    "bảo trì cnc",
    "sửa servo",
    "sửa trục X CNC",
    "sửa chữa máy cnc",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/kien-thuc",
  },
  openGraph: {
    title: "Kiến Thức & Hướng Dẫn Sửa Chữa Máy CNC | N.A.T Automation",
    description:
      "Tổng hợp bài viết kỹ thuật CNC chuyên sâu từ đội ngũ kỹ sư N.A.T Automation.",
    url: "https://tailieucnc.xyz/kien-thuc",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "N.A.T Automation Kiến thức CNC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiến Thức CNC - N.A.T Automation",
    description: "Hướng dẫn sửa lỗi, bảo trì, nâng cấp máy CNC chuyên sâu.",
  },
};

// Category labels
const categoryLabels: Record<string, string> = {
  "kien-thuc": "Kiến thức",
  "sua-chua": "Sửa chữa",
  "bao-tri": "Bảo trì",
  "linh-kien": "Linh kiện",
  "huong-dan": "Hướng dẫn",
};

export default async function KienThucPage() {
  const posts: Post[] = await getPosts();

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-sky-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/" aria-label="Quay lại trang chủ">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg uppercase truncate">
          Kiến Thức & Hướng Dẫn Sửa Chữa Máy CNC
        </h1>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Giới thiệu Pillar Page */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <BookOpen size={16} />
            Góc Kỹ Thuật N.A.T
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase mb-2">
            Tài Liệu & Hướng Dẫn Kỹ Thuật
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Chia sẻ kinh nghiệm thực tế từ đội ngũ kỹ sư N.A.T: Sửa lỗi máy
            CNC, bảo dưỡng, nâng cấp hệ thống điều khiển Fanuc, Siemens,
            Mitsubishi. Mỗi bài viết là một giải pháp kỹ thuật thực chiến.
          </p>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
        </section>

        {/* Danh sách bài viết */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Chưa có bài viết nào.</p>
            <p className="text-sm mt-2">Hãy thêm bài từ trang Quản trị → Mục &quot;Bài Viết SEO&quot;.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: Post) => {
              const label = categoryLabels[post.category] || post.category || "Kiến thức";
              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Ảnh bìa */}
                  <div className="aspect-video bg-slate-100 overflow-hidden relative">
                    <img
                      src={post.image || "https://via.placeholder.com/600x400?text=N.A.T+CNC"}
                      alt={`${post.title} - kiến thức sửa chữa máy CNC`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                      <Tag size={10} /> {label}
                    </span>
                  </div>

                  {/* Nội dung card */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Ngày đăng */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                      <Calendar size={12} />
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString("vi-VN")}
                      </time>
                    </div>

                    {/* Tiêu đề */}
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
                      {post.title}
                    </h3>

                    {/* Mô tả SEO (ưu tiên meta_description) */}
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                      {post.meta_description || post.content?.substring(0, 120) + "..."}
                    </p>

                    {/* Link đọc tiếp */}
                    <Link
                      href={`/kien-thuc/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sky-600 font-bold text-sm hover:text-orange-600 transition mt-auto"
                    >
                      Đọc tiếp <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
