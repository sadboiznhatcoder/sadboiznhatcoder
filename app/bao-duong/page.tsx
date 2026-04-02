import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  CheckCircle,
  Phone,
  MessageCircle,
  Calendar,
  Shield,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Bảo Dưỡng Máy CNC Định Kỳ | Bảo trì CNC chuyên nghiệp",
  description:
    "Dịch vụ bảo dưỡng máy CNC định kỳ chuyên nghiệp. Bảo trì CNC theo khuyến cáo nhà sản xuất Fanuc, Siemens, Mitsubishi. Nâng cấp hệ thống điều khiển, thay dầu, vệ sinh máy. Kéo dài tuổi thọ máy, giảm hỏng hóc. Hotline: 0912.258.461",
  keywords: [
    "bảo dưỡng máy cnc",
    "bảo trì cnc định kỳ",
    "bảo dưỡng máy phay cnc",
    "bảo trì máy tiện cnc",
    "nâng cấp cnc",
    "thay dầu máy cnc",
    "vệ sinh máy cnc",
    "NAT Automation bảo dưỡng",
  ],
  alternates: {
    canonical: "https://tailieucnc.xyz/bao-duong",
  },
  openGraph: {
    title: "Bảo Dưỡng Máy CNC Định Kỳ - N.A.T Automation",
    description:
      "Bảo trì CNC chuyên nghiệp theo khuyến cáo nhà sản xuất. Kéo dài tuổi thọ máy cu, giảm hỏng hóc. Hotline: 0912.258.461",
    url: "https://tailieucnc.xyz/bao-duong",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bảo dưỡng máy CNC định kỳ - N.A.T Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bảo Dưỡng Máy CNC Định Kỳ - N.A.T Automation",
    description:
      "Bảo trì CNC định kỳ, nâng cấp hệ thống. Hotline: 0912.258.461",
  },
};

const maintenanceServices = [
  {
    icon: <Settings size={24} className="text-green-500" />,
    title: "Bảo dưỡng định kỳ",
    desc: "Kiểm tra, vệ sinh, bôi trơn toàn bộ hệ thống máy CNC theo chu kỳ khuyến cáo của nhà sản xuất.",
  },
  {
    icon: <Wrench size={24} className="text-orange-500" />,
    title: "Nâng cấp hệ thống",
    desc: "Nâng cấp phần mềm điều khiển, thay thế linh kiện cũ, tối ưu hiệu suất vận hành máy CNC.",
  },
  {
    icon: <Shield size={24} className="text-blue-500" />,
    title: "Bảo hành & Hợp đồng",
    desc: "Ký hợp đồng bảo trì dài hạn với chi phí ưu đãi. Được ưu tiên xử lý khi có sự cố phát sinh.",
  },
];

const checklist = [
  "Kiểm tra và vệ sinh hệ thống làm mát (Coolant)",
  "Thay dầu bôi trơn trục chính (Spindle) và các trục XYZ",
  "Kiểm tra độ rơ thanh trượt, vít me bi",
  "Kiểm tra encoder, cảm biến hành trình",
  "Vệ sinh tủ điện, kiểm tra relay, contactor",
  "Kiểm tra hệ thống thủy lực, khí nén",
  "Cập nhật firmware điều khiển (nếu có)",
  "Test chạy thử và hiệu chỉnh độ chính xác",
];

export default function BaoDuongPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/" aria-label="Quay lại trang chủ">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg uppercase truncate">
          Dịch Vụ Bảo Dưỡng Máy CNC
        </h1>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-800 to-emerald-900 rounded-3xl p-8 md:p-12 text-white mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 text-center">
            <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Bảo trì chuyên nghiệp
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              Bảo Dưỡng CNC Định Kỳ
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Kéo Dài Tuổi Thọ Máy
              </span>
            </h2>
            <p className="text-green-100 text-lg max-w-2xl mx-auto leading-relaxed">
              Chương trình bảo dưỡng máy CNC định kỳ theo tiêu chuẩn nhà sản
              xuất Fanuc, Siemens, Mitsubishi. Giảm 80% rủi ro hỏng hóc bất
              ngờ, tối ưu hiệu suất vận hành.
            </p>
          </div>
        </section>

        {/* Dịch vụ */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {maintenanceServices.map((service, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100 text-center"
            >
              <div className="w-14 h-14 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Checklist bảo dưỡng */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={20} className="text-green-600" />
            <h3 className="text-xl font-bold text-slate-800 uppercase">
              Quy Trình Bảo Dưỡng Tiêu Chuẩn
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-slate-700 p-3 bg-slate-50 rounded-lg"
              >
                <CheckCircle
                  size={18}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-50 rounded-2xl p-8 border border-green-200 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Đăng ký bảo dưỡng định kỳ ngay hôm nay
          </h3>
          <p className="text-slate-500 mb-6">
            Tiết kiệm chi phí sửa chữa, kéo dài tuổi thọ máy. Ưu đãi đặc biệt
            cho hợp đồng bảo trì dài hạn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:0912258461"
              className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Phone size={24} /> 0912.258.461
            </a>
            <a
              href="https://zalo.me/0912258461"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <MessageCircle size={24} /> Chat Zalo
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}