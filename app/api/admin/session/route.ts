export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "nat-automation-default-session-secret-key-32chars";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }

  const [timestamp, signature] = sessionCookie.split(".");
  if (!timestamp || !signature) {
    return NextResponse.json({ authenticated: false });
  }

  // Check expiration: 24h
  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age < 0 || age > 86400 * 1000) {
    return NextResponse.json({ authenticated: false });
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`admin:${timestamp}`)
    .digest("hex");

  const valid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  return NextResponse.json({ authenticated: valid });
}
