import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Phone } from "lucide-react";
import ChatWidget from "./ChatWidget";
import { Analytics } from "@vercel/analytics/react"; // <-- MỚI CHÈN VÀO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T",
  description: "Chuyên sửa chữa, bảo dưỡng, mua bán máy CNC và linh kiện uy tín.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* Thêm suppressHydrationWarning={true} để chặn lỗi do Extension trình duyệt */}
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900`}
        suppressHydrationWarning={true}
      >
        {/* === BANNER NỔI (LUÔN DÍNH TRÊN ĐẦU) === */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-sky-800 text-white shadow-md">
          <div className="container mx-auto px-2 py-2 flex justify-between items-center">
            {/* Slogan nhỏ bên trái */}
            <div className="hidden md:flex flex-col text-xs md:text-sm">
              <span className="font-bold uppercase text-yellow-400">CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T</span>
              <span className="italic opacity-90">"Đồng hành suốt vòng đời vận hành"</span>
            </div>

            {/* SĐT BỐ BẠN - NỔI BẬT NHẤT */}
            <a href="tel:0912258461" className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition animate-pulse mx-auto md:mx-0">
              <Phone size={20} fill="currentColor" />
              <span className="text-sm md:text-base">GỌI NGAY: 0912 258 461</span>
            </a>
          </div>
        </div>

        {/* Phần đệm để nội dung không bị Banner che mất */}
        <div className="pt-16 pb-10">
          {children}
        </div>

        {/* CHÈN CON AI VÀO ĐÂY */}
        <ChatWidget />
        
        {/* CHÈN THỐNG KÊ TRUY CẬP Ở ĐÂY */}
        <Analytics />
      </body>
    </html>
  );
}