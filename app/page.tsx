"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, ShoppingCart, Settings, Repeat, 
  CheckCircle, Phone, ArrowRight, Clock, MapPin, Star 
} from "lucide-react";
import { supabase } from "./utils/supabase";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === TẢI BÀI VIẾT TỪ SUPABASE ===
  useEffect(() => {
    const fetchPosts = async () => {
      // Lấy dữ liệu từ bảng 'posts', sắp xếp mới nhất lên đầu
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Lỗi tải bài viết:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen font-sans">
      
      {/* === PHẦN 1: HERO BANNER (Dữ liệu tĩnh) === */}
      <div className="relative h-[500px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 animate-in fade-in duration-1000"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="bg-yellow-500 text-slate-900 font-bold px-3 py-1 rounded text-sm md:text-base mb-4 inline-block animate-bounce">
            UY TÍN - TẬN TÂM - CHUYÊN NGHIỆP
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            GIẢI PHÁP TỰ ĐỘNG HÓA <br/> <span className="text-sky-400">TOÀN DIỆN CHO BẠN</span>
          </h1>
          <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Chuyên cung cấp, sửa chữa và bảo dưỡng máy CNC, biến tần, servo và linh kiện công nghiệp tại Tây Ninh.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/mua-ban" className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <ShoppingCart size={20}/> XEM SẢN PHẨM
            </Link>
            <a href="tel:0912258461" className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <Phone size={20}/> TƯ VẤN MIỄN PHÍ
            </a>
          </div>
        </div>
      </div>

      {/* === PHẦN 2: DANH MỤC DỊCH VỤ (4 Ô TRÒN) === */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 uppercase mb-2">Dịch Vụ Của Chúng Tôi</h2>
            <div className="w-20 h-1 bg-sky-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {/* Ô 1: Sửa Chữa */}
            <Link href="/sua-chua" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 hover:border-sky-500 transition-all text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Wrench size={32} />
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600">SỬA CHỮA</h3>
              <p className="text-xs text-slate-500 mt-2">Biến tần, Servo, HMI...</p>
            </Link>

            {/* Ô 2: Bảo Dưỡng */}
            <Link href="/bao-duong" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 hover:border-green-500 transition-all text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Settings size={32} />
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-green-600">BẢO DƯỠNG</h3>
              <p className="text-xs text-slate-500 mt-2">Định kỳ, nâng cấp máy</p>
            </Link>

            {/* Ô 3: Mua Bán */}
            <Link href="/mua-ban" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 hover:border-red-500 transition-all text-center">
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <ShoppingCart size={32} />
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-red-600">MUA BÁN</h3>
              <p className="text-xs text-slate-500 mt-2">Máy móc nhập khẩu</p>
            </Link>

            {/* Ô 4: Linh Kiện */}
            <Link href="/linh-kien" className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 hover:border-purple-500 transition-all text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Repeat size={32} />
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-purple-600">LINH KIỆN</h3>
              <p className="text-xs text-slate-500 mt-2">Phụ tùng thay thế</p>
            </Link>
          </div>
        </div>
      </div>

      {/* === PHẦN 3: TIN TỨC / BÀI VIẾT (GIAO DIỆN SO-LE) === */}
      {/* Chỉ hiện khi có bài viết */}
      {posts.length > 0 && (
        <div className="bg-white py-16 px-4 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                Hoạt động & Kiến thức
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">GÓC CHUYÊN GIA N.A.T</h2>
            </div>

            <div className="space-y-20">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Cột Ảnh */}
                  <div className="w-full md:w-1/2 group">
                    <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-video border-4 border-white bg-slate-100">
                      <img 
                        src={post.image || "https://via.placeholder.com/600x400"} 
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Hiệu ứng bóng */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  {/* Cột Nội dung */}
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
                      <Clock size={16}/>
                      <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight group-hover:text-sky-700 transition-colors">
                      {post.title}
                    </h3>
                    <div className="w-16 h-1 bg-yellow-400 mb-6"></div>
                    <p className="text-slate-600 text-lg leading-relaxed mb-6 line-clamp-4">
                      {post.content}
                    </p>
                    {/* Nút Xem chi tiết giả lập (có thể làm trang riêng sau này) */}
                    <button className="flex items-center gap-2 text-sky-600 font-bold hover:gap-4 transition-all">
                      Xem chi tiết <ArrowRight size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Nếu đang tải thì hiện skeleton nhẹ */}
      {loading && (
        <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* === PHẦN 4: TẠI SAO CHỌN N.A.T ? === */}
      <div className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
        {/* Background họa tiết mờ */}
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Settings size={300} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Tại Sao Chọn <span className="text-yellow-400">N.A.T Automation?</span>
              </h2>
              <p className="text-slate-300 mb-8 text-lg">
                Với hơn 10 năm kinh nghiệm trong lĩnh vực tự động hóa, chúng tôi cam kết mang lại giải pháp tối ưu nhất cho nhà máy của bạn.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-3 rounded-lg text-green-400"><CheckCircle size={24}/></div>
                  <div>
                    <h4 className="font-bold text-xl">Linh kiện chính hãng</h4>
                    <p className="text-slate-400 text-sm">Nguồn gốc xuất xứ rõ ràng, bảo hành dài hạn.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400"><Clock size={24}/></div>
                  <div>
                    <h4 className="font-bold text-xl">Hỗ trợ 24/7</h4>
                    <p className="text-slate-400 text-sm">Có mặt ngay khi máy gặp sự cố.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-400"><Star size={24}/></div>
                  <div>
                    <h4 className="font-bold text-xl">Kỹ thuật viên lành nghề</h4>
                    <p className="text-slate-400 text-sm">Đội ngũ kỹ sư giàu kinh nghiệm thực chiến.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form liên hệ nhanh */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-center">Gửi Yêu Cầu Tư Vấn</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 ring-sky-500 outline-none" placeholder="Tên của bạn" />
                <input className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 ring-sky-500 outline-none" placeholder="Số điện thoại" />
                <textarea className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white h-24 focus:ring-2 ring-sky-500 outline-none" placeholder="Nội dung cần hỗ trợ..."></textarea>
                <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition">GỬI NGAY</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* === FOOTER === */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-900">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4 uppercase">CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T</h4>
              <p className="text-sm mb-4">Đồng hành cùng sự phát triển của doanh nghiệp Việt.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">LIÊN HỆ</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin size={16} className="text-sky-500"/> Tây Ninh, Việt Nam</li>
                <li className="flex items-center gap-2"><Phone size={16} className="text-sky-500"/> 0912.258.461</li>
              </ul>
            </div>
            <div>
               <h4 className="text-white font-bold text-lg mb-4">THEO DÕI</h4>
               <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-slate-800 flex items-center justify-center rounded hover:bg-blue-600 transition text-white">FB</a>
                  <a href="#" className="w-10 h-10 bg-slate-800 flex items-center justify-center rounded hover:bg-red-600 transition text-white">YT</a>
               </div>
            </div>
         </div>
         <div className="text-center mt-12 pt-8 border-t border-slate-900 text-xs text-slate-600">
            © 2024 N.A.T Automation. All rights reserved.
         </div>
      </footer>
    </div>
  );
}