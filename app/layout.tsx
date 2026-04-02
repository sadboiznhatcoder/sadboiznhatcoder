import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Phone } from "lucide-react";
import ChatWidgetLoader from "./ChatWidgetLoader";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// === CẤU HÌNH SEO CHUẨN (TOÀN DIỆN) ===
export const metadata: Metadata = {
  metadataBase: new URL("https://tailieucnc.xyz"),
  title: {
    template: "%s | N.A.T Automation - Chuyên gia máy CNC",
    default: "N.A.T Automation | Sửa chữa máy CNC, Bảo trì CNC, Mua bán linh kiện CNC",
  },
  description:
    "Công ty TNHH Tự Động Hóa N.A.T - Chuyên sửa chữa máy CNC, bảo trì CNC định kỳ, mua bán linh kiện servo, driver, spindle, board điều khiển. Sửa lỗi Fanuc, Siemens, Mitsubishi. Hỗ trợ kỹ thuật 24/7 tại Tây Ninh, TPHCM, Bình Dương. Hotline: 0912.258.461",
  keywords: [
    "sửa chữa máy cnc",
    "bảo trì cnc định kỳ",
    "sửa lỗi Fanuc",
    "sửa lỗi Siemens",
    "sửa lỗi Mitsubishi",
    "sửa máy cnc mất trục",
    "sửa trục X CNC",
    "lỗi trục Z không lên xuống",
    "máy cnc bị lệch trục Y",
    "bán servo cnc",
    "driver cnc giá rẻ",
    "spindle cnc",
    "board điều khiển cnc",
    "mua bán máy cnc",
    "linh kiện tự động hóa",
    "biến tần",
    "servo",
    "sửa máy cnc Tây Ninh",
    "sửa máy cnc TPHCM",
    "sửa máy cnc Bình Dương",
    "tài liệu cnc",
    "NAT Automation",
    "tailieucnc.xyz",
  ],
  openGraph: {
    title: "N.A.T Automation - Chuyên gia Sửa chữa & Bảo trì Máy CNC hàng đầu",
    description:
      "Giải pháp tự động hóa toàn diện: Sửa chữa máy CNC, bảo dưỡng định kỳ, cung cấp linh kiện servo, driver, spindle chính hãng. Hotline 24/7: 0912.258.461",
    url: "https://tailieucnc.xyz",
    siteName: "N.A.T Automation",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "N.A.T Automation - Chuyên gia sửa chữa máy CNC, bảo trì CNC, cung cấp linh kiện tự động hóa",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N.A.T Automation - Chuyên gia Sửa chữa Máy CNC",
    description:
      "Sửa chữa, bảo trì máy CNC chuyên nghiệp. Fanuc, Siemens, Mitsubishi. Linh kiện chính hãng. Hotline: 0912.258.461",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://tailieucnc.xyz",
  },
  verification: {
    google: "_AhE5pD_Tvu2x5r5IhcnsiUSCcnEHaeaw-4eWrmC_rw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// === JSON-LD SCHEMAS ===
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://tailieucnc.xyz/#organization",
  name: "Công Ty TNHH Tự Động Hóa N.A.T",
  alternateName: "N.A.T Automation",
  description:
    "Chuyên gia sửa chữa máy CNC, bảo trì CNC định kỳ, mua bán linh kiện servo, driver, spindle, board điều khiển. Hỗ trợ kỹ thuật 24/7.",
  url: "https://tailieucnc.xyz",
  telephone: "+84912258461",
  email: "contact@tailieucnc.xyz",
  address: {
    "@type": "PostalAddress",
    streetAddress: "74 Đại Hưng, Lạc Thị, Ngọc Hồi",
    addressLocality: "Thanh Trì",
    addressRegion: "Hà Nội",
    addressCountry: "VN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "20.9423",
    longitude: "105.8545",
  },
  image: "https://tailieucnc.xyz/og-image.png",
  priceRange: "$$",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:30",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com/vo.nhon.1?locale=vi_VN",
    "https://zalo.me/0912258461",
  ],
  areaServed: [
    { "@type": "City", name: "Hà Nội" },
    { "@type": "City", name: "Hồ Chí Minh" },
    { "@type": "City", name: "Tây Ninh" },
    { "@type": "City", name: "Bình Dương" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dịch vụ CNC",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sửa chữa máy CNC",
          description: "Sửa chữa các loại máy Phay, Tiện, Cắt dây CNC. Xử lý lỗi Fanuc, Siemens, Mitsubishi.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bảo dưỡng CNC định kỳ",
          description: "Bảo trì, bảo dưỡng máy CNC định kỳ. Nâng cấp hệ thống điều khiển.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Cung cấp linh kiện CNC",
          description: "Bán servo, driver, spindle, board điều khiển CNC chính hãng giá tốt.",
        },
      },
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: "https://tailieucnc.xyz",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Sửa chữa CNC",
      item: "https://tailieucnc.xyz/sua-chua",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Bảo dưỡng CNC",
      item: "https://tailieucnc.xyz/bao-duong",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Mua bán máy CNC",
      item: "https://tailieucnc.xyz/mua-ban",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Linh kiện CNC",
      item: "https://tailieucnc.xyz/linh-kien",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Kiến thức CNC",
      item: "https://tailieucnc.xyz/kien-thuc",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* === GOOGLE ANALYTICS 4 === */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-JXNZ9TWVXF"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JXNZ9TWVXF');
          `}
        </Script>

        {/* === JSON-LD SCHEMA MARKUP === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900`}
        suppressHydrationWarning={true}
      >
        {/* === BANNER NỔI (SEMANTIC NAV) === */}
        <nav
          aria-label="Thông tin liên hệ nhanh"
          className="fixed top-0 left-0 right-0 z-50 bg-sky-800 text-white shadow-md"
        >
          <div className="container mx-auto px-2 py-2 flex justify-between items-center">
            <div className="hidden md:flex flex-col text-xs md:text-sm">
              <span className="font-bold uppercase text-yellow-400">
                CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T
              </span>
              <span className="italic opacity-90">
                &quot;Đồng hành suốt vòng đời vận hành&quot;
              </span>
            </div>
            <a
              href="tel:0912258461"
              className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition animate-pulse mx-auto md:mx-0"
              aria-label="Gọi hotline N.A.T Automation: 0912 258 461"
            >
              <Phone size={20} fill="currentColor" />
              <span className="text-sm md:text-base">GỌI NGAY: 0912.258.461</span>
            </a>
          </div>
        </nav>

        <div className="pt-16 pb-10">{children}</div>

        <ChatWidgetLoader />
        <Analytics />
      </body>
    </html>
  );
}