# N.A.T Automation — Web Platform & CMS Quản Trị Kỹ Thuật CNC

Hệ thống website chính thức của **Công Ty TNHH Tự Động Hóa N.A.T** (`tailieucnc.xyz`). Chuyên gia sửa chữa máy CNC, bảo trì định kỳ, cung cấp linh kiện tự động hóa chính hãng (Fanuc, Siemens, Mitsubishi, Yaskawa) và hệ thống CMS Technical SEO Topic Cluster.

---

## 🛠️ Tech Stack & Kiến Trúc

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) + [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [Lucide React](https://lucide.dev)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL với Row Level Security - RLS)
- **AI Trợ Lý Ảo**: Groq Cloud SDK (`llama-3.3-70b-versatile`) + Fallback sang Google GenAI (`@google/genai` - `gemini-2.5-flash`)
- **Thanh Toán**: VietQR API (MB Bank tự động sinh mã chuyển khoản chuẩn `NAT-XXXXXX`)
- **Triển khai**: [Vercel](https://vercel.com) Edge/NodeJS Runtime

---

## 🔒 Kiến Trúc Bảo Mật & Luồng Dữ Liệu

1. **Supabase RLS (Row Level Security)**:
   - Bảng `orders`: Khóa quyền `SELECT` công khai. Chỉ `authenticated` (Admin) và `service_role` (Server API) mới có quyền đọc thông tin đơn hàng, bảo vệ 100% PII của khách hàng.
   - Bảng `posts`: Cho phép công khai `SELECT` (phục vụ SEO / Googlebot). Các thao tác `INSERT`, `UPDATE`, `DELETE` chỉ dành riêng cho Admin đăng nhập.
2. **Server-side Checkout (`/api/orders`)**:
   - Khách hàng không ghi trực tiếp vào Database. Mọi đơn hàng đều gửi qua API route server-side để xác thực dữ liệu bằng `Zod`.
   - Server tự động tính lại tổng tiền dựa trên giá chuẩn, sinh mã đơn `order_code` (`NAT-XXXXXX`) làm nội dung chuyển khoản bảo mật thay cho việc ghép tên + SĐT.
   - Giới hạn tần suất gọi (Rate Limiting) theo địa chỉ IP chống spam đơn hàng.
3. **Admin Authentication**:
   - Không lưu mật khẩu hoặc logic kiểm tra ở client-side.
   - API `/api/admin/login` xác thực server-side bằng thuật toán so sánh chuỗi hằng số thời gian (`timingSafeEqual`) chống Timing Attacks và cấp HTTP-only Cookie (`admin_session`) an toàn.
4. **Chống XSS**:
   - Toàn bộ dữ liệu động đưa vào JSON-LD Schema được tuần tự hóa an toàn qua hàm `safeJsonLd()`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Yêu cầu hệ thống
- Node.js >= 20.x
- npm >= 10.x

### 2. Cài đặt Dependencies
```bash
git clone https://github.com/sadboiznhatcoder/sadboiznhatcoder.git
cd sadboiznhatcoder
npm ci
```

### 3. Cấu hình Biến Môi Trường
Sao chép file `.env.example` thành `.env.local` và điền các khóa API:
```bash
cp .env.example .env.local
```

### 4. Thiết lập Cơ sở dữ liệu Supabase
Truy cập **Supabase Dashboard** -> **SQL Editor** và chạy theo thứ tự:
1. `supabase-schema.sql` (Tạo cấu trúc bảng `posts` chuẩn SEO).
2. `orders-schema.sql` (Tạo bảng `orders` với RLS bảo mật).
3. `supabase-migration-001-security.sql` (Chạy migration cập nhật bảo mật nếu DB đã có dữ liệu từ trước).

### 5. Chạy môi trường Development
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 🧪 Các Lệnh Kiểm Tra Chất Lượng Code

```bash
# Kiểm tra định dạng và quy chuẩn ESLint
npm run lint

# Kiểm tra kiểu dữ liệu TypeScript (Strict Typecheck)
npm run typecheck

# Build thử nghiệm môi trường Production
npm run build
```

---

## 🌐 Cấu Hình Biến Môi Trường Trên Vercel

Vào mục **Project Settings -> Environment Variables** trên Vercel và cấu hình các biến sau:

| Tên biến | Bắt buộc | Mô tả |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Có | URL project Supabase (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Public Anon Key của Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Có | Service Role Key (Chỉ dùng server-side để quản lý đơn) |
| `GROQ_API_KEY` | Khuyên dùng | API Key của Groq Cloud để chạy trợ lý kỹ thuật AI |
| `GROQ_MODEL` | Không | Mặc định: `llama-3.3-70b-versatile` |
| `GEMINI_API_KEY` | Khuyên dùng | API Key của Google AI Studio (Dùng làm cơ chế Fallback tự động) |
| `GEMINI_MODEL` | Không | Mặc định: `gemini-2.5-flash` |
| `ADMIN_USERNAME` | Không | Tên tài khoản quản trị (Mặc định: `admin`) |
| `ADMIN_PASSWORD` | Có | Mật khẩu truy cập trang quản trị `/admin` |
| `ADMIN_SESSION_SECRET` | Khuyên dùng | Chuỗi ngẫu nhiên tối thiểu 32 ký tự để mã hóa session cookie |

---

## 📞 Liên Hệ & Hỗ Trợ Kỹ Thuật

- **Công Ty TNHH Tự Động Hóa N.A.T**
- **Trụ sở**: 74 Đại Hưng, Lạc Thị, Ngọc Hồi, Thanh Trì, Hà Nội
- **Chi nhánh phục vụ**: Hà Nội, TP.HCM, Tây Ninh, Bình Dương, Đồng Nai, Long An
- **Hotline Kỹ thuật 24/7**: 0912.258.461
- **Website**: [tailieucnc.xyz](https://tailieucnc.xyz)
