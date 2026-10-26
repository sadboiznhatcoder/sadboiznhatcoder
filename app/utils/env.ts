import { z } from "zod";

/**
 * Server & Client environment schema definition.
 * Uses Zod for strict validation with descriptive fallback messages.
 * Does NOT crash the build process if third-party AI keys are missing.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL phải là một URL hợp lệ").optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY").optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  ADMIN_USERNAME: z.string().default("admin"),
  ADMIN_PASSWORD: z.string().default("66771508"),
  ADMIN_SESSION_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export function getValidatedEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn(
      "[Environment Warning]: Cấu hình biến môi trường chưa hoàn chỉnh:",
      result.error.flatten().fieldErrors
    );
    // Trả về dữ liệu parse một phần hoặc fallback để không làm crash build
    cachedEnv = envSchema.parse({
      ...process.env,
      GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "66771508",
    });
    return cachedEnv;
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Lấy một biến môi trường cụ thể, an toàn ở runtime, không gây crash build.
 */
export function getEnv(name: string): string | undefined {
  const val = process.env[name];
  if (!val || val.trim() === "") return undefined;
  return val.trim();
}

/**
 * Yêu cầu biến môi trường phải tồn tại lúc chạy (chỉ gọi trong server API handler khi cần dùng).
 */
export function requireEnv(name: string): string {
  const val = getEnv(name);
  if (!val) {
    throw new Error(`[Missing Env]: Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return val;
}
