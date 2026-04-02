import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "../../utils/supabase";
import { notFound } from "next/navigation";

// Hàm tạo slug tự động từ title (dùng khi chưa có column slug)
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

// === Fetch bài viết theo slug ===
async function getPostBySlug(slug: string) {
  // Thử tìm theo column slug trước (nếu có)
  const { data: bySlug } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (bySlug) return bySlug;

  // Fallback: tìm theo title đã convert sang slug
  const { data: allPosts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!allPosts) return null;

  return allPosts.find(
    (post) => (generateSlug(post.title) || `post-${post.id}`) === slug
  ) || null;
}

// === GENERATE METADATA ĐỘNG ===
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Bài viết bạn tìm kiếm không tồn tại.",
    };
  }

  // Tạo mô tả SEO từ nội dung bài viết (cắt 160 ký tự)
  const seoDescription = post.content
    ? post.content.substring(0, 160).trim() + "..."
    : `Đọc bài viết "${post.title}" - Kiến thức kỹ thuật CNC từ N.A.T Automation. Sửa chữa máy CNC, bảo trì, linh kiện chính hãng.`;

  // Tạo slug keyword tự nhiên
  const titleKeywords = post.title
    .toLowerCase()
    .split(" ")
    .filter((w: string) => w.length > 2);

  return {
    title: post.title,
    description: seoDescription,
    keywords: [
      ...titleKeywords,
      "kiến thức cnc",
      "sửa chữa máy cnc",
      "N.A.T Automation",
    ],
    alternates: {
      canonical: `https://tailieucnc.xyz/kien-thuc/${slug}`,
    },
    openGraph: {
      title: `${post.title} | N.A.T Automation`,
      description: seoDescription,
      url: `https://tailieucnc.xyz/kien-thuc/${slug}`,
      type: "article",
      publishedTime: post.created_at,
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "N.A.T Automation" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: seoDescription,
      images: post.image ? [post.image] : ["/og-image.png"],
    },
  };
}

// === JSON-LD Article Schema ===
function ArticleSchema({ post, slug }: { post: any; slug: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.content?.substring(0, 160) || post.title,
    image: post.image || "https://tailieucnc.xyz/og-image.png",
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Organization",
      name: "N.A.T Automation",
      url: "https://tailieucnc.xyz",
    },
    publisher: {
      "@type": "Organization",
      name: "Công Ty TNHH Tự Động Hóa N.A.T",
      logo: {
        "@type": "ImageObject",
        url: "https://tailieucnc.xyz/og-image.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tailieucnc.xyz/kien-thuc/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function KienThucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch bài viết liên quan (3 bài gần nhất, không bao gồm bài hiện tại)
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("id, title, image, created_at, slug")
    .neq("id", post.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <ArticleSchema post={post} slug={slug} />

      {/* Header */}
      <header className="bg-sky-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/kien-thuc" aria-label="Quay lại danh sách bài viết">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-sm md:text-lg uppercase truncate">
          Kiến Thức Kỹ Thuật
        </h1>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <article itemScope itemType="https://schema.org/Article">
          {/* Ảnh bìa */}
          {post.image && (
            <figure className="rounded-2xl overflow-hidden shadow-xl mb-8 border-4 border-white">
              <img
                src={post.image}
                alt={`Hình minh họa: ${post.title} - sửa chữa máy CNC tại xưởng N.A.T`}
                className="w-full h-64 md:h-96 object-cover"
                itemProp="image"
              />
            </figure>
          )}

          {/* Meta thông tin */}
          <div className="flex items-center gap-3 text-slate-400 text-sm mb-4">
            <Calendar size={14} />
            <time dateTime={post.created_at} itemProp="datePublished">
              {new Date(post.created_at).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">
              Kiến thức CNC
            </span>
          </div>

          {/* Tiêu đề */}
          <h2
            className="text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-6"
            itemProp="headline"
          >
            {post.title}
          </h2>

          <div className="w-20 h-1 bg-orange-500 rounded-full mb-8"></div>

          {/* Nội dung bài viết */}
          <section
            className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-justify"
            itemProp="articleBody"
          >
            {post.content}
          </section>

          {/* CTA Box */}
          <aside className="mt-12 bg-gradient-to-r from-sky-900 to-indigo-900 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              Cần hỗ trợ kỹ thuật chuyên sâu?
            </h3>
            <p className="text-sky-100 mb-6">
              Đội ngũ kỹ sư N.A.T sẵn sàng tư vấn miễn phí 24/7
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:0912258461"
                className="bg-yellow-500 text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition flex items-center gap-2"
              >
                <Phone size={18} /> 0912.258.461
              </a>
              <a
                href="https://zalo.me/0912258461"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition flex items-center gap-2"
              >
                <MessageCircle size={18} /> Chat Zalo
              </a>
            </div>
          </aside>
        </article>

        {/* Bài viết liên quan */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase">
              Bài viết liên quan
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => {
                const relSlug =
                  related.slug ||
                  generateSlug(related.title) ||
                  `post-${related.id}`;
                return (
                  <Link
                    key={related.id}
                    href={`/kien-thuc/${relSlug}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={
                          related.image ||
                          "https://via.placeholder.com/400x200?text=CNC"
                        }
                        alt={`Bài liên quan: ${related.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-sky-700 transition-colors">
                        {related.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-sky-600 text-xs font-bold mt-2">
                        Đọc tiếp <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
