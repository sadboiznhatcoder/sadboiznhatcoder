import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { getPostBySlug, getPosts, generateSlug, type Post } from "../../utils/supabase";
import { notFound } from "next/navigation";

// ============================================================
// GENERATE METADATA: SEO tự động từ Supabase
// ============================================================

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
      description: "Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  // Ưu tiên meta_description đã nhập từ Admin, fallback sang content cắt 160 ký tự
  const seoDescription =
    post.meta_description ||
    (post.content ? post.content.substring(0, 155).trim() + "..." : `${post.title} - Kiến thức kỹ thuật CNC từ N.A.T Automation.`);

  return {
    title: `${post.title} | N.A.T Automation`,
    description: seoDescription,
    keywords: [
      post.category,
      "kiến thức cnc",
      "sửa chữa máy cnc",
      "bảo trì cnc",
      "N.A.T Automation",
    ],
    alternates: {
      canonical: `https://tailieucnc.xyz/kien-thuc/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | N.A.T Automation`,
      description: seoDescription,
      url: `https://tailieucnc.xyz/kien-thuc/${post.slug}`,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "N.A.T Automation" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | N.A.T Automation`,
      description: seoDescription,
      images: post.image ? [post.image] : ["/og-image.png"],
    },
  };
}

// ============================================================
// JSON-LD Article Schema
// ============================================================

function ArticleSchema({ post }: { post: Post }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.content?.substring(0, 160) || post.title,
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
      "@id": `https://tailieucnc.xyz/kien-thuc/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================
// BreadcrumbSchema cho bài viết
// ============================================================

function BreadcrumbSchema({ post }: { post: Post }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://tailieucnc.xyz" },
      { "@type": "ListItem", position: 2, name: "Kiến thức CNC", item: "https://tailieucnc.xyz/kien-thuc" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://tailieucnc.xyz/kien-thuc/${post.slug}` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================================
// PAGE COMPONENT: Chi tiết bài viết
// ============================================================

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

  // Fetch 3 bài viết liên quan (cùng category, loại trừ bài hiện tại)
  const allPosts = await getPosts();
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  // Xác định category label hiển thị
  const categoryLabels: Record<string, string> = {
    "kien-thuc": "Kiến thức CNC",
    "sua-chua": "Sửa chữa",
    "bao-tri": "Bảo trì",
    "linh-kien": "Linh kiện",
    "huong-dan": "Hướng dẫn",
  };
  const categoryLabel = categoryLabels[post.category] || post.category || "Kiến thức CNC";

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <ArticleSchema post={post} />
      <BreadcrumbSchema post={post} />

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
          {/* Breadcrumb UI */}
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-sky-600 transition">Trang chủ</Link>
            <span>/</span>
            <Link href="/kien-thuc" className="hover:text-sky-600 transition">Kiến thức</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate max-w-[200px]">{post.title}</span>
          </nav>

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
          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm mb-4">
            <Calendar size={14} />
            <time dateTime={post.created_at} itemProp="datePublished">
              {new Date(post.created_at).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {categoryLabel}
            </span>
          </div>

          {/* Tiêu đề bài viết (H2 vì H1 đã dùng ở header) */}
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
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase">
              Bài viết liên quan
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/kien-thuc/${related.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={related.image || "https://via.placeholder.com/400x200?text=CNC"}
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
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
