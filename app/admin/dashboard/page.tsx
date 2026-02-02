"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// 👇 Đã thêm icon X vào danh sách import
import { ImagePlus, LogOut, Trash2, Pencil, Package, List, PlusCircle, ArrowLeft, Newspaper, Loader2, X } from "lucide-react";
import { checkAuth, logoutAdmin } from "../../utils/auth";
import { supabase } from "../../utils/supabase";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<'products' | 'posts'>('products');
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [isLoading, setIsLoading] = useState(false);

  // State Sản Phẩm
  const [productList, setProductList] = useState<any[]>([]);
  const [product, setProduct] = useState({ id: 0, name: "", category: "mua-ban", description: "", price: "", quantity: 1, images: [] as string[] });

  // State Bài Viết
  const [postList, setPostList] = useState<any[]>([]);
  const [post, setPost] = useState({ id: 0, title: "", content: "", image: "" });

  const [isEditing, setIsEditing] = useState(false);

  // === FETCH DỮ LIỆU ===
  const fetchData = async () => {
    setIsLoading(true);
    
    // Lấy sản phẩm
    const { data: products, error: prodError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodError) console.error("Lỗi lấy SP:", prodError.message);
    else setProductList(products || []);

    // Lấy bài viết
    const { data: posts, error: postError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (postError) console.error("Lỗi lấy bài viết:", postError.message);
    else setPostList(posts || []);
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (!checkAuth()) { router.push("/admin"); return; }
        fetchData();
    }
  }, []);

  // === UPLOAD ẢNH (ĐÃ SỬA: Đổi tên file an toàn tuyệt đối) ===
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);

    if (error) {
        alert("Lỗi upload ảnh: " + error.message);
        return null;
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleImageSelect = async (e: any, type: 'product' | 'post') => {
    const files = Array.from(e.target.files) as File[];
    if(files.length === 0) return;

    setIsLoading(true);
    const urls: string[] = [];
    
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} quá lớn (>5MB). Vui lòng chọn ảnh nhỏ hơn.`);
            continue;
        }

        const url = await uploadImage(file);
        if (url) urls.push(url);
    }

    if (type === 'product') {
        setProduct(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } else {
        // Với bài viết, chỉ lấy ảnh đầu tiên
        setPost(prev => ({ ...prev, image: urls[0] }));
    }
    setIsLoading(false);
  };

  // === XỬ LÝ SẢN PHẨM ===
  const submitProduct = async () => {
    if (!product.name) return alert("Vui lòng nhập tên sản phẩm!");
    
    setIsLoading(true);
    const safeQuantity = isNaN(Number(product.quantity)) ? 0 : Number(product.quantity);

    const productData = {
        name: product.name,
        price: product.price,
        quantity: safeQuantity,
        category: product.category,
        description: product.description,
        images: product.images
    };

    let error;

    if (isEditing && product.id) {
        const res = await supabase.from('products').update(productData).eq('id', product.id);
        error = res.error;
    } else {
        const res = await supabase.from('products').insert([productData]);
        error = res.error;
    }
    
    if (error) {
        alert("❌ LỖI KHI LƯU: " + error.message);
    } else {
        alert("✅ Đã đăng thành công!");
        await fetchData();
        resetForm();
        setActiveTab('list');
    }
    setIsLoading(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Xóa vĩnh viễn?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) alert("Lỗi xóa: " + error.message);
    else fetchData();
  };

  // === XỬ LÝ BÀI VIẾT ===
  const submitPost = async () => {
    if (!post.title) return alert("Thiếu tiêu đề!");
    setIsLoading(true);

    const postData = {
        title: post.title,
        content: post.content,
        image: post.image // Nếu image là chuỗi rỗng "" thì nó sẽ xóa ảnh trong DB
    };

    let error;
    if (isEditing && post.id) {
        const res = await supabase.from('posts').update(postData).eq('id', post.id);
        error = res.error;
    } else {
        const res = await supabase.from('posts').insert([postData]);
        error = res.error;
    }

    if (error) {
        alert("❌ LỖI KHI LƯU BÀI: " + error.message);
    } else {
        alert("✅ Đã đăng bài thành công!");
        await fetchData();
        resetForm();
        setActiveTab('list');
    }
    setIsLoading(false);
  };

  const deletePost = async (id: number) => {
    if (!confirm("Xóa bài viết?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if(error) alert("Lỗi xóa: " + error.message);
    else fetchData();
  };

  const resetForm = () => {
    setProduct({ id: 0, name: "", category: "mua-ban", description: "", price: "", quantity: 1, images: [] });
    setPost({ id: 0, title: "", content: "", image: "" });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b">
        <h1 className="font-bold text-sky-800 text-lg uppercase flex items-center gap-2">
            <span className="bg-sky-100 p-1 rounded">🛡️</span> Admin DB
        </h1>
        <button onClick={() => router.push('/')} className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-1">
            <ArrowLeft size={16}/> Về trang chủ
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* MODE SWITCHER */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => { setMode('products'); setActiveTab('list'); resetForm(); }} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${mode === 'products' ? 'border-sky-600 bg-sky-50 text-sky-700 font-bold' : 'border-white bg-white text-slate-500'}`}>
            <Package size={24} /> KHO HÀNG
          </button>
          <button onClick={() => { setMode('posts'); setActiveTab('list'); resetForm(); }} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${mode === 'posts' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-white bg-white text-slate-500'}`}>
            <Newspaper size={24} /> BÀI VIẾT
          </button>
        </div>

        {/* LOADING */}
        {isLoading && <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" size={40}/></div>}

        {/* === GIAO DIỆN SẢN PHẨM === */}
        {mode === 'products' && (
          <>
            <div className="flex gap-2 mb-6">
                <button onClick={() => {setActiveTab('form'); resetForm();}} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'form' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600'}`}><PlusCircle size={18}/> Đăng Mới</button>
                <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'list' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600'}`}><List size={18}/> Danh Sách ({productList.length})</button>
            </div>

            {activeTab === 'form' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-sky-600">
                  <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Sản Phẩm" : "➕ Thêm Sản Phẩm Mới"}</h2>
                  <div className="space-y-4">
                    <input className="w-full p-3 border rounded-lg" placeholder="Tên sản phẩm" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full p-3 border rounded-lg" placeholder="Giá bán (VD: 100.000đ)" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} />
                      <input type="number" className="w-full p-3 border rounded-lg" placeholder="Số lượng" value={product.quantity} onChange={e => setProduct({...product, quantity: parseInt(e.target.value)})} />
                    </div>
                    <select className="w-full p-3 border rounded-lg" value={product.category} onChange={e => setProduct({...product, category: e.target.value})}>
                      <option value="mua-ban">Máy Móc (Mua Bán)</option>
                      <option value="linh-kien">Linh Kiện</option>
                    </select>
                    <textarea className="w-full p-3 border rounded-lg h-32" placeholder="Mô tả chi tiết..." value={product.description} onChange={e => setProduct({...product, description: e.target.value})}></textarea>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Ảnh sản phẩm ({product.images.length})</label>
                      <div className="flex gap-2 flex-wrap">
                        {product.images.map((img, idx) => (
                          <div key={idx} className="w-20 h-20 relative border rounded overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => setProduct(p => ({...p, images: p.images.filter((_,i)=>i!==idx)}))} className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"><X size={12}/></button>
                          </div>
                        ))}
                        <label className="w-20 h-20 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 rounded text-slate-400">
                           <input type="file" multiple className="hidden" onChange={(e) => handleImageSelect(e, 'product')} /> 
                           <ImagePlus/> <span className="text-xs">Thêm</span>
                        </label>
                      </div>
                    </div>
                    <button onClick={submitProduct} className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700">{isEditing ? "Lưu Thay Đổi" : "Đăng Ngay"}</button>
                  </div>
               </div>
            )}

            {activeTab === 'list' && (
               <div className="bg-white rounded-xl shadow overflow-hidden">
                  {productList.length === 0 && <div className="p-8 text-center text-slate-500">Chưa có dữ liệu nào trong Database.</div>}
                  {productList.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-center">
                       <img src={item.images?.[0] || "https://via.placeholder.com/150"} className="w-16 h-16 rounded object-cover bg-slate-100" />
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{item.name}</h3>
                          <div className="flex gap-2 text-sm">
                            <span className="text-red-600 font-bold">{item.price}</span>
                            <span className="bg-slate-100 px-2 rounded text-slate-500">{item.category}</span>
                          </div>
                       </div>
                       <button onClick={() => {setProduct(item); setIsEditing(true); setActiveTab('form');}} className="p-2 text-yellow-600"><Pencil size={18}/></button>
                       <button onClick={() => deleteProduct(item.id)} className="p-2 text-red-600"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            )}
          </>
        )}

        {/* === GIAO DIỆN BÀI VIẾT === */}
        {mode === 'posts' && (
          <>
            <div className="flex gap-2 mb-6">
                <button onClick={() => {setActiveTab('form'); resetForm();}} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'form' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600'}`}><PlusCircle size={18}/> Viết Bài Mới</button>
                <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600'}`}><List size={18}/> Danh Sách ({postList.length})</button>
            </div>

             {activeTab === 'form' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500">
                  <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Bài Viết" : "📝 Soạn Bài Mới"}</h2>
                  <div className="space-y-4">
                    <input className="w-full p-3 border rounded-lg" placeholder="Tiêu đề bài viết" value={post.title} onChange={e => setPost({...post, title: e.target.value})} />
                    <textarea className="w-full p-3 border rounded-lg h-40" placeholder="Nội dung..." value={post.content} onChange={e => setPost({...post, content: e.target.value})}></textarea>
                    
                    <div className="flex items-center gap-4">
                        {/* 👇👇👇 PHẦN SỬA ĐỔI CHÍNH Ở ĐÂY: Thêm nút xóa ảnh 👇👇👇 */}
                        {post.image ? (
                          <div className="relative group">
                            <img src={post.image} className="w-32 h-20 object-cover rounded-lg border border-slate-300" />
                            <button 
                                onClick={() => setPost({ ...post, image: "" })} 
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                                title="Xóa ảnh này"
                            >
                                <X size={14} />
                            </button>
                          </div>
                        ) : null}

                        <label className="px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 text-slate-500 hover:text-orange-600 flex gap-2 items-center transition-all">
                            <input type="file" onChange={(e) => handleImageSelect(e, 'post')} className="hidden"/> 
                            <ImagePlus size={20}/> 
                            {post.image ? "Đổi ảnh khác" : "Chọn ảnh bìa"}
                        </label>
                    </div>

                    <button onClick={submitPost} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700">{isEditing ? "Cập Nhật" : "Đăng Bài"}</button>
                  </div>
               </div>
            )}

            {activeTab === 'list' && (
               <div className="bg-white rounded-xl shadow overflow-hidden">
                  {postList.length === 0 && <div className="p-8 text-center text-slate-500">Chưa có bài viết nào.</div>}
                  {postList.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-start">
                       <img src={item.image || "https://via.placeholder.com/150?text=No+Image"} className="w-24 h-16 rounded object-cover bg-slate-100 border" />
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-1">{item.content}</p>
                       </div>
                       <button onClick={() => {setPost(item); setIsEditing(true); setActiveTab('form');}} className="p-2 text-yellow-600"><Pencil size={18}/></button>
                       <button onClick={() => deletePost(item.id)} className="p-2 text-red-600"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            )}
          </>
        )}

        <div className="mt-12 text-center border-t pt-6">
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto"><LogOut size={16}/> Đăng Xuất</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}