import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "../utils/supabase";

export const metadata: Metadata = {
  title: "Kiến Thức CNC - Tài Liệu Kỹ Thuật Máy CNC",
  description:
    "Tổng hợp kiến thức kỹ thuật về máy CNC: Hướng dẫn sửa lỗi Fanuc, Siemens, Mitsubishi, cách bảo trì CNC định kỳ, xử lý lỗi trục X/Y/Z, servo overload và nhiều bài viết chuyên sâu khác.",
  keywords: [
    "kiến thức cnc",
    "tài liệu cnc",
    "hướng dẫn sửa máy cnc",
    "lỗi fanuc",
    "lỗi siemens",
    "bảo trì cnc",
    "sửa servo",
    "sửa trục X CNC",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/kien-thuc",
  },
  openGraph: {
    title: "Kiến Thức CNC - Tài Liệu Kỹ Thuật | N.A.T Automation",
    description:
      "Tổng hợp bài viết kỹ thuật CNC chuyên sâu từ đội ngũ kỹ sư N.A.T Automation. Hướng dẫn sửa lỗi, bảo trì, nâng cấp máy CNC.",
    url: "https://tailieucnc.xyz/kien-thuc",
    type: "website",
  },
};

// Hàm tạo slug tự động từ title (fallback khi chưa có column slug)
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

export default async function KienThucPage() {
  // Fetch tất cả bài viết từ Supabase
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-sky-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/" aria-label="Quay lại trang chủ">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg uppercase truncate">
          Kiến Thức Kỹ Thuật CNC
        </h1>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Giới thiệu */}
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
            Mitsubishi.
          </p>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
        </section>

        {/* Danh sách bài viết */}
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>Chưa có bài viết nào. Hãy thêm bài từ trang Quản trị.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const slug = post.slug || generateSlug(post.title) || `post-${post.id}`;
              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={post.image || "https://via.placeholder.com/600x400?text=N.A.T+CNC"}
                      alt={`Bài viết: ${post.title} - kiến thức sửa chữa máy CNC`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                      <Calendar size={12} />
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString("vi-VN")}
                      </time>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                      {post.content}
                    </p>
                    <Link
                      href={`/kien-thuc/${slug}`}
                      className="inline-flex items-center gap-1 text-sky-600 font-bold text-sm hover:text-orange-600 transition"
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
