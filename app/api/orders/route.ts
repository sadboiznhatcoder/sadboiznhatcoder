export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ============================================================
// Server-only Supabase client (service_role bypasses RLS)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or Supabase API key");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ============================================================
// Zod validation schema
// ============================================================

const VN_PHONE_REGEX = /^(0[35789])[0-9]{8}$/;

const orderItemSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
});

const orderSchema = z.object({
  customerName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  phone: z
    .string()
    .regex(VN_PHONE_REGEX, "Số điện thoại không hợp lệ (VD: 0912258461)"),
  email: z.string().email("Email không hợp lệ"),
  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  companyName: z.string().optional(),
  taxCode: z.string().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Giỏ hàng không được trống"),
});

// ============================================================
// Rate limiter — in-memory, per IP, 5 req/min
// ============================================================

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  // Prune expired entries
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (valid.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, valid);
    return true;
  }
  valid.push(now);
  rateLimitMap.set(ip, valid);
  return false;
}

// Periodic cleanup so the map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}, 60_000).unref?.();

// ============================================================
// Generate unique order code: NAT-XXXXXX
// ============================================================

function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "NAT-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================================
// POST /api/orders
// ============================================================

export async function POST(request: Request) {
  try {
    // 1. Rate limit by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    // 2. Parse & validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Dữ liệu gửi lên không hợp lệ." },
        { status: 400 }
      );
    }

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message ?? "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const { customerName, phone, email, address, companyName, taxCode, items } = parsed.data;

    // 3. Server recalculates total — ignores any client-sent total
    const totalAmount = Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Tổng tiền đơn hàng phải lớn hơn 0." },
        { status: 400 }
      );
    }

    // 4. Generate unique order code
    const orderCode = generateOrderCode();

    // 5. Insert into DB with service role client
    const supabase = getServiceClient();
    const { error: dbError } = await supabase.from("orders").insert([
      {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        company_name: companyName?.trim() || null,
        tax_code: taxCode?.trim() || null,
        total_amount: totalAmount,
        transfer_content: orderCode,
        order_code: orderCode,
        status: "pending",
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      },
    ]);

    if (dbError) {
      console.error("[API /api/orders] Supabase insert error:", dbError.message);
      return NextResponse.json(
        { success: false, error: "Lỗi hệ thống khi lưu đơn hàng. Vui lòng thử lại." },
        { status: 500 }
      );
    }

    // 6. Success
    return NextResponse.json(
      { success: true, orderCode, totalAmount },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API /api/orders] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
