import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dịch Vụ Sửa Chữa Máy CNC | Xử lý lỗi Fanuc, Siemens, Mitsubishi 24/7",
  description:
    "Dịch vụ sửa chữa máy CNC chuyên nghiệp: Sửa lỗi Fanuc, Siemens, Mitsubishi, Yaskawa. Sửa máy CNC mất trục X/Y/Z, servo overload, spindle alarm. Có mặt 24h, bảo hành dài hạn. Sửa máy CNC Tây Ninh, TPHCM, Bình Dương. Hotline: 0912.258.461",
  keywords: [
    "sửa chữa máy cnc",
    "sửa lỗi Fanuc",
    "sửa lỗi Siemens",
    "sửa lỗi Mitsubishi",
    "sửa máy cnc mất trục",
    "sửa trục X CNC",
    "lỗi trục Z không lên xuống",
    "máy cnc bị lệch trục Y",
    "servo overload",
    "spindle alarm cnc",
    "sửa máy cnc Tây Ninh",
    "sửa máy cnc TPHCM",
    "sửa máy cnc Bình Dương",
    "sửa máy phay cnc",
    "sửa máy tiện cnc",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/sua-chua",
  },
  openGraph: {
    title: "Dịch Vụ Sửa Chữa Máy CNC - N.A.T Automation",
    description:
      "Sửa chữa máy CNC 24/7: Fanuc, Siemens, Mitsubishi. Xử lý lỗi trục X/Y/Z, servo, spindle. Bảo hành dài hạn. Hotline: 0912.258.461",
    url: "https://tailieucnc.xyz/sua-chua",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dịch vụ sửa chữa máy CNC chuyên nghiệp - N.A.T Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sửa Chữa Máy CNC 24/7 - N.A.T Automation",
    description:
      "Sửa lỗi Fanuc, Siemens, Mitsubishi. Có mặt 24h, linh kiện chính hãng. Hotline: 0912.258.461",
  },
};

// JSON-LD FAQPage Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Máy CNC không chạy trục X là do đâu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Máy CNC không chạy trục X có thể do nhiều nguyên nhân: Lỗi servo driver trục X, đứt dây encoder, lỗi board điều khiển, hoặc cơ khí bị kẹt (vít me, thanh trượt). Cần kiểm tra alarm code trên hệ điều khiển (Fanuc, Siemens...) và đo tín hiệu điện để xác định chính xác. Liên hệ N.A.T Automation: 0912.258.461 để được chẩn đoán miễn phí.",
      },
    },
    {
      "@type": "Question",
      name: "Servo báo lỗi overload sửa bao lâu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lỗi servo overload thường do quá tải cơ khí, hỏng motor servo, hoặc tham số cài đặt sai. Thời gian sửa chữa thông thường từ 2-4 giờ nếu có sẵn linh kiện thay thế. Trường hợp phức tạp cần mang về xưởng kiểm tra, thời gian khoảng 1-3 ngày. N.A.T Automation cam kết có mặt trong 24h.",
      },
    },
    {
      "@type": "Question",
      name: "Chi phí sửa máy CNC bao nhiêu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chi phí sửa chữa máy CNC phụ thuộc vào mức độ hư hỏng và loại linh kiện cần thay. Công khảo sát miễn phí. Chi phí sửa chữa phổ biến từ 500.000đ - 15.000.000đ tùy lỗi. N.A.T Automation luôn báo giá trước khi sửa và bảo hành sau sửa chữa. Gọi 0912.258.461 để được báo giá chính xác.",
      },
    },
    {
      "@type": "Question",
      name: "N.A.T Automation sửa máy CNC tại những khu vực nào?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "N.A.T Automation có trụ sở tại Hà Nội và phục vụ toàn quốc, đặc biệt tại các khu vực: Hà Nội, TP.HCM, Tây Ninh, Bình Dương, Đồng Nai, Long An. Đội ngũ kỹ thuật viên sẵn sàng di chuyển đến nhà máy, xưởng sản xuất của khách hàng.",
      },
    },
  ],
};

export default function SuaChuaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
