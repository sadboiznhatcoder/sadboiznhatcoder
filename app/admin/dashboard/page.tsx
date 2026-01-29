"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, LogOut, Save, X, Trash2, Pencil, Package, List, PlusCircle, ArrowLeft, Newspaper, LayoutTemplate } from "lucide-react";
import { checkAdminAuth, logoutAdmin } from "../../utils/auth";

// Định nghĩa kiểu dữ liệu cho bài viết
interface IntroPost {
  id: number;
  title: string;
  content: string;
  image: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // === STATE QUẢN LÝ CHUNG ===
  // Mode: 'products' (Kho hàng) hoặc 'posts' (Bài giới thiệu)
  const [mode, setMode] = useState<'products' | 'posts'>('products');
  
  // Tab con trong mỗi mode: 'form' (Nhập liệu) hoặc 'list' (Danh sách)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // === STATE SẢN PHẨM ===
  const [productList, setProductList] = useState<any[]>([]);
  const [product, setProduct] = useState({ id: 0, name: "", category: "mua-ban", desc: "", price: "", quantity: 1, images: [] as string[] });

  // === STATE BÀI VIẾT GIỚI THIỆU ===
  const [postList, setPostList] = useState<IntroPost[]>([]);
  const [post, setPost] = useState<IntroPost>({ id: 0, title: "", content: "", image: "" });

  // Trạng thái đang sửa chung
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!checkAdminAuth()) { router.push("/admin"); return; }
    
    // Tải dữ liệu sản phẩm
    const prodData = JSON.parse(localStorage.getItem("nat_products") || "[]");
    setProductList(prodData);

    // Tải dữ liệu bài viết
    const postData = JSON.parse(localStorage.getItem("nat_intro_posts") || "[]");
    setPostList(postData);

    // Check xem có lệnh sửa từ bên ngoài không
    const editId = searchParams.get("editId");
    if (editId) {
      // Mặc định check trong sản phẩm trước
      const itemToEdit = prodData.find((p: any) => p.id.toString() === editId);
      if (itemToEdit) {
        setMode('products');
        handleEditProduct(itemToEdit);
      }
    }
  }, [searchParams]);

  // === XỬ LÝ ẢNH CHUNG ===
  const handleImageUpload = (e: any, type: 'product' | 'post') => {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          setProduct(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        } else {
          // Bài viết chỉ lấy 1 ảnh, nếu chọn nhiều thì lấy cái cuối
          setPost(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // === XỬ LÝ SẢN PHẨM ===
  const submitProduct = () => {
    if (!product.name || product.images.length === 0) return alert("Thiếu tên hoặc ảnh!");
    let newData;
    if (isEditing) {
      newData = productList.map(p => p.id === product.id ? product : p);
      alert("Đã cập nhật sản phẩm!");
    } else {
      newData = [{ ...product, id: Date.now() }, ...productList];
      alert("Đã đăng sản phẩm mới!");
    }
    localStorage.setItem("nat_products", JSON.stringify(newData));
    setProductList(newData);
    resetForm();
    setActiveTab('list');
  };

  const handleEditProduct = (item: any) => {
    setProduct({ ...item, images: item.images || (item.image ? [item.image] : []) });
    setIsEditing(true);
    setActiveTab('form');
  };

  const deleteProduct = (id: number) => {
    if (confirm("Xóa vĩnh viễn sản phẩm này?")) {
      const newData = productList.filter(p => p.id !== id);
      localStorage.setItem("nat_products", JSON.stringify(newData));
      setProductList(newData);
    }
  };

  // === XỬ LÝ BÀI VIẾT ===
  const submitPost = () => {
    if (!post.title || !post.content || !post.image) return alert("Vui lòng nhập đủ Tiêu đề, Nội dung và Ảnh!");
    let newData;
    if (isEditing) {
      newData = postList.map(p => p.id === post.id ? post : p);
      alert("Đã cập nhật bài viết!");
    } else {
      newData = [{ ...post, id: Date.now() }, ...postList];
      alert("Đã đăng bài viết mới!");
    }
    localStorage.setItem("nat_intro_posts", JSON.stringify(newData));
    setPostList(newData);
    resetForm();
    setActiveTab('list');
  };

  const handleEditPost = (item: IntroPost) => {
    setPost(item);
    setIsEditing(true);
    setActiveTab('form');
  };

  const deletePost = (id: number) => {
    if (confirm("Xóa bài viết này khỏi trang chủ?")) {
      const newData = postList.filter(p => p.id !== id);
      localStorage.setItem("nat_intro_posts", JSON.stringify(newData));
      setPostList(newData);
    }
  };

  // === HÀM RESET ===
  const resetForm = () => {
    setProduct({ id: 0, name: "", category: "mua-ban", desc: "", price: "", quantity: 1, images: [] });
    setPost({ id: 0, title: "", content: "", image: "" });
    setIsEditing(false);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b">
        <h1 className="font-bold text-sky-800 text-lg uppercase flex items-center gap-2">
            <span className="bg-sky-100 p-1 rounded">🛡️</span> Admin Panel
        </h1>
        <button onClick={() => router.push('/')} className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-1">
            <ArrowLeft size={16}/> Về trang chủ
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        
        {/* === THANH CHUYỂN CHẾ ĐỘ (MODE SWITCHER) === */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => { setMode('products'); setActiveTab('list'); resetForm(); }}
            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${mode === 'products' ? 'border-sky-600 bg-sky-50 text-sky-700 font-bold' : 'border-white bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <Package size={24} /> QUẢN LÝ KHO HÀNG
          </button>
          <button 
            onClick={() => { setMode('posts'); setActiveTab('list'); resetForm(); }}
            className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${mode === 'posts' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-white bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <Newspaper size={24} /> QUẢN LÝ BÀI VIẾT TRANG CHỦ
          </button>
        </div>

        {/* ======================================================= */}
        {/* =============== KHU VỰC QUẢN LÝ SẢN PHẨM ============= */}
        {/* ======================================================= */}
        {mode === 'products' && (
          <>
            {/* SUB-MENU SẢN PHẨM */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => {setActiveTab('form'); resetForm();}} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'form' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600'}`}>
                    <PlusCircle size={18}/> Đăng Mới
                </button>
                <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'list' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600'}`}>
                    <List size={18}/> Danh Sách ({productList.length})
                </button>
            </div>

            {/* FORM SẢN PHẨM */}
            {activeTab === 'form' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-sky-600 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Sản Phẩm" : "➕ Thêm Sản Phẩm Mới"}</h2>
                  <div className="space-y-4">
                    <input className="w-full p-3 border rounded-lg" placeholder="Tên sản phẩm" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full p-3 border rounded-lg" placeholder="Giá bán" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} />
                      <input type="number" className="w-full p-3 border rounded-lg" placeholder="Số lượng" value={product.quantity} onChange={e => setProduct({...product, quantity: parseInt(e.target.value)})} />
                    </div>
                    <select className="w-full p-3 border rounded-lg" value={product.category} onChange={e => setProduct({...product, category: e.target.value})}>
                      <option value="mua-ban">Máy Móc</option>
                      <option value="linh-kien">Linh Kiện</option>
                    </select>
                    <textarea className="w-full p-3 border rounded-lg h-32" placeholder="Mô tả..." value={product.desc} onChange={e => setProduct({...product, desc: e.target.value})}></textarea>
                    
                    {/* Upload ảnh SP */}
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Ảnh sản phẩm ({product.images.length})</label>
                      <div className="flex gap-2 flex-wrap">
                        {product.images.map((img, idx) => (
                          <div key={idx} className="w-20 h-20 relative border rounded overflow-hidden">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => setProduct(p => ({...p, images: p.images.filter((_,i)=>i!==idx)}))} className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs">X</button>
                          </div>
                        ))}
                        <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50 rounded">
                           <input type="file" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'product')} /> <ImagePlus className="text-slate-400"/>
                        </label>
                      </div>
                    </div>

                    <button onClick={submitProduct} className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 shadow-lg">{isEditing ? "Lưu Thay Đổi" : "Đăng Ngay"}</button>
                  </div>
               </div>
            )}

            {/* LIST SẢN PHẨM */}
            {activeTab === 'list' && (
               <div className="bg-white rounded-xl shadow overflow-hidden">
                  {productList.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-center">
                       <img src={item.images?.[0] || item.image} className="w-16 h-16 rounded object-cover bg-slate-200" />
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{item.name}</h3>
                          <p className="text-red-600 text-sm font-bold">{item.price}</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(item)} className="p-2 bg-yellow-100 text-yellow-700 rounded"><Pencil size={18}/></button>
                          <button onClick={() => deleteProduct(item.id)} className="p-2 bg-red-100 text-red-700 rounded"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                  {productList.length === 0 && <p className="p-8 text-center text-slate-500">Chưa có sản phẩm nào.</p>}
               </div>
            )}
          </>
        )}

        {/* ======================================================= */}
        {/* =============== KHU VỰC QUẢN LÝ BÀI VIẾT ============ */}
        {/* ======================================================= */}
        {mode === 'posts' && (
          <>
            {/* SUB-MENU BÀI VIẾT */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => {setActiveTab('form'); resetForm();}} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'form' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600'}`}>
                    <PlusCircle size={18}/> Viết Bài Mới
                </button>
                <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${activeTab === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600'}`}>
                    <List size={18}/> Bài Đã Đăng ({postList.length})
                </button>
            </div>

             {/* FORM BÀI VIẾT */}
             {activeTab === 'form' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="font-bold text-xl text-slate-800 mb-4">{isEditing ? "✏️ Sửa Bài Viết" : "📝 Soạn Bài Giới Thiệu Mới"}</h2>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề (Hiện to, in đậm)</label>
                        <input className="w-full p-3 border rounded-lg focus:ring-2 ring-orange-500 outline-none" placeholder="VD: Công nghệ Phay CNC hiện đại..." value={post.title} onChange={e => setPost({...post, title: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung chi tiết</label>
                        <textarea className="w-full p-3 border rounded-lg h-40 focus:ring-2 ring-orange-500 outline-none" placeholder="Nhập nội dung bài viết..." value={post.content} onChange={e => setPost({...post, content: e.target.value})}></textarea>
                    </div>
                    
                    {/* Upload ảnh Bài viết */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Hình ảnh minh họa (1 ảnh)</label>
                      <div className="flex items-start gap-4">
                        {post.image ? (
                           <div className="relative w-48 h-32 rounded-lg overflow-hidden border shadow-sm group">
                              <img src={post.image} className="w-full h-full object-cover" />
                              <button onClick={() => setPost({...post, image: ""})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"><X size={14}/></button>
                           </div>
                        ) : (
                          <label className="w-48 h-32 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition">
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'post')} /> 
                             <ImagePlus className="text-orange-400 mb-1"/>
                             <span className="text-xs text-orange-600 font-bold">Chọn ảnh</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 flex gap-2">
                        <LayoutTemplate size={18} className="flex-shrink-0 mt-0.5"/>
                        <p>Mẹo: Hệ thống sẽ tự động sắp xếp <b>so-le (ZigZag)</b> ảnh và chữ khi hiển thị trên trang chủ để tăng tính thẩm mỹ.</p>
                    </div>

                    <button onClick={submitPost} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 shadow-lg">{isEditing ? "Cập Nhật Bài Viết" : "Đăng Bài Lên Trang Chủ"}</button>
                  </div>
               </div>
            )}

            {/* LIST BÀI VIẾT */}
            {activeTab === 'list' && (
               <div className="bg-white rounded-xl shadow overflow-hidden">
                  {postList.map((item, index) => (
                    <div key={item.id} className="flex gap-4 p-4 border-b hover:bg-slate-50 items-start group">
                       <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-200 border flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Vị trí {index + 1}</span>
                             <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                          </div>
                          <p className="text-slate-500 text-sm line-clamp-2">{item.content}</p>
                       </div>
                       <div className="flex gap-2 self-center">
                          <button onClick={() => handleEditPost(item)} className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"><Pencil size={18}/></button>
                          <button onClick={() => deletePost(item.id)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                  {postList.length === 0 && <div className="p-12 text-center text-slate-400 flex flex-col items-center"><Newspaper size={48} className="opacity-20 mb-2"/><p>Chưa có bài giới thiệu nào.</p></div>}
               </div>
            )}
          </>
        )}

        <div className="mt-12 text-center border-t pt-6">
            <button onClick={logoutAdmin} className="text-red-500 hover:text-red-700 font-bold flex items-center justify-center gap-2 mx-auto"><LogOut size={16}/> Đăng Xuất</button>
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