"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ImagePlus, LogOut, Trash2, Pencil, Package, List, PlusCircle,
  ArrowLeft, Newspaper, Loader2, X, Globe, ExternalLink, Search,
} from "lucide-react";
import { checkAuth, logoutAdmin } from "../../utils/auth";
import {
  supabase,
  generateSlug,
  type Post,
  type PostFormData,
  type Product,
} from "../../utils/supabase";

// ============================================================
// Giao diện Form bài viết SEO mặc định
// ============================================================
const EMPTY_SEO_POST = {
  id: "",
  title: "",
  slug: "",
  content: "",
  meta_description: "",
  category: "kien-thuc",
  image: "",
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"products" | "posts" | "seo">("products");
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [isLoading, setIsLoading] = useState(false);

  // State Sản Phẩm
  const [productList, setProductList] = useState<Product[]>([]);
  const [product, setProduct] = useState({
    id: 0, name: "", category: "mua-ban", description: "", price: "", quantity: 1, images: [] as string[],
  });

  // State Bài Viết cũ (giữ nguyên logic hiện tại)
  const [postList, setPostList] = useState<Array<{ id: number; title: string; content: string; image: string }>>([]);
  const [post, setPost] = useState({ id: 0, title: "", content: "", image: "" });

  // State Bài Viết SEO (MỚI)
  const [seoPostList, setSeoPostList] = useState<Post[]>([]);
  const [seoPost, setSeoPost] = useState(EMPTY_SEO_POST);
  const [isSlugManual, setIsSlugManual] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // === FETCH DỮ LIỆU ===
  const fetchData = async () => {
    setIsLoading(true);

    // Lấy sản phẩm
    const { data: products, error: prodError } = await supabase
      .from("products").select("*").order("created_at", { ascending: false });
    if (prodError) console.error("Lỗi lấy SP:", prodError.message);
    else setProductList((products as Product[]) || []);

    // Lấy bài viết cũ (bảng posts cũ — nếu vẫn dùng)
    const { data: posts, error: postError } = await supabase
      .from("posts").select("*").order("created_at", { ascending: false });
    if (postError) console.error("Lỗi lấy bài viết:", postError.message);
    else {
      // Dữ liệu posts giờ có cả slug, meta_description → phân loại
      const allPosts = posts || [];
      // Bài viết SEO: có slug
      setSeoPostList(allPosts.filter((p: Post) => p.slug) as Post[]);
      // Bài viết cũ: không có slug (backward compatible)
      setPostList(allPosts.filter((p: any) => !p.slug));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!checkAuth()) { router.push("/admin"); return; }
      fetchData();
    }
  }, []);

  // === UPLOAD ẢNH ===
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) { alert("Lỗi upload ảnh: " + error.message); return null; }
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "product" | "post" | "seo") => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    const urls: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { alert(`File ${file.name} quá lớn (>5MB).`); continue; }
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }

    if (type === "product") {
      setProduct((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } else if (type === "post") {
      setPost((prev) => ({ ...prev, image: urls[0] }));
    } else if (type === "seo") {
      setSeoPost((prev) => ({ ...prev, image: urls[0] || "" }));
    }
    setIsLoading(false);
  };

  // === XỬ LÝ SẢN PHẨM (GIỮ NGUYÊN) ===
  const submitProduct = async () => {
    if (!product.name) return alert("Vui lòng nhập tên sản phẩm!");
    setIsLoading(true);
    const safeQuantity = isNaN(Number(product.quantity)) ? 0 : Number(product.quantity);
    const productData = { name: product.name, price: product.price, quantity: safeQuantity, category: product.category, description: product.description, images: product.images };

    let error;
    if (isEditing && product.id) {
      const res = await supabase.from("products").update(productData).eq("id", product.id);
      error = res.error;
    } else {
      const res = await supabase.from("products").insert([productData]);
      error = res.error;
    }
    if (error) { alert("❌ LỖI: " + error.message); }
    else { alert("✅ Thành công!"); await fetchData(); resetForm(); setActiveTab("list"); }
    setIsLoading(false);
  };

  const deleteProductItem = async (id: number) => {
    if (!confirm("Xóa vĩnh viễn?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Lỗi xóa: " + error.message);
    else fetchData();
  };

  // === XỬ LÝ BÀI VIẾT CŨ (GIỮ NGUYÊN) ===
  const submitPost = async () => {
    if (!post.title) return alert("Thiếu tiêu đề!");
    setIsLoading(true);
    const postData = { title: post.title, content: post.content, image: post.image };
    let error;
    if (isEditing && post.id) {
      const res = await supabase.from("posts").update(postData).eq("id", post.id);
      error = res.error;
    } else {
      const res = await supabase.from("posts").insert([postData]);
      error = res.error;
    }
    if (error) { alert("❌ LỖI: " + error.message); }
    else { alert("✅ Đã đăng bài!"); await fetchData(); resetForm(); setActiveTab("list"); }
    setIsLoading(false);
  };

  const deletePostItem = async (id: number) => {
    if (!confirm("Xóa bài viết?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) alert("Lỗi xóa: " + error.message);
    else fetchData();
  };

  // ============================================================
  // XỬ LÝ BÀI VIẾT SEO (MỚI)
  // ============================================================

  const handleSeoTitleChange = (title: string) => {
    setSeoPost((prev) => ({
      ...prev,
      title,
      // Auto-generate slug nếu user không nhập tay
      slug: isSlugManual ? prev.slug : generateSlug(title),
    }));
  };

  const submitSeoPost = async () => {
    // Validate
    if (!seoPost.title.trim()) return alert("⚠️ Vui lòng nhập Tiêu đề bài viết!");
    if (!seoPost.slug.trim()) return alert("⚠️ Slug không được để trống!");
    if (!seoPost.meta_description.trim()) return alert("⚠️ Meta Description là bắt buộc cho SEO!");
    if (seoPost.meta_description.length > 160) return alert("⚠️ Meta Description tối đa 160 ký tự!");
    if (!seoPost.content.trim()) return alert("⚠️ Nội dung bài viết không được trống!");

    setIsLoading(true);

    const formData: PostFormData = {
      title: seoPost.title.trim(),
      slug: seoPost.slug.trim(),
      content: seoPost.content.trim(),
      meta_description: seoPost.meta_description.trim(),
      category: seoPost.category,
      image: seoPost.image,
    };

    let error;
    if (isEditing && seoPost.id) {
      const res = await supabase.from("posts").update({
        ...formData,
        updated_at: new Date().toISOString(),
      }).eq("id", seoPost.id);
      error = res.error;
    } else {
      const res = await supabase.from("posts").insert([formData]);
      error = res.error;
    }

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        alert("❌ Slug đã tồn tại! Vui lòng chọn slug khác.");
      } else {
        alert("❌ LỖI: " + error.message);
      }
    } else {
      alert("✅ Đã đăng bài viết SEO thành công!\n\n🔗 URL: /kien-thuc/" + formData.slug);
      await fetchData();
      resetForm();
      setActiveTab("list");
    }
    setIsLoading(false);
  };

  const deleteSeoPost = async (id: string) => {
    if (!confirm("Xóa bài viết SEO này vĩnh viễn?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) alert("Lỗi xóa: " + error.message);
    else fetchData();
  };

  const editSeoPost = (item: Post) => {
    setSeoPost({
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content,
      meta_description: item.meta_description,
      category: item.category,
      image: item.image,
    });
    setIsSlugManual(true); // Khi sửa, giữ slug cũ
    setIsEditing(true);
    setActiveTab("form");
  };

  // === RESET FORM ===
  const resetForm = () => {
    setProduct({ id: 0, name: "", category: "mua-ban", description: "", price: "", quantity: 1, images: [] });
    setPost({ id: 0, title: "", content: "", image: "" });
    setSeoPost(EMPTY_SEO_POST);
    setIsEditing(false);
    setIsSlugManual(false);
  };

  const handleLogout = () => { logoutAdmin(); router.push("/"); };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b">
        <h1 className="font-bold text-sky-800 text-lg uppercase flex items-center gap-2">
          <span className="bg-sky-100 p-1 rounded">🛡️</span> Admin DB
        </h1>
        <button onClick={() => router.push("/")} className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Về trang chủ
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* MODE SWITCHER (3 tabs) */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button onClick={() => { setMode("products"); setActiveTab("list"); resetForm(); }} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-sm font-bold ${mode === "products" ? "border-sky-600 bg-sky-50 text-sky-700" : "border-white bg-white text-slate-500"}`}>
            <Package size={20} /> KHO HÀNG
          </button>
          <button onClick={() => { setMode("posts"); setActiveTab("list"); resetForm(); }} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-sm font-bold ${mode === "posts" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-white bg-white text-slate-500"}`}>
            <Newspaper size={20} /> BÀI VIẾT
          </button>
          <button onClick={() => { setMode("seo"); setActiveTab("list"); resetForm(); }} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-sm font-bold ${mode === "seo" ? "border-green-600 bg-green-50 text-green-700" : "border-white bg-white text-slate-500"}`}>
            <Globe size={20} /> BÀI SEO
          </button>
        </div>

        {/* LOADING */}
        {isLoading && <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" size={40} /></div>}

        {/* ================================================================ */}
        {/* GIAO DIỆN SẢN PHẨM (GIỮ NGUYÊN 100%) */}
        {/* ================================================================ */}
        {mode === "products" && (
          <>
            <div className="flex gap-2 mb-6">
              <button onClick={() => { setActiveTab("form"); resetForm(); }} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "form" ? "bg-sky-600 text-white" : "bg-white text-slate-600"}`}><PlusCircle size={18} /> Đăng Mới</button>
              <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "list" ? "bg-sky-600 text-white" : "bg-white text-slate-600"}`}><List size={18} /> Danh Sách ({productList.length})</button>
            </div>

            {activeTab === "form" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-sky-600">
                <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Sản Phẩm" : "➕ Thêm Sản Phẩm Mới"}</h2>
                <div className="space-y-4">
                  <input className="w-full p-3 border rounded-lg" placeholder="Tên sản phẩm" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-3 border rounded-lg" placeholder="Giá bán (VD: 100.000đ)" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
                    <input type="number" className="w-full p-3 border rounded-lg" placeholder="Số lượng" value={product.quantity} onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) })} />
                  </div>
                  <select className="w-full p-3 border rounded-lg" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })}>
                    <option value="mua-ban">Máy Móc (Mua Bán)</option>
                    <option value="linh-kien">Linh Kiện</option>
                  </select>
                  <textarea className="w-full p-3 border rounded-lg h-32" placeholder="Mô tả chi tiết..." value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })}></textarea>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Ảnh sản phẩm ({product.images.length})</label>
                    <div className="flex gap-2 flex-wrap">
                      {product.images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 relative border rounded overflow-hidden group">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => setProduct((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"><X size={12} /></button>
                        </div>
                      ))}
                      <label className="w-20 h-20 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 rounded text-slate-400">
                        <input type="file" multiple className="hidden" onChange={(e) => handleImageSelect(e, "product")} />
                        <ImagePlus /> <span className="text-xs">Thêm</span>
                      </label>
                    </div>
                  </div>
                  <button onClick={submitProduct} className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700">{isEditing ? "Lưu Thay Đổi" : "Đăng Ngay"}</button>
                </div>
              </div>
            )}

            {activeTab === "list" && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {productList.length === 0 && <div className="p-8 text-center text-slate-500">Chưa có dữ liệu.</div>}
                {productList.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-center">
                    <img src={item.images?.[0] || "https://via.placeholder.com/150"} className="w-16 h-16 rounded object-cover bg-slate-100" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{item.name}</h3>
                      <div className="flex gap-2 text-sm">
                        <span className="text-red-600 font-bold">{item.price}</span>
                        <span className="bg-slate-100 px-2 rounded text-slate-500">{item.category}</span>
                      </div>
                    </div>
                    <button onClick={() => { setProduct(item as any); setIsEditing(true); setActiveTab("form"); }} className="p-2 text-yellow-600"><Pencil size={18} /></button>
                    <button onClick={() => deleteProductItem(item.id)} className="p-2 text-red-600"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================================================================ */}
        {/* GIAO DIỆN BÀI VIẾT CŨ (GIỮ NGUYÊN 100%) */}
        {/* ================================================================ */}
        {mode === "posts" && (
          <>
            <div className="flex gap-2 mb-6">
              <button onClick={() => { setActiveTab("form"); resetForm(); }} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "form" ? "bg-orange-500 text-white" : "bg-white text-slate-600"}`}><PlusCircle size={18} /> Viết Bài Mới</button>
              <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "list" ? "bg-orange-500 text-white" : "bg-white text-slate-600"}`}><List size={18} /> Danh Sách ({postList.length})</button>
            </div>

            {activeTab === "form" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500">
                <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Bài Viết" : "📝 Soạn Bài Mới"}</h2>
                <div className="space-y-4">
                  <input className="w-full p-3 border rounded-lg" placeholder="Tiêu đề bài viết" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
                  <textarea className="w-full p-3 border rounded-lg h-40" placeholder="Nội dung..." value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })}></textarea>
                  <div className="flex items-center gap-4">
                    {post.image ? (
                      <div className="relative group">
                        <img src={post.image} className="w-32 h-20 object-cover rounded-lg border border-slate-300" alt="" />
                        <button onClick={() => setPost({ ...post, image: "" })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform transform hover:scale-110" title="Xóa ảnh"><X size={14} /></button>
                      </div>
                    ) : null}
                    <label className="px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 text-slate-500 hover:text-orange-600 flex gap-2 items-center transition-all">
                      <input type="file" onChange={(e) => handleImageSelect(e, "post")} className="hidden" />
                      <ImagePlus size={20} />
                      {post.image ? "Đổi ảnh khác" : "Chọn ảnh bìa"}
                    </label>
                  </div>
                  <button onClick={submitPost} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700">{isEditing ? "Cập Nhật" : "Đăng Bài"}</button>
                </div>
              </div>
            )}

            {activeTab === "list" && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {postList.length === 0 && <div className="p-8 text-center text-slate-500">Chưa có bài viết nào.</div>}
                {postList.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-start">
                    <img src={item.image || "https://via.placeholder.com/150?text=No+Image"} className="w-24 h-16 rounded object-cover bg-slate-100 border" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-1">{item.content}</p>
                    </div>
                    <button onClick={() => { setPost(item); setIsEditing(true); setActiveTab("form"); }} className="p-2 text-yellow-600"><Pencil size={18} /></button>
                    <button onClick={() => deletePostItem(item.id)} className="p-2 text-red-600"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================================================================ */}
        {/* 🆕 GIAO DIỆN BÀI VIẾT SEO (DYNAMIC CMS) */}
        {/* ================================================================ */}
        {mode === "seo" && (
          <>
            <div className="flex gap-2 mb-6">
              <button onClick={() => { setActiveTab("form"); resetForm(); }} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "form" ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
                <PlusCircle size={18} /> Viết Bài SEO
              </button>
              <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === "list" ? "bg-green-600 text-white" : "bg-white text-slate-600"}`}>
                <List size={18} /> Danh Sách ({seoPostList.length})
              </button>
            </div>

            {/* === FORM TẠO/SỬA BÀI VIẾT SEO === */}
            {activeTab === "form" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-600">
                <h2 className="font-bold text-xl text-slate-800 mb-1 flex items-center gap-2">
                  <Globe size={20} className="text-green-600" />
                  {isEditing ? "✏️ Sửa Bài Viết SEO" : "🚀 Đăng Bài Viết SEO Mới"}
                </h2>
                <p className="text-slate-400 text-xs mb-6">Bài viết sẽ tự động tạo trang /kien-thuc/[slug] chuẩn SEO</p>

                <div className="space-y-5">
                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg focus:ring-2 ring-green-400 outline-none transition"
                      placeholder="VD: Cách sửa lỗi Servo Overload trên máy CNC Fanuc"
                      value={seoPost.title}
                      onChange={(e) => handleSeoTitleChange(e.target.value)}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Slug (URL) <span className="text-red-500">*</span></span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSlugManual(!isSlugManual);
                          if (isSlugManual) setSeoPost((p) => ({ ...p, slug: generateSlug(p.title) }));
                        }}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                      >
                        {isSlugManual ? "🔄 Tự động tạo" : "✏️ Nhập tay"}
                      </button>
                    </label>
                    <div className="flex items-center gap-0">
                      <span className="bg-slate-100 text-slate-500 text-xs px-3 py-3 rounded-l-lg border border-r-0 whitespace-nowrap">/kien-thuc/</span>
                      <input
                        className={`flex-1 p-3 border rounded-r-lg focus:ring-2 ring-green-400 outline-none transition text-sm ${!isSlugManual ? "bg-slate-50 text-slate-500" : ""}`}
                        placeholder="sua-loi-servo-overload-fanuc"
                        value={seoPost.slug}
                        onChange={(e) => setSeoPost({ ...seoPost, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })}
                        readOnly={!isSlugManual}
                      />
                    </div>
                    {seoPost.slug && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <ExternalLink size={10} /> URL: tailieucnc.xyz/kien-thuc/{seoPost.slug}
                      </p>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Meta Description <span className="text-red-500">*</span></span>
                      <span className={`text-xs font-mono ${seoPost.meta_description.length > 160 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                        {seoPost.meta_description.length}/160
                      </span>
                    </label>
                    <textarea
                      className={`w-full p-3 border rounded-lg h-20 focus:ring-2 outline-none transition text-sm ${seoPost.meta_description.length > 160 ? "ring-red-400 border-red-300" : "ring-green-400"}`}
                      placeholder="Mô tả ngắn gọn hiển thị trên Google (tối đa 160 ký tự)..."
                      value={seoPost.meta_description}
                      onChange={(e) => setSeoPost({ ...seoPost, meta_description: e.target.value })}
                      maxLength={165}
                    />
                    <p className="text-xs text-slate-400 mt-0.5">💡 Đây là đoạn text hiển thị bên dưới tiêu đề trên Google Search Results</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Danh mục</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 ring-green-400 outline-none"
                      value={seoPost.category}
                      onChange={(e) => setSeoPost({ ...seoPost, category: e.target.value })}
                    >
                      <option value="kien-thuc">📘 Kiến thức CNC</option>
                      <option value="sua-chua">🔧 Sửa chữa</option>
                      <option value="bao-tri">⚙️ Bảo trì</option>
                      <option value="linh-kien">📦 Linh kiện</option>
                      <option value="huong-dan">📋 Hướng dẫn</option>
                    </select>
                  </div>

                  {/* Nội dung bài viết */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Nội dung bài viết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg h-64 focus:ring-2 ring-green-400 outline-none transition"
                      placeholder="Viết nội dung bài viết chi tiết tại đây...&#10;&#10;Mẹo: Viết ít nhất 500 từ để Google đánh giá cao."
                      value={seoPost.content}
                      onChange={(e) => setSeoPost({ ...seoPost, content: e.target.value })}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      📊 Độ dài: ~{seoPost.content.split(/\s+/).filter(Boolean).length} từ
                      {seoPost.content.split(/\s+/).filter(Boolean).length < 300 && seoPost.content.length > 0 && (
                        <span className="text-amber-500 ml-2">⚠️ Nên viết ít nhất 300 từ cho SEO</span>
                      )}
                      {seoPost.content.split(/\s+/).filter(Boolean).length >= 300 && (
                        <span className="text-green-500 ml-2">✅ Đủ dài cho SEO</span>
                      )}
                    </p>
                  </div>

                  {/* Ảnh bìa */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh bìa (OG Image)</label>
                    <div className="flex items-center gap-4">
                      {seoPost.image ? (
                        <div className="relative group">
                          <img src={seoPost.image} className="w-40 h-24 object-cover rounded-lg border" alt="Ảnh bìa" />
                          <button onClick={() => setSeoPost({ ...seoPost, image: "" })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600" title="Xóa ảnh">
                            <X size={14} />
                          </button>
                        </div>
                      ) : null}
                      <label className="px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 text-slate-500 hover:text-green-600 flex gap-2 items-center transition-all">
                        <input type="file" onChange={(e) => handleImageSelect(e, "seo")} className="hidden" accept="image/*" />
                        <ImagePlus size={20} />
                        {seoPost.image ? "Đổi ảnh" : "Chọn ảnh bìa"}
                      </label>
                    </div>
                  </div>

                  {/* Preview SEO */}
                  {seoPost.title && seoPost.meta_description && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1"><Search size={10} /> XEM TRƯỚC TRÊN GOOGLE</p>
                      <div className="space-y-0.5">
                        <p className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">{seoPost.title} | N.A.T Automation</p>
                        <p className="text-[#006621] text-xs">tailieucnc.xyz › kien-thuc › {seoPost.slug || "..."}</p>
                        <p className="text-slate-600 text-sm line-clamp-2">{seoPost.meta_description}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={submitSeoPost}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition text-lg flex items-center justify-center gap-2"
                  >
                    <Globe size={20} />
                    {isEditing ? "Cập Nhật Bài Viết" : "🚀 Đăng Bài & Tạo Trang SEO"}
                  </button>
                </div>
              </div>
            )}

            {/* === DANH SÁCH BÀI VIẾT SEO === */}
            {activeTab === "list" && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {seoPostList.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Globe size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Chưa có bài viết SEO nào.</p>
                    <p className="text-sm mt-1">Bấm &quot;Viết Bài SEO&quot; để bắt đầu thống trị từ khóa!</p>
                  </div>
                )}
                {seoPostList.map((item) => (
                  <div key={item.id} className="p-4 border-b hover:bg-slate-50 transition">
                    <div className="flex gap-4 items-start">
                      <img src={item.image || "https://via.placeholder.com/150?text=CNC"} className="w-20 h-14 rounded object-cover bg-slate-100 border flex-shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 line-clamp-1 text-sm">{item.title}</h3>
                        <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{item.meta_description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                          <a href={`/kien-thuc/${item.slug}`} target="_blank" rel="noreferrer" className="text-sky-600 text-[10px] hover:underline flex items-center gap-0.5">
                            <ExternalLink size={9} /> /kien-thuc/{item.slug}
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => editSeoPost(item)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"><Pencil size={16} /></button>
                        <button onClick={() => deleteSeoPost(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center border-t pt-6">
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto"><LogOut size={16} /> Đăng Xuất</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" size={40} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}