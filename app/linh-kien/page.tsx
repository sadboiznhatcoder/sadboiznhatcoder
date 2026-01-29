"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, X, Pencil, Trash2, CircuitBoard } from "lucide-react";
import { checkAdminAuth } from "../utils/auth"; // Kiểm tra quyền Admin

export default function LinhKienPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Biến xác nhận Admin

  useEffect(() => {
    // 1. Kiểm tra xem có phải Admin không để hiện nút Sửa/Xóa
    setIsAdmin(checkAdminAuth());

    // 2. Tải dữ liệu
    loadData();
  }, []);

  const loadData = () => {
    const allProducts = JSON.parse(localStorage.getItem("nat_products") || "[]");
    // LỌC: Chỉ lấy danh mục "linh-kien"
    const filtered = allProducts.filter((p: any) => p.category === "linh-kien");
    setProducts(filtered);
  };

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    const images = product.images || (product.image ? [product.image] : []);
    setActiveImage(images[0] || "");
  };

  // === HÀM XỬ LÝ NHANH CHO ADMIN ===
  const deleteProduct = (e: any, id: number) => {
    e.stopPropagation(); // Chặn không cho bật popup xem chi tiết
    if (confirm("Admin muốn xóa linh kiện này luôn không?")) {
      const allProducts = JSON.parse(localStorage.getItem("nat_products") || "[]");
      const newData = allProducts.filter((p: any) => p.id !== id);
      localStorage.setItem("nat_products", JSON.stringify(newData));
      loadData(); // Tải lại trang ngay lập tức
    }
  };

  const editProduct = (e: any, id: number) => {
    e.stopPropagation();
    // Chuyển hướng sang trang Dashboard để sửa
    router.push(`/admin/dashboard?editId=${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* Header Mobile - Màu Tím */}
      <div className="bg-purple-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/"><ArrowLeft size={24} /></Link>
            <h1 className="font-bold text-lg uppercase truncate">Linh Kiện & Phụ Tùng</h1>
        </div>
        {/* Nếu là Admin thì hiện chữ Admin */}
        {isAdmin && <span className="bg-white text-purple-700 text-xs px-2 py-1 rounded font-bold animate-pulse">ADMIN MODE</span>}
      </div>

      <div className="container mx-auto p-2 md:p-6 max-w-6xl">
        {products.length === 0 ? (
           <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <CircuitBoard size={48} className="mb-2 opacity-50"/>
             <p>Chưa có linh kiện nào.</p>
           </div>
        ) : (
          /* === GIAO DIỆN GRID KIỂU SHOPEE === */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {products.map((item) => {
              const imgList = item.images && item.images.length > 0 ? item.images : [item.image];
              
              return (
                <div key={item.id} onClick={() => openDetail(item)} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-purple-500 hover:shadow-md transition relative group">
                  
                  {/* === CÔNG CỤ ADMIN (CHỈ HIỆN KHI ĐĂNG NHẬP) === */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-30 flex gap-2">
                        <button onClick={(e) => editProduct(e, item.id)} className="bg-yellow-400 text-white p-1.5 rounded-full shadow hover:scale-110 transition" title="Sửa nhanh"><Pencil size={14}/></button>
                        <button onClick={(e) => deleteProduct(e, item.id)} className="bg-red-600 text-white p-1.5 rounded-full shadow hover:scale-110 transition" title="Xóa nhanh"><Trash2 size={14}/></button>
                    </div>
                  )}

                  <div className="aspect-square bg-slate-200 relative overflow-hidden">
                    <img src={imgList[0]} className="w-full h-full object-cover" />
                    
                    {/* Nhãn chính hãng */}
                    <span className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      CHÍNH HÃNG
                    </span>
                  </div>

                  <div className="p-2 md:p-3">
                    <h3 className="text-xs md:text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5em] mb-1">{item.name}</h3>
                    <span className="text-red-600 font-bold text-sm md:text-base">{item.price || "Liên hệ"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === POPUP CHI TIẾT === */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-10 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 z-10 bg-gray-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition"><X size={20} /></button>
            
            {/* CỘT ẢNH */}
            <div className="w-full md:w-3/5 bg-black flex flex-col justify-center relative">
              <div className="h-[300px] md:h-[500px] w-full flex items-center justify-center bg-black"><img src={activeImage} className="max-w-full max-h-full object-contain" /></div>
              <div className="bg-black/80 p-2 flex gap-2 overflow-x-auto justify-center">{(selectedProduct.images || [selectedProduct.image]).map((img: string, idx: number) => (<button key={idx} onClick={() => setActiveImage(img)} className={`w-14 h-14 border-2 rounded-md overflow-hidden flex-shrink-0 ${activeImage === img ? 'border-purple-500' : 'border-transparent opacity-50'}`}><img src={img} className="w-full h-full object-cover" /></button>))}</div>
            </div>

            {/* CỘT THÔNG TIN */}
            <div className="w-full md:w-2/5 p-6 overflow-y-auto bg-white flex flex-col">
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit mb-2 uppercase flex items-center gap-1"><CircuitBoard size={12}/> Linh Kiện</span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{selectedProduct.name}</h2>
              <p className="text-2xl font-bold text-red-600 mb-6">{selectedProduct.price || "Liên hệ báo giá"}</p>
              <div className="flex-1"><h4 className="font-bold text-slate-700 text-sm border-b pb-2 mb-2">THÔNG SỐ KỸ THUẬT</h4><p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedProduct.desc}</p></div>
              <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white"><a href="tel:0912258461" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200 animate-bounce"><Phone size={20} /> LIÊN HỆ: 0912.258.461</a></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}