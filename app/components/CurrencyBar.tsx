"use client";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Globe } from "lucide-react";

export default function CurrencyBar() {
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.error(err));
  }, []);

  if (!rates) return null;

  // Tính toán tỷ giá giả định
  const usd = Math.round(rates.VND).toLocaleString("vi-VN");
  const jpy = Math.round(rates.VND / rates.JPY).toLocaleString("vi-VN");
  const eur = Math.round(rates.VND / rates.EUR).toLocaleString("vi-VN");
  const cny = Math.round(rates.VND / rates.CNY).toLocaleString("vi-VN"); // Thêm tiền Trung Quốc (Thường dùng mua linh kiện)

  // Nội dung của 1 block thông tin
  const ContentBlock = () => (
    <div className="flex items-center gap-12 px-6">
      {/* JPY - Quan trọng nhất */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-400/20">JPY/VND</span>
        <span className="font-mono text-white font-bold text-sm">{jpy} ₫</span>
        <TrendingUp size={14} className="text-green-500 animate-pulse" />
      </div>

      {/* USD */}
      <div className="flex items-center gap-2">
        <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-green-400/20">USD/VND</span>
        <span className="font-mono text-white font-bold text-sm">{usd} ₫</span>
        <DollarSign size={14} className="text-green-500" />
      </div>

      {/* EUR */}
      <div className="flex items-center gap-2">
        <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-400/20">EUR/VND</span>
        <span className="font-mono text-white font-bold text-sm">{eur} ₫</span>
      </div>

      {/* CNY - Trung Quốc */}
      <div className="flex items-center gap-2">
        <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-red-400/20">CNY/VND</span>
        <span className="font-mono text-white font-bold text-sm">{cny} ₫</span>
      </div>

      <div className="flex items-center gap-2 text-slate-500 italic text-xs">
        <Globe size={12} />
        <span>Cập nhật thị trường toàn cầu</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0f172a] border-b border-slate-800 overflow-hidden py-2 select-none relative z-50">
      {/* Wrapper chứa hiệu ứng chạy */}
      <div className="animate-infinite-scroll flex w-max">
        {/* Nhân bản 4 lần để đảm bảo lấp đầy mọi màn hình kể cả màn hình siêu rộng */}
        <ContentBlock />
        <ContentBlock />
        <ContentBlock />
        <ContentBlock />
      </div>
      
      {/* Hiệu ứng mờ 2 bên cạnh để nhìn cho ảo */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}