// Safe env getter — validates at runtime, does NOT crash build
// Usage: const key = getEnv("GROQ_API_KEY") — returns string | undefined
export function getEnv(name: string): string | undefined {
  const val = process.env[name];
  if (!val || val.trim() === "") return undefined;
  return val.trim();
}

export function requireEnv(name: string): string {
  const val = getEnv(name);
  if (!val) throw new Error(`Missing required env: ${name}`);
  return val;
}
