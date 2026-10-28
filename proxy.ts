/**
 * proxy.ts — N.A.T Automation Security Gate
 *
 * Chốt chặn bảo mật tại tầng Proxy/Edge (trước khi render bất kỳ trang nào).
 * Kiến trúc: Custom HMAC session (không dùng Supabase Auth JWT).
 *
 * Next.js 16+: file này thay thế middleware.ts (đổi tên theo convention mới).
 *
 * Sử dụng Web Crypto API (SubtleCrypto) thay cho Node.js `crypto`
 * vì Proxy chạy trong Edge Runtime (không có Node.js built-ins).
 *
 * Luồng kiểm tra:
 *   /admin/dashboard → phải có cookie `admin_session` HMAC hợp lệ.
 *   /admin           → trang đăng nhập, luôn public.
 *   /mua-ban, /linh-kien → public, kiểm tra admin role qua /api/admin/session từ client.
 */

import { NextResponse, type NextRequest } from "next/server";

// ─── Hằng số ──────────────────────────────────────────────────────────────────
const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 86_400 * 1_000; // 24h

// ─── Helpers Web Crypto ────────────────────────────────────────────────────────

/** Import HMAC key từ secret string, dùng SubtleCrypto (Edge-compatible) */
async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Tạo HMAC-SHA256 hex string từ data và secret */
async function hmacHex(data: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** So sánh hai hex string theo constant-time (tránh timing attack) */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Lấy SESSION_SECRET từ biến môi trường */
function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "nat-automation-default-session-secret-key-32chars"
  );
}

/**
 * Xác minh session token.
 * Token format: `<timestamp>.<hmac_sha256_hex>`
 */
async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const timestamp = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!timestamp || !signature) return false;

  // Kiểm tra hết hạn 24h
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;
  const age = Date.now() - ts;
  if (age < 0 || age > SESSION_MAX_AGE_MS) return false;

  // Xác minh chữ ký HMAC
  try {
    const expected = await hmacHex(`admin:${timestamp}`, getSecret());
    return constantTimeEqual(signature, expected);
  } catch {
    return false;
  }
}

// ─── Middleware chính ──────────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bảo vệ /admin/* (dashboard, v.v.), nhưng cho phép GET /admin (trang login)
  const isProtectedAdmin =
    pathname.startsWith("/admin/") && pathname !== "/admin";

  if (isProtectedAdmin) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    const isValid = await verifySession(sessionToken);

    if (!isValid) {
      const loginUrl = new URL("/admin", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      // Xóa cookie cũ không hợp lệ
      redirectResponse.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return redirectResponse;
    }
  }

  return NextResponse.next();
}

// ─── Cấu hình matcher ─────────────────────────────────────────────────────────
export const config = {
  matcher: [
    // Chỉ áp dụng cho /admin và các trang con (bỏ qua static files, API, ảnh)
    "/admin/:path*",
  ],
};
