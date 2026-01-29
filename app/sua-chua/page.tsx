"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wrench, Send, Phone, CheckCircle, AlertCircle } from "lucide-react";

export default function SuaChuaPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Gửi dữ liệu sang Formspree
    try {
      // === QUAN TRỌNG: THAY MÃ ID CỦA BẠN VÀO DƯỚI ĐÂY ===
      const response = await fetch("https://formspree.io/f/mrekzrey", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus("success");
        form.reset(); // Xóa trắng form sau khi gửi
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/"><ArrowLeft size={24} /></Link>
        <h1 className="font-bold text-lg uppercase truncate">Dịch Vụ Sửa Chữa Máy CNC</h1>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: GIỚI THIỆU */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                <Wrench size={48} className="text-orange-500 mb-4"/>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Đội Ngũ Kỹ Thuật 24/7</h2>
                <p className="text-slate-600 leading-relaxed">
                    Máy CNC gặp sự cố? Đừng để gián đoạn sản xuất! 
                    Hãy điền thông tin lỗi vào biểu mẫu bên cạnh, kỹ thuật viên của N.A.T sẽ phân tích và liên hệ lại ngay lập tức.
                </p>
                
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-slate-700">
                        <CheckCircle size={20} className="text-green-500"/> <span>Có mặt trong vòng 24h</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <CheckCircle size={20} className="text-green-500"/> <span>Linh kiện thay thế chính hãng</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <CheckCircle size={20} className="text-green-500"/> <span>Bảo hành sau sửa chữa</span>
                    </div>
                </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 text-center">
                <p className="text-slate-600 mb-2">Cần hỗ trợ khẩn cấp?</p>
                <a href="tel:0912258461" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-orange-700 transition animate-bounce">
                    <Phone size={24}/> 0912 258 461
                </a>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐIỀN THÔNG TIN */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-t-4 border-orange-500">
            <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase">Gửi Yêu Cầu Sửa Chữa</h3>
            
            {status === "success" ? (
                <div className="text-center py-10 bg-green-50 rounded-xl">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32}/>
                    </div>
                    <h4 className="text-xl font-bold text-green-700 mb-2">Đã Gửi Thành Công!</h4>
                    <p className="text-slate-600">Kỹ thuật viên sẽ gọi lại cho bạn trong ít phút nữa.</p>
                    <button onClick={() => setStatus("idle")} className="mt-6 text-orange-600 font-bold hover:underline">Gửi yêu cầu khác</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Tên của bạn / Công ty</label>
                        <input name="name" required type="text" className="w-full p-3 border bg-slate-50 rounded-lg focus:ring-2 ring-orange-400 outline-none transition" placeholder="VD: Anh Nam - Cty Cơ Khí A..." />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ (*)</label>
                        <input name="phone" required type="tel" className="w-full p-3 border bg-slate-50 rounded-lg focus:ring-2 ring-orange-400 outline-none transition" placeholder="VD: 0912 xxx xxx" />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Loại máy đang lỗi</label>
                        <select name="machine_type" className="w-full p-3 border bg-slate-50 rounded-lg focus:ring-2 ring-orange-400 outline-none transition">
                            <option value="Máy Phay CNC">Máy Phay CNC</option>
                            <option value="Máy Tiện CNC">Máy Tiện CNC</option>
                            <option value="Máy Cắt Dây">Máy Cắt Dây / Xung</option>
                            <option value="Biến Tần / PLC">Lỗi Biến Tần / PLC / Điện</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Mô tả tình trạng lỗi</label>
                        <textarea name="message" required className="w-full p-3 border bg-slate-50 rounded-lg h-32 focus:ring-2 ring-orange-400 outline-none transition" placeholder="VD: Máy báo lỗi Spindle, màn hình không lên..."></textarea>
                    </div>

                    {status === "error" && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16}/> Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.
                        </div>
                    )}

                    <button disabled={status === "submitting"} type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-70">
                        {status === "submitting" ? "Đang gửi..." : <><Send size={20}/> GỬI YÊU CẦU NGAY</>}
                    </button>
                </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}