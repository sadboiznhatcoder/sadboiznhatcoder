import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linh Kiện CNC | Servo, Driver, Spindle, Board Điều Khiển Chính Hãng",
  description:
    "Cung cấp linh kiện CNC chính hãng giá tốt: Servo motor, Driver, Spindle, Board điều khiển, biến tần, encoder. Fanuc, Siemens, Mitsubishi, Yaskawa, Panasonic. Bảo hành linh kiện. Giao hàng toàn quốc. Hotline: 0912.258.461",
  keywords: [
    "bán servo cnc",
    "driver cnc giá rẻ",
    "spindle cnc",
    "board điều khiển cnc",
    "linh kiện cnc chính hãng",
    "servo Fanuc",
    "servo Mitsubishi",
    "biến tần cnc",
    "encoder cnc",
    "linh kiện tự động hóa",
    "servo Yaskawa",
    "servo Panasonic",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/linh-kien",
  },
  openGraph: {
    title: "Linh Kiện CNC Chính Hãng - N.A.T Automation",
    description:
      "Servo, Driver, Spindle, Board điều khiển CNC chính hãng. Fanuc, Siemens, Mitsubishi. Giao hàng toàn quốc. Hotline: 0912.258.461",
    url: "https://tailieucnc.xyz/linh-kien",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linh kiện CNC chính hãng - N.A.T Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linh Kiện CNC Chính Hãng - N.A.T Automation",
    description:
      "Servo, Driver, Spindle CNC chính hãng Fanuc, Siemens, Mitsubishi. Hotline: 0912.258.461",
  },
};

export default function LinhKienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
