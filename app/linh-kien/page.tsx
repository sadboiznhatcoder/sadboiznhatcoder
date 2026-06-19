"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, X, Pencil, Trash2, CircuitBoard, Loader2, ShoppingCart, Check } from "lucide-react";
import { checkAuth } from "../utils/auth";
import { supabase } from "../utils/supabase";
import { useCart, parsePriceString } from "../utils/CartContext";

export default function LinhKienPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const { addToCart } = useCart();

  // Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product: any) => {
    const numericPrice = parsePriceString(product.price || "");
    if (!numericPrice) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: numericPrice,
      priceLabel: product.price,
      image: product.images?.[0] || "",
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  useEffect(() => {
    // 1. Kiểm tra Admin (ở client)
    if (typeof window !== "undefined") {
        setIsAdmin(checkAuth());
    }

    // 2. Tải dữ liệu từ Supabase
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Gọi Database lấy sản phẩm thuộc danh mục 'linh-kien'
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'linh-kien')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Lỗi tải linh kiện:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    const images = product.images && product.images.length > 0 ? product.images : [];
    setActiveImage(images[0] || "");
  };

  // === XỬ LÝ XÓA (ADMIN) ===
  const deleteProduct = async (e: any, id: number) => {
    e.stopPropagation();
    if (!confirm("Admin muốn xóa linh kiện này khỏi Database không?")) return;

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
    <main className="min-h-screen bg-slate-100 pb-10">
      {/* Header Mobile - Màu Tím */}
      <header className="bg-purple-700 text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/" aria-label="Quay lại trang chủ"><ArrowLeft size={24} /></Link>
            <h1 className="font-bold text-lg uppercase truncate">Linh Kiện & Phụ Tùng</h1>
        </div>
        {isAdmin && <span className="bg-white text-purple-700 text-xs px-2 py-1 rounded font-bold animate-pulse">ADMIN MODE</span>}
      </header>

      <div className="container mx-auto p-2 md:p-6 max-w-6xl">
        
        {/* Hiệu ứng đang tải */}
        {isLoading ? (
            <div className="flex justify-center py-20 text-purple-600">
                <Loader2 className="animate-spin" size={40} />
            </div>
        ) : products.length === 0 ? (
           <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <CircuitBoard size={48} className="mb-2 opacity-50"/>
             <p>Hiện chưa có linh kiện nào.</p>
           </div>
        ) : (
          /* === GIAO DIỆN GRID KIỂU SHOPEE === */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {products.map((item) => {
              const firstImg = item.images?.[0] || "https://via.placeholder.com/300?text=No+Image";
              
              return (
                <div key={item.id} onClick={() => openDetail(item)} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-purple-500 hover:shadow-md transition relative group">
                  
                  {/* CÔNG CỤ ADMIN */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-30 flex gap-2">
                        <button onClick={(e) => editProduct(e, item.id)} className="bg-yellow-400 text-white p-1.5 rounded-full shadow hover:scale-110 transition" title="Sửa"><Pencil size={14}/></button>
                        <button onClick={(e) => deleteProduct(e, item.id)} className="bg-red-600 text-white p-1.5 rounded-full shadow hover:scale-110 transition" title="Xóa"><Trash2 size={14}/></button>
                    </div>
                  )}

                  <div className="aspect-square bg-slate-200 relative overflow-hidden">
                    <img src={firstImg} alt={`Linh kiện CNC: ${item.name} - servo, driver, spindle chính hãng`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    
                    {/* Nhãn chính hãng */}
                    <span className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      CHÍNH HÃNG
                    </span>
                  </div>

                  <div className="p-2 md:p-3">
                    <h3 className="text-xs md:text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5em] mb-1">{item.name}</h3>
                    <span className="text-red-600 font-bold text-sm md:text-base block">{item.price || "Liên hệ"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === POPUP CHI TIẾT === */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-10 animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 z-10 bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition"><X size={20} /></button>
            
            {/* CỘT ẢNH */}
            <div className="w-full md:w-3/5 bg-black flex flex-col justify-center relative">
              <div className="h-[300px] md:h-[500px] w-full flex items-center justify-center">
                  <img src={activeImage || "https://via.placeholder.com/500?text=No+Image"} alt={`Chi tiết linh kiện: ${selectedProduct.name}`} className="max-w-full max-h-full object-contain" />
              </div>
              
              {/* List ảnh nhỏ */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="bg-black/60 p-2 flex gap-2 overflow-x-auto justify-center absolute bottom-0 w-full backdrop-blur-sm">
                    {selectedProduct.images.map((img: string, idx: number) => (
                        <button key={idx} onClick={() => setActiveImage(img)} className={`w-14 h-14 border-2 rounded-md overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-purple-500 scale-110' : 'border-slate-600 opacity-60'}`}>
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                  </div>
              )}
            </div>

            {/* CỘT THÔNG TIN */}
            <div className="w-full md:w-2/5 p-6 overflow-y-auto bg-white flex flex-col">
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit mb-2 uppercase flex items-center gap-1"><CircuitBoard size={12}/> Linh Kiện</span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{selectedProduct.name}</h2>
              <div className="inline-block bg-purple-50 px-3 py-1 rounded border border-purple-100 mb-6 self-start">
                  <p className="text-xl font-bold text-purple-700">{selectedProduct.price || "Liên hệ báo giá"}</p>
              </div>
              
              <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide border-b pb-1 mb-2">Thông số kỹ thuật</h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                        {selectedProduct.description || "Đang cập nhật thông số..."}
                    </p>
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white space-y-2">
                {/* Nút thêm vào giỏ - chỉ hiện khi có giá */}
                {parsePriceString(selectedProduct.price || "") && (
                  <button
                    onClick={() => { handleAddToCart(selectedProduct); }}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 cursor-pointer"
                  >
                    <ShoppingCart size={20} />
                    <span>THÊM VÀO GIỎ HÀNG</span>
                  </button>
                )}
                <a href="tel:0912258461" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200 group">
                    <Phone size={20} className="group-hover:animate-bounce"/> 
                    <span>LIÊN HỆ: 0912.258.461</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </main>
  );
}