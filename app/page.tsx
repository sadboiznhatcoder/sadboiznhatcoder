"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  X, Wrench, ShoppingCart, Settings, Repeat, 
  CheckCircle, Target, Heart, Award, MapPin, 
  Facebook, MessageCircle, Phone, Factory, Cpu, Zap, Cog, Lock 
} from "lucide-react";
import CurrencyBar from "./components/CurrencyBar";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  // Link thông tin
  const mapLink = "https://maps.app.goo.gl/kHbAY7UMg4NFdYXC6";
  const zaloLink = "https://zalo.me/0912258461";
  const fbLink = "https://www.facebook.com/vo.nhon.1?locale=vi_VN";
  const address = "74 Đại Hưng, Lạc Thị, Ngọc Hồi, Thanh Trì, Hà Nội";

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Thanh tỷ giá */}
      <CurrencyBar />

      {/* === NÚT ADMIN (GÓC TRÊN BÊN PHẢI - ĐÃ HIỆN RÕ) === */}
      <div className="absolute top-2 right-2 z-50">
        <Link 
          href="/admin" 
          className="flex items-center gap-1 bg-slate-800/80 text-white text-[10px] px-3 py-1.5 rounded-full hover:bg-red-600 transition shadow-sm backdrop-blur-sm"
        >
          <Lock size={10} /> Quản trị
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        
        {/* === POPUP QUẢNG CÁO & LIÊN HỆ === */}
        {showPopup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border-2 border-sky-600">
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 bg-gray-100 rounded-full p-2 hover:bg-red-500 hover:text-white transition z-10"
              >
                <X size={20} />
              </button>
              
              {/* Header Popup */}
              <div className="bg-sky-700 p-6 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <h2 className="text-2xl font-black uppercase relative z-10">Tự Động Hóa N.A.T</h2>
                <p className="italic mt-1 text-sky-100 text-sm relative z-10">"Giải pháp CNC toàn diện & Tin cậy"</p>
              </div>

              {/* Body Popup */}
              <div className="p-6 space-y-5">
                {/* Địa chỉ */}
                <a href={mapLink} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-sky-50 transition border border-slate-100 group">
                  <div className="bg-red-100 p-2 rounded-full text-red-600 group-hover:scale-110 transition">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Địa chỉ trụ sở:</span>
                    <p className="text-slate-800 font-medium text-sm leading-tight mt-1 group-hover:text-sky-700 transition">
                      {address}
                    </p>
                    <span className="text-xs text-sky-600 italic underline">Xem bản đồ</span>
                  </div>
                </a>

                {/* Các nút liên hệ nhanh */}
                <div className="grid grid-cols-2 gap-3">
                  <a href={zaloLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200">
                    <MessageCircle size={20} /> Chat Zalo
                  </a>
                  <a href={fbLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    <Facebook size={20} /> Facebook
                  </a>
                </div>

                <div className="text-center pt-2 border-t border-slate-100">
                   <p className="text-slate-500 text-sm mb-2">Hoặc gọi Hotline kỹ thuật:</p>
                   <a href="tel:0912258461" className="text-3xl font-black text-red-600 hover:scale-105 transition inline-block">0912 258 461</a>
                </div>

                <button onClick={() => setShowPopup(false)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                  Vào Trang Web
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === BANNER HERO === */}
        <section className="mt-6 mb-10 relative bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-2/3">
              <span className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Since 2010
              </span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
                DỊCH VỤ KỸ THUẬT <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">MÁY CNC CHUYÊN SÂU</span>
              </h1>
              <p className="text-sky-100 text-lg mb-8 max-w-xl leading-relaxed">
                Chuyên sửa chữa, bảo dưỡng, nâng cấp và cung cấp linh kiện cho các dòng máy Phay, Tiện, Cắt dây CNC. Đối tác tin cậy của hàng trăm doanh nghiệp cơ khí.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a href="#dich-vu" className="bg-white text-sky-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-slate-900 transition shadow-lg">
                  Xem Dịch Vụ
                </a>
                <a href={zaloLink} target="_blank" className="bg-sky-700 border border-sky-500 text-white px-6 py-3 rounded-full font-bold hover:bg-sky-600 transition flex items-center gap-2">
                  <MessageCircle size={18}/> Tư vấn miễn phí
                </a>
              </div>
            </div>
            {/* Animation Icon Block */}
            <div className="md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-4 bg-sky-500/40 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cog size={80} className="text-yellow-400 animate-spin-slow" />
                </div>
                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg animate-bounce">
                  <Cpu size={32} className="text-blue-600"/>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                  <Factory size={32} className="text-orange-600"/>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === MENU CHÍNH === */}
        <div id="dich-vu" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          <MenuButton href="/sua-chua" icon={<Wrench size={32}/>} title="SỬA CHỮA" desc="Xử lý lỗi nhanh 24/7" color="bg-orange-500" />
          <MenuButton href="/bao-duong" icon={<Settings size={32}/>} title="BẢO DƯỠNG" desc="Định kỳ, nâng cấp" color="bg-green-600" />
          <MenuButton href="/mua-ban" icon={<ShoppingCart size={32}/>} title="MUA BÁN" desc="Máy & Thiết bị CNC" color="bg-blue-600" />
          <MenuButton href="/linh-kien" icon={<Repeat size={32}/>} title="LINH KIỆN" desc="Chính hãng, giá tốt" color="bg-purple-600" />
        </div>

        {/* === SECTION MỚI: TẠI SAO CHỌN CHÚNG TÔI === */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase">Tại sao chọn N.A.T?</h2>
            <div className="w-16 h-1 bg-yellow-400 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap size={40} className="text-yellow-500"/>}
              title="Tốc Độ & Chính Xác"
              desc="Có mặt trong vòng 24h khi khách hàng báo lỗi. Chẩn đoán chính xác, xử lý dứt điểm."
            />
            <FeatureCard 
              icon={<Award size={40} className="text-red-500"/>}
              title="Kinh Nghiệm 15+ Năm"
              desc="Đội ngũ kỹ sư trưởng thành từ thực tế, am hiểu sâu sắc các hệ điều khiển Fanuc, Mitsubishi, Siemens."
            />
            <FeatureCard 
              icon={<Heart size={40} className="text-pink-500"/>}
              title="Hậu Mãi Tận Tâm"
              desc="Bảo hành dài hạn cho dịch vụ sửa chữa. Tư vấn kỹ thuật miễn phí trọn đời máy."
            />
          </div>
        </section>

        {/* === GIỚI THIỆU CÔNG TY === */}
        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-sky-800 uppercase mb-2">Hồ Sơ Năng Lực</h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 text-slate-700 text-justify">
              <p className="text-lg leading-relaxed">
                <strong className="text-sky-700">CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T</strong> được hình thành từ niềm đam mê kỹ thuật điện – điện tử và nhu cầu thực tế của nền công nghiệp. Với đội ngũ kỹ thuật viên trẻ, năng động và chuyên môn cao, chúng tôi đã và đang khẳng định thương hiệu vượt trội về kỹ thuật và chất lượng.
              </p>
              <div className="bg-slate-50 border-l-4 border-yellow-400 p-4 italic text-slate-600">
                "Chúng tôi không chỉ bán sản phẩm, chúng tôi bán sự yên tâm và dịch vụ kỹ thuật tin cậy nhất."
              </div>
            </div>

            {/* Các khối thông tin */}
            <div className="grid grid-cols-1 gap-4">
              <InfoCard 
                icon={<Target className="text-red-500" />} 
                title="TẦM NHÌN CHIẾN LƯỢC" 
                desc="Trở thành công ty quy mô chuyên nghiệp nhất trong lĩnh vực cung cấp máy công cụ và dịch vụ kỹ thuật cao tự động hóa."
              />
              <InfoCard 
                icon={<Heart className="text-pink-500" />} 
                title="SỨ MỆNH CỐT LÕI" 
                desc="Đồng hành tin cậy, nâng bước thành công của khách hàng. Là nền tảng vững vàng cho sự phát triển của toàn thể nhân viên."
              />
            </div>
          </div>

          {/* Marquee Công Nghệ */}
          <div className="mt-12 pt-8 border-t border-slate-100 overflow-hidden">
            <p className="text-center text-slate-400 text-xs uppercase font-bold mb-4 tracking-widest">Chuyên gia các hệ điều hành</p>
            <div className="flex gap-8 justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="font-black text-2xl">FANUC</span>
               <span className="font-black text-2xl">MITSUBISHI</span>
               <span className="font-black text-2xl">SIEMENS</span>
               <span className="font-black text-2xl">YASKAWA</span>
               <span className="font-black text-2xl">OKUMA</span>
            </div>
          </div>
        </section>

        {/* === FOOTER LIÊN HỆ === */}
        <footer className="mt-16 bg-slate-900 text-white rounded-t-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 uppercase text-yellow-400">Liên Hệ Với Chúng Tôi</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 text-sky-400 flex-shrink-0" />
                  <a href={mapLink} target="_blank" rel="noreferrer" className="hover:text-sky-300 transition">
                    {address}
                    <span className="block text-xs text-slate-500 mt-1">(Bấm để xem bản đồ)</span>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="text-sky-400 flex-shrink-0" />
                  <a href="tel:0912258461" className="text-xl font-bold hover:text-sky-300 transition">0912 258 461</a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-slate-400 text-sm">Kết nối mạng xã hội:</p>
              <div className="flex gap-4">
                <a href={zaloLink} target="_blank" rel="noreferrer" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg shadow-blue-500/30">
                  <span className="font-bold text-[10px]">Zalo</span>
                </a>
                <a href={fbLink} target="_blank" rel="noreferrer" className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg shadow-indigo-600/30">
                  <Facebook size={24}/>
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-slate-600 text-xs mt-10 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2026 CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T. All rights reserved.</p>
            
            {/* === LINK ĐĂNG NHẬP ADMIN (FOOTER) === */}
            <Link href="/admin" className="flex items-center gap-1 hover:text-slate-400 transition">
              <Lock size={12}/> Quản trị viên
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

// === CÁC COMPONENT CON ===

function MenuButton({ href, icon, title, desc, color }: any) {
  return (
    <Link href={href} className={`${color} text-white group flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] text-center relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
        {icon}
      </div>
      <div className="bg-white/20 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform relative z-10">
        {icon}
      </div>
      <span className="font-bold text-lg md:text-xl relative z-10">{title}</span>
      <span className="text-xs md:text-sm opacity-90 mt-1 font-medium relative z-10">{desc}</span>
    </Link>
  );
}

function InfoCard({ icon, title, desc }: any) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition group">
      <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm uppercase group-hover:text-sky-700 transition">{title}</h4>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-slate-100 text-center">
      <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-700">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}