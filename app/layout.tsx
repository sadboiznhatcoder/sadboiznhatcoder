import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Phone } from "lucide-react";
import ChatWidget from "./ChatWidget";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// === CẤU HÌNH SEO CHUẨN (ĐÃ GẮN MÃ GOOGLE MỚI CỦA BẠN) ===
export const metadata: Metadata = {
  title: {
    template: "%s | N.A.T Automation",
    default: "N.A.T Automation | Sửa chữa máy CNC & Tài liệu CNC",
  },
  description: "Cung cấp giải pháp Tự Động Hóa, sửa chữa, bảo dưỡng máy CNC. Mua bán linh kiện, biến tần, servo chính hãng. Hỗ trợ kỹ thuật 24/7. Hotline: 0912.258.461",
  keywords: ["sửa chữa máy cnc", "tài liệu cnc", "bảo dưỡng cnc", "mua bán máy cnc", "linh kiện tự động hóa", "biến tần", "servo", "NAT Automation", "tailieucnc.xyz"],
  openGraph: {
    title: "N.A.T Automation - Chuyên gia máy CNC",
    description: "Giải pháp tự động hóa toàn diện cho nhà máy của bạn.",
    url: "https://tailieucnc.xyz",
    siteName: "N.A.T Automation",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "N.A.T Automation Banner",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  // ĐÂY LÀ MÃ MỚI CỦA BẠN ĐÃ ĐƯỢC GẮN VÀO 👇
  verification: {
    google: "_AhE5pD_Tvu2x5r5IhcnsiUSCcnEHaeaw-4eWrmC_rw", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900`}
        suppressHydrationWarning={true}
      >
        {/* === BANNER NỔI === */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-sky-800 text-white shadow-md">
          <div className="container mx-auto px-2 py-2 flex justify-between items-center">
            <div className="hidden md:flex flex-col text-xs md:text-sm">
              <span className="font-bold uppercase text-yellow-400">CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T</span>
              <span className="italic opacity-90">"Đồng hành suốt vòng đời vận hành"</span>
            </div>
            <a href="tel:0912258461" className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition animate-pulse mx-auto md:mx-0">
              <Phone size={20} fill="currentColor" />
              <span className="text-sm md:text-base">GỌI NGAY: 0912.258.461</span>
            </a>
          </div>
        </div>

        <div className="pt-16 pb-10">
          {children}
        </div>

        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}