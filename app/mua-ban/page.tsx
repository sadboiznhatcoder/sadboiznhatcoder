"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { checkAuth } from "../utils/auth"; // Đã đổi thành checkAuth cho chuẩn
import { supabase } from "../utils/supabase"; // Import kết nối Database

export default function MuaBanPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    // 1. Kiểm tra Admin (để hiện nút Xóa/Sửa)
    if (typeof window !== "undefined") {
        setIsAdmin(checkAuth());
    }

    // 2. Tải dữ liệu từ Supabase
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Gọi Database lấy sản phẩm thuộc danh mục 'mua-ban'
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'mua-ban')
      .order('created_at', { ascending: false }); // Mới nhất lên đầu

    if (error) {
      console.error("Lỗi tải hàng:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    // Xử lý ảnh: Nếu là mảng thì lấy, nếu không thì mảng rỗng
    const images = product.images && product.images.length > 0 ? product.images : [];
    setActiveImage(images[0] || "");
  };

  // === XỬ LÝ XÓA (ADMIN) ===
  const deleteProduct = async (e: any, id: number) => {
    e.stopPropagation();
    if (!confirm("Admin muốn xóa sản phẩm này khỏi Database không?")) return;

    // Xóa trên Supabase
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      alert("Xóa thất bại: " + error.message);
    } else {
      alert("Đã xóa thành công!");
      loadData(); // Tải lại danh sách
    }
  };

  // === XỬ LÝ SỬA (ADMIN) ===
  const editProduct = (e: any, id: number) => {
    e.stopPropagation();
    router.push(`/admin/dashboard?editId=${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* HEADER */}
      <div className="bg-sky-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/"><ArrowLeft size={24} /></Link>
            <h1 className="font-bold text-lg uppercase truncate">Mua Bán Máy Móc</h1>
        </div>
        {isAdmin && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">ADMIN MODE</span>}
      </div>

      {/* CONTENT */}
      <div className="container mx-auto p-2 md:p-6 max-w-6xl">
        
        {/* Hiệu ứng đang tải */}
        {isLoading ? (
            <div className="flex justify-center py-20 text-sky-600">
                <Loader2 className="animate-spin" size={40} />
            </div>
        ) : products.length === 0 ? (
           <div className="text-center py-20 text-slate-400">Hiện chưa có sản phẩm nào được đăng.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.map((item) => {
              // Xử lý ảnh hiển thị thumbnail
              const firstImg = item.images?.[0] || "https://via.placeholder.com/300?text=No+Image";
              
              return (
                <div key={item.id} onClick={() => openDetail(item)} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-sky-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group">
                  
                  {/* CÔNG CỤ ADMIN */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => editProduct(e, item.id)} className="bg-yellow-400 text-white p-2 rounded-full shadow hover:bg-yellow-500" title="Sửa"><Pencil size={14}/></button>
                        <button onClick={(e) => deleteProduct(e, item.id)} className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700" title="Xóa"><Trash2 size={14}/></button>
                    </div>
                  )}

                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img src={firstImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 min-h-[2.5em] mb-1 group-hover:text-sky-700 transition-colors">{item.name}</h3>
                    <span className="text-red-600 font-bold text-sm md:text-base block">{item.price || "Liên hệ"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP CHI TIẾT */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-10 animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 z-10 bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition"><X size={20} /></button>
            
            {/* Cột Trái: Ảnh */}
            <div className="w-full md:w-3/5 bg-black flex flex-col justify-center relative group">
              <div className="h-[300px] md:h-[500px] w-full flex items-center justify-center">
                 <img src={activeImage || "https://via.placeholder.com/500?text=No+Image"} className="max-w-full max-h-full object-contain" />
              </div>
              {/* List ảnh nhỏ */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="bg-black/60 p-4 flex gap-3 overflow-x-auto justify-center backdrop-blur-sm absolute bottom-0 w-full">
                    {selectedProduct.images.map((img: string, idx: number) => (
                        <button key={idx} onClick={() => setActiveImage(img)} className={`w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-sky-500 scale-110' : 'border-slate-600 opacity-60 hover:opacity-100'}`}>
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                  </div>
              )}
            </div>

            {/* Cột Phải: Thông tin */}
            <div className="w-full md:w-2/5 p-6 md:p-8 overflow-y-auto bg-white flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedProduct.name}</h2>
              <div className="inline-block bg-red-50 px-4 py-2 rounded-lg border border-red-100 mb-6 self-start">
                  <p className="text-xl font-bold text-red-600">{selectedProduct.price || "Liên hệ báo giá"}</p>
              </div>
              
              <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-2 mb-3 flex items-center gap-2">
                        <span className="text-xl">📝</span> Mô tả chi tiết
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {selectedProduct.description || "Đang cập nhật mô tả..."}
                    </p>
                  </div>
              </div>

              <div className="mt-8 pt-6 border-t sticky bottom-0 bg-white">
                <a href="tel:0912258461" className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-600 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 group">
                    <Phone size={24} className="group-hover:animate-bounce" /> 
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xs font-normal opacity-90">Tư vấn & Báo giá</span>
                        <span className="text-lg">0912.258.461</span>
                    </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}