import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Phone } from "lucide-react";
import ChatWidget from "./ChatWidget";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// === CẤU HÌNH SEO CHUẨN (ĐÃ TỐI ƯU) ===
export const metadata: Metadata = {
  title: {
    template: "%s | N.A.T Automation", // Các trang con sẽ tự điền vào %s
    default: "N.A.T Automation - Máy CNC & Linh Kiện Tây Ninh", // Tiêu đề mặc định
  },
  description: "Chuyên mua bán, sửa chữa, bảo dưỡng máy CNC, biến tần, servo và cung cấp linh kiện tự động hóa chính hãng tại Tây Ninh. Hotline: 0912.258.461",
  keywords: ["Máy CNC Tây Ninh", "Sửa chữa biến tần", "Linh kiện CNC", "N.A.T Automation", "Cơ khí chính xác"],
  openGraph: {
    title: "N.A.T Automation - Giải pháp Tự động hóa",
    description: "Mua bán, sửa chữa máy công nghiệp và linh kiện CNC chất lượng cao.",
    url: "https://nat-automation.vercel.app", // Link web của bạn
    siteName: "N.A.T Automation",
    images: [
      {
        url: "/og-image.jpg", // Ảnh hiển thị khi share (Nhớ tạo ảnh này bỏ vào folder public)
        width: 1200,
        height: 630,
        alt: "N.A.T Automation Banner",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  verification: {
    // Khi nào có mã từ Google Search Console thì dán vào giữa dấu ngoặc kép bên dưới
    google: "DÁN_MÃ_XÁC_MINH_GOOGLE_CỦA_BẠN_VÀO_ĐÂY", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* suppressHydrationWarning để tránh lỗi do Extension trình duyệt */}
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

            {/* SĐT - NỔI BẬT NHẤT */}
            <a href="tel:0912258461" className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition animate-pulse mx-auto md:mx-0">
              <Phone size={20} fill="currentColor" />
              <span className="text-sm md:text-base">GỌI NGAY: 0912.258.461</span>
            </a>
          </div>
        </div>

        {/* Phần đệm để nội dung không bị Banner che mất */}
        <div className="pt-16 pb-10">
          {children}
        </div>

        {/* CHÈN CON AI VÀO ĐÂY */}
        <ChatWidget />
        
        {/* CHÈN THỐNG KÊ TRUY CẬP */}
        <Analytics />
      </body>
    </html>
  );
}