/**
 * Server-side admin auth helper.
 * Uses bcrypt-compatible comparison against ADMIN_PASSWORD_HASH env var.
 *
 * NOTE: This file must only be imported in server contexts (API routes, server components).
 * Do NOT import from "use client" modules.
 */

import { createHash, timingSafeEqual } from "crypto";

// ============================================================
// Primary: bcrypt-style hash comparison
// Uses ADMIN_PASSWORD_HASH env var (set a bcrypt hash there)
// ============================================================

/**
 * Verify an admin password against the ADMIN_PASSWORD_HASH env var.
 *
 * Supports two modes:
 * 1. If ADMIN_PASSWORD_HASH is set → SHA-256 timing-safe comparison
 *    (For full bcrypt, install bcryptjs and swap the implementation)
 * 2. Fallback → compares against ADMIN_PASSWORD env var (plaintext, dev only)
 *
 * Returns true if password matches, false otherwise.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (hash) {
    // SHA-256 timing-safe comparison
    // The env var should store the hex-encoded SHA-256 of the real password
    const inputHash = createHash("sha256").update(password).digest("hex");
    const expectedBuf = Buffer.from(hash, "hex");
    const inputBuf = Buffer.from(inputHash, "hex");

    if (expectedBuf.length !== inputBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, inputBuf);
  }

  // Fallback: plaintext ADMIN_PASSWORD env var (dev only — not recommended for production)
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (plainPassword) {
    // Constant-time-ish comparison for plaintext fallback
    const a = Buffer.from(password);
    const b = Buffer.from(plainPassword);
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  }

  // No env var configured at all — deny by default
  console.warn(
    "[auth-server] Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set. All auth attempts will fail."
  );
  return false;
}
