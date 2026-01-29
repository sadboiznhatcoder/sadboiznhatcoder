"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, LogOut, Save, X, Trash2, Pencil, Package, List, PlusCircle, ArrowLeft } from "lucide-react";
import { checkAdminAuth, logoutAdmin } from "../../utils/auth"; 

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab hiện tại: 'form' (đăng bài) hoặc 'list' (xem danh sách)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  const [productList, setProductList] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [product, setProduct] = useState({ id: 0, name: "", category: "mua-ban", desc: "", price: "", quantity: 1, images: [] as string[] });

  useEffect(() => {
    if (!checkAdminAuth()) { router.push("/admin"); return; }
    
    const data = JSON.parse(localStorage.getItem("nat_products") || "[]");
    setProductList(data);

    // Nếu có lệnh sửa từ trang khác, tự động chuyển sang Tab Form
    const editId = searchParams.get("editId");
    if (editId) {
      const itemToEdit = data.find((p: any) => p.id.toString() === editId);
      if (itemToEdit) handleEdit(itemToEdit);
    }
  }, [searchParams]);

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => setProduct(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!product.name || product.images.length === 0) return alert("Thiếu tên hoặc ảnh!");
    let newData;
    if (isEditing) {
      newData = productList.map(p => p.id === product.id ? product : p);
      alert("Đã cập nhật xong!");
    } else {
      newData = [{ ...product, id: Date.now() }, ...productList];
      alert("Đã đăng bài mới thành công!");
    }
    localStorage.setItem("nat_products", JSON.stringify(newData));
    setProductList(newData);
    
    // Nếu sửa xong thì quay về danh sách để xem
    if (isEditing) {
        setActiveTab('list');
        resetForm();
    } else {
        // Nếu đăng mới xong thì reset form để đăng tiếp
        resetForm();
    }
  };

  const handleEdit = (item: any) => {
    setProduct({ ...item, images: item.images || (item.image ? [item.image] : []) });
    setIsEditing(true);
    setActiveTab('form'); // Chuyển sang tab Form để sửa
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa vĩnh viễn sản phẩm này?")) {
      const newData = productList.filter(p => p.id !== id);
      localStorage.setItem("nat_products", JSON.stringify(newData));
      setProductList(newData);
    }
  };

  const resetForm = () => {
    setProduct({ id: 0, name: "", category: "mua-ban", desc: "", price: "", quantity: 1, images: [] });
    setIsEditing(false);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      {/* === HEADER ADMIN === */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-sky-800 text-lg uppercase flex items-center gap-2">
            <span className="bg-sky-100 p-1 rounded">🛡️</span> Admin Panel
        </h1>
        <button onClick={() => router.push('/')} className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-1">
            <ArrowLeft size={16}/> Về trang chủ
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        
        {/* === THANH ĐIỀU HƯỚNG (TAB BUTTONS) === */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${activeTab === 'form' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                {isEditing ? <Pencil size={18}/> : <PlusCircle size={18}/>}
                {isEditing ? "Đang Chỉnh Sửa" : "Đăng Sản Phẩm Mới"}
            </button>
            <button 
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${activeTab === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <List size={18}/>
                Sản Phẩm Đã Đăng ({productList.length})
            </button>
        </div>

        {/* === NỘI DUNG TAB: FORM ĐĂNG BÀI === */}
        {activeTab === 'form' && (
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-sky-600 animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-bold text-slate-700 mb-6 border-b pb-2">
                {isEditing ? "✏️ Chỉnh Sửa Thông Tin" : "📝 Nhập Thông Tin Sản Phẩm"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên sản phẩm (*)</label>
                <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 ring-sky-500 outline-none" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} placeholder="VD: Máy phay CNC Fanuc..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá bán</label>
                  <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} placeholder="VD: 50.000.000" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số lượng kho</label>
                  <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={product.quantity} onChange={e => setProduct({...product, quantity: parseInt(e.target.value)})} min="1" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Danh mục hiển thị</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50" value={product.category} onChange={e => setProduct({...product, category: e.target.value})}>
                  <option value="mua-ban">🛒 Mua Bán Máy Móc</option>
                  <option value="linh-kien">⚙️ Linh Kiện & Phụ Tùng</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết</label>
                <textarea className="w-full p-3 border border-slate-300 rounded-lg h-32" value={product.desc} onChange={e => setProduct({...product, desc: e.target.value})} placeholder="Nhập thông số kỹ thuật, tình trạng máy..."></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Hình ảnh ({product.images.length})</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setProduct(p => ({...p, images: p.images.filter((_,i)=>i!==idx)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100">
                        <X size={12}/>
                      </button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-sky-300 bg-sky-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 transition aspect-square">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    <ImagePlus className="text-sky-500 mb-1" size={24} />
                    <span className="text-xs text-sky-600 font-bold">Thêm ảnh</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-4">
                {isEditing && (
                  <button onClick={() => {resetForm(); setActiveTab('list');}} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition">
                    Hủy Bỏ
                  </button>
                )}
                <button onClick={handleSubmit} className={`flex-1 text-white py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 ${isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-sky-600 hover:bg-sky-700'}`}>
                  {isEditing ? <Save size={20}/> : <PlusCircle size={20}/>}
                  {isEditing ? "Lưu Thay Đổi" : "Đăng Sản Phẩm Ngay"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === NỘI DUNG TAB: DANH SÁCH ĐÃ ĐĂNG === */}
        {activeTab === 'list' && (
          <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-purple-600 animate-in fade-in slide-in-from-right-10 duration-300">
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex justify-between items-center">
                <span>📦 Kho Hàng Của Bạn</span>
                <span className="text-sm font-normal bg-slate-100 px-3 py-1 rounded-full text-slate-500">Tổng: {productList.length} món</span>
            </h2>

            {productList.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center text-slate-400">
                    <Package size={64} className="mb-4 opacity-20"/>
                    <p>Chưa có sản phẩm nào.</p>
                    <button onClick={() => setActiveTab('form')} className="mt-4 text-sky-600 font-bold hover:underline">Đăng bài ngay</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {productList.map((item) => {
                       const thumb = item.images && item.images.length > 0 ? item.images[0] : item.image;
                       return (
                        <div key={item.id} className="flex gap-4 p-3 border border-slate-100 rounded-lg hover:shadow-md transition bg-slate-50/50">
                            {/* Ảnh nhỏ */}
                            <div className="w-20 h-20 bg-slate-200 rounded-md overflow-hidden flex-shrink-0 border">
                                {thumb && <img src={thumb} className="w-full h-full object-cover" />}
                            </div>

                            {/* Thông tin */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 text-sm truncate pr-2">{item.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${item.category === 'mua-ban' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                        {item.category === 'mua-ban' ? 'Máy Móc' : 'Linh Kiện'}
                                    </span>
                                </div>
                                <p className="text-red-600 font-bold text-sm mt-1">{item.price}</p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Package size={12}/> Kho: {item.quantity || 1}
                                </p>
                            </div>

                            {/* Nút thao tác */}
                            <div className="flex flex-col gap-2 justify-center border-l pl-3 ml-1">
                                <button onClick={() => handleEdit(item)} className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition" title="Sửa">
                                    <Pencil size={18}/>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition" title="Xóa">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                       )
                    })}
                </div>
            )}
          </div>
        )}

        {/* === NÚT ĐĂNG XUẤT (NẰM DƯỚI CÙNG) === */}
        <div className="mt-12 text-center">
            <button 
                onClick={logoutAdmin} 
                className="text-slate-400 hover:text-red-600 text-sm flex items-center justify-center gap-2 mx-auto transition duration-300"
            >
                <LogOut size={16}/> Đăng Xuất Khỏi Hệ Thống
            </button>
            <p className="text-xs text-slate-300 mt-2">Phiên đăng nhập tự hết hạn sau 24h</p>
        </div>

      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải Admin...</div>}>
      <DashboardContent />
    </Suspense>
  );
}