import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mua Bán Máy CNC | Máy Phay, Tiện, Cắt dây CNC giá tốt",
  description:
    "Mua bán máy CNC cũ mới: Máy Phay CNC, Tiện CNC, Cắt dây CNC. Máy nhập khẩu Nhật Bản chính hãng. Giá cạnh tranh, bảo hành uy tín. Giao hàng lắp đặt toàn quốc. Hotline: 0912.258.461",
  keywords: [
    "mua bán máy cnc",
    "máy phay cnc",
    "máy tiện cnc",
    "máy cắt dây cnc",
    "máy cnc cũ",
    "máy cnc nhập khẩu",
    "máy cnc giá rẻ",
    "mua máy cnc Nhật Bản",
    "bán máy cnc TPHCM",
    "NAT Automation",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/mua-ban",
  },
  openGraph: {
    title: "Mua Bán Máy CNC - N.A.T Automation",
    description:
      "Kho máy CNC đa dạng: Máy Phay, Tiện, Cắt dây. Nhập khẩu chính hãng, giá tốt. Hotline: 0912.258.461",
    url: "https://tailieucnc.xyz/mua-ban",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mua bán máy CNC - N.A.T Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mua Bán Máy CNC - N.A.T Automation",
    description:
      "Máy Phay, Tiện, Cắt dây CNC nhập khẩu. Giá tốt, bảo hành uy tín. Hotline: 0912.258.461",
  },
};

export default function MuaBanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
