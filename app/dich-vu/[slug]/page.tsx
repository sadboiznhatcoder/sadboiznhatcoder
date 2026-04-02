import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { notFound } from "next/navigation";

// === CẤU HÌNH CÁC KHU VỰC DỊCH VỤ (LOCAL SEO) ===
const serviceAreas: Record<
  string,
  { name: string; fullName: string; description: string; phone: string }
> = {
  "sua-may-cnc-tay-ninh": {
    name: "Tây Ninh",
    fullName: "Sửa máy CNC tại Tây Ninh",
    description:
      "Dịch vụ sửa chữa máy CNC chuyên nghiệp tại Tây Ninh. Đội ngũ kỹ thuật N.A.T có mặt trong vòng 24h, sửa lỗi Fanuc, Siemens, Mitsubishi. Thay thế linh kiện servo, driver, spindle chính hãng. Bảo hành dài hạn.",
    phone: "0912258461",
  },
  "sua-may-cnc-tphcm": {
    name: "TP.HCM",
    fullName: "Sửa máy CNC tại TP. Hồ Chí Minh",
    description:
      "Sửa chữa máy CNC tại TPHCM - Đội ngũ kỹ sư N.A.T Automation chuyên xử lý lỗi máy Phay, Tiện, Cắt dây CNC. Fanuc, Siemens, Mitsubishi. Có mặt nhanh chóng tại các khu công nghiệp.",
    phone: "0912258461",
  },
  "sua-may-cnc-binh-duong": {
    name: "Bình Dương",
    fullName: "Sửa máy CNC tại Bình Dương",
    description:
      "Dịch vụ sửa chữa máy CNC tại Bình Dương. N.A.T Automation hỗ trợ kỹ thuật 24/7 cho các nhà máy, xưởng cơ khí tại khu công nghiệp Bình Dương. Sửa servo, driver, spindle CNC.",
    phone: "0912258461",
  },
  "sua-may-cnc-dong-nai": {
    name: "Đồng Nai",
    fullName: "Sửa máy CNC tại Đồng Nai",
    description:
      "Sửa chữa máy CNC tại Đồng Nai - N.A.T Automation sửa lỗi máy Phay CNC, Tiện CNC, sửa trục X/Y/Z, thay servo, driver, spindle. Có mặt tại các KCN Biên Hòa, Long Thành, Nhơn Trạch.",
    phone: "0912258461",
  },
  "sua-may-cnc-ha-noi": {
    name: "Hà Nội",
    fullName: "Sửa máy CNC tại Hà Nội",
    description:
      "Trụ sở chính N.A.T Automation tại Hà Nội - Chuyên sửa chữa máy CNC, bảo trì định kỳ, cung cấp linh kiện Fanuc, Siemens, Mitsubishi chính hãng. Hotline: 0912.258.461",
    phone: "0912258461",
  },
  "sua-may-cnc-long-an": {
    name: "Long An",
    fullName: "Sửa máy CNC tại Long An",
    description:
      "Dịch vụ sửa chữa máy CNC tại Long An. Xử lý lỗi servo, driver, spindle, trục X/Y/Z. Kỹ thuật viên N.A.T có mặt trong 24h. Bảo hành sau sửa chữa.",
    phone: "0912258461",
  },
};

// === GENERATE STATIC PARAMS (Pre-render tất cả trang local SEO) ===
export async function generateStaticParams() {
  return Object.keys(serviceAreas).map((slug) => ({ slug }));
}

// === GENERATE METADATA ĐỘNG CHO LOCAL SEO ===
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = serviceAreas[slug];

  if (!area) {
    return {
      title: "Dịch vụ không tìm thấy",
      description: "Trang dịch vụ bạn tìm không tồn tại.",
    };
  }

  return {
    title: `${area.fullName} | Sửa chữa CNC chuyên nghiệp 24/7`,
    description: area.description,
    keywords: [
      `sửa máy cnc ${area.name}`,
      `sửa chữa cnc ${area.name}`,
      `bảo trì cnc ${area.name}`,
      "sửa servo cnc",
      "sửa lỗi Fanuc",
      "sửa lỗi Siemens",
      "N.A.T Automation",
    ],
    alternates: {
      canonical: `https://tailieucnc.xyz/dich-vu/${slug}`,
    },
    openGraph: {
      title: `${area.fullName} - N.A.T Automation`,
      description: area.description,
      url: `https://tailieucnc.xyz/dich-vu/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: area.fullName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: area.fullName,
      description: area.description,
    },
  };
}

// === JSON-LD LOCAL BUSINESS SCHEMA CHO KHU VỰC ===
function LocalServiceSchema({
  area,
  slug,
}: {
  area: (typeof serviceAreas)[string];
  slug: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: area.fullName,
    description: area.description,
    provider: {
      "@type": "LocalBusiness",
      name: "Công Ty TNHH Tự Động Hóa N.A.T",
      telephone: "+84912258461",
      url: "https://tailieucnc.xyz",
    },
    areaServed: {
      "@type": "City",
      name: area.name,
    },
    url: `https://tailieucnc.xyz/dich-vu/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function DichVuLocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = serviceAreas[slug];

  if (!area) {
    notFound();
  }

  const services = [
    "Sửa lỗi hệ điều khiển Fanuc, Siemens, Mitsubishi",
    "Thay thế servo, driver, spindle CNC chính hãng",
    "Xử lý lỗi trục X, Y, Z - máy CNC mất trục",
    "Sửa lỗi Spindle Alarm, Servo Overload",
    "Bảo dưỡng máy CNC định kỳ theo khuyến cáo nhà sản xuất",
    "Nâng cấp hệ thống điện, PLC, biến tần",
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <LocalServiceSchema area={area} slug={slug} />

      {/* Header */}
      <header className="bg-orange-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <Link href="/" aria-label="Quay lại trang chủ">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg uppercase truncate">
          {area.fullName}
        </h1>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Hero */}
        <section className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                Khu vực {area.name}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              Dịch Vụ Sửa Chữa
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Máy CNC tại {area.name}
              </span>
            </h2>
            <p className="text-sky-100 text-lg leading-relaxed max-w-2xl">
              {area.description}
            </p>
          </div>
        </section>

        {/* Danh sách dịch vụ */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-10">
          <h3 className="text-xl font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <Wrench size={20} className="text-orange-500" />
            Dịch vụ tại {area.name}
          </h3>
          <div className="space-y-4">
            {services.map((service, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-700">
                <CheckCircle
                  size={20}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-orange-50 rounded-2xl p-8 border border-orange-200 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Liên hệ ngay để được tư vấn miễn phí
          </h3>
          <p className="text-slate-500 mb-6">
            Kỹ thuật viên N.A.T sẵn sàng có mặt tại {area.name} trong 24h
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`tel:${area.phone}`}
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-orange-700 transition flex items-center gap-2"
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

        {/* Khu vực khác */}
        <section className="mt-12">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Dịch vụ tại các khu vực khác
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(serviceAreas)
              .filter(([key]) => key !== slug)
              .map(([key, value]) => (
                <Link
                  key={key}
                  href={`/dich-vu/${key}`}
                  className="bg-white p-4 rounded-xl border border-slate-100 hover:border-sky-500 hover:shadow-md transition text-center group"
                >
                  <MapPin
                    size={16}
                    className="mx-auto mb-1 text-slate-400 group-hover:text-sky-500 transition"
                  />
                  <span className="font-bold text-slate-700 text-sm group-hover:text-sky-700 transition">
                    {value.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
