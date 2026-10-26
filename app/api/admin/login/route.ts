export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "nat-automation-default-session-secret-key-32chars";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "66771508";

    // Constant-time comparison to prevent timing attacks
    const usernameMatch =
      typeof username === "string" &&
      username.length === expectedUsername.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(expectedUsername));

    const passwordMatch =
      typeof password === "string" &&
      password.length === expectedPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));

    if (!usernameMatch || !passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" },
        { status: 401 }
      );
    }

    // Generate signed session token: timestamp.signature
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`admin:${timestamp}`)
      .digest("hex");
    const token = `${timestamp}.${signature}`;

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Login Error]:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi đăng nhập" },
      { status: 500 }
    );
  }
}
