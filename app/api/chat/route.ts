import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "../../utils/env";
import { supabase } from "../../utils/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Rate limiter – simple in-memory sliding window (per IP, 20 req / 60 s)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateBuckets.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

// ---------------------------------------------------------------------------
// Input validation schema
// ---------------------------------------------------------------------------
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const ChatBodySchema = z.object({
  message: z.string().min(1).max(1000),
  messages: z.array(ChatMessageSchema).max(20).optional(),
});

// ---------------------------------------------------------------------------
// Error classification → Vietnamese user-friendly messages
// ---------------------------------------------------------------------------
function classifyError(err: unknown): { status: number; text: string } {
  const status =
    err instanceof Object && "status" in err
      ? (err as { status: number }).status
      : 500;

  if (status === 401 || status === 403) {
    return {
      status,
      text: "Lỗi xác thực API. Vui lòng báo Admin kiểm tra API Key trên Vercel.",
    };
  }
  if (status === 429) {
    return {
      status: 429,
      text: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.",
    };
  }
  if (status === 504 || (err instanceof DOMException && err.name === "AbortError")) {
    return {
      status: 504,
      text: "Hệ thống phản hồi chậm. Vui lòng thử lại.",
    };
  }
  return {
    status: 500,
    text: "Hệ thống đang bảo trì. Gọi hotline 0912.258.461 để được hỗ trợ ngay!",
  };
}

// ---------------------------------------------------------------------------
// RAG: fetch inventory + services context from Supabase
// ---------------------------------------------------------------------------
async function buildInventoryContext(): Promise<string> {
  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase
      .from("products")
      .select("name, price, quantity, category, description"),
    supabase.from("posts").select("title, content"),
  ]);

  let ctx = "=== DỮ LIỆU KHO HÀNG THỰC TẾ (N.A.T AUTOMATION) ===\n";

  if (products && products.length > 0) {
    products.forEach(
      (p: { name: string; category: string; price: string | null; quantity: number; description: string }) => {
        ctx += `- Sản phẩm: ${p.name} | Loại: ${p.category} | Giá: ${p.price || "Liên hệ"} | Tồn kho: ${p.quantity} | Mô tả: ${p.description}\n`;
      },
    );
  } else {
    ctx += "(Kho hàng online đang cập nhật)\n";
  }

  if (posts && posts.length > 0) {
    ctx += "\n=== DỊCH VỤ CÔNG TY ===\n";
    posts.forEach((p: { title: string; content: string }) => {
      ctx += `- ${p.title}: ${p.content}\n`;
    });
  }

  return ctx;
}

// ---------------------------------------------------------------------------
// System prompt (Vietnamese)
// ---------------------------------------------------------------------------
function buildSystemPrompt(inventoryContext: string): string {
  return `
    BẠN LÀ TRỢ LÝ ẢO KỸ THUẬT & BÁN HÀNG CỦA CÔNG TY TỰ ĐỘNG HÓA N.A.T.
    Địa chỉ: Tây Ninh. Hotline: 0912.258.461.

    NHIỆM VỤ:
    1. KIỂM TRA KHO: Dựa vào danh sách "DỮ LIỆU KHO HÀNG" bên dưới để trả lời xem có hàng không, giá bao nhiêu.
    2. TƯ VẤN KỸ THUẬT: Hỗ trợ lỗi máy CNC, biến tần, servo bằng kiến thức chuyên gia của bạn.

    DỮ LIỆU KHO HÀNG & DỊCH VỤ:
    ${inventoryContext}

    QUY TẮC TRẢ LỜI:
    - Nếu khách hỏi mua sản phẩm CÓ trong danh sách: Báo tên, giá và số lượng còn lại.
    - Nếu khách hỏi sản phẩm KHÔNG CÓ: Xin lỗi và bảo khách gọi hotline 0912.258.461 để đặt.
    - Nếu hỏi lỗi kỹ thuật khó: Tư vấn sơ bộ rồi khuyên gọi hotline để kỹ thuật viên hỗ trợ.
    - Xưng hô: "Em" - "Anh/Chị". Thân thiện, ngắn gọn, chuyên nghiệp.
    `;
}

// ---------------------------------------------------------------------------
// Provider calls (Groq primary, Gemini fallback)
// ---------------------------------------------------------------------------
type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

async function callGroq(
  allMessages: ChatMsg[],
  apiKey: string,
  model: string,
  signal: AbortSignal,
): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create(
    {
      messages: allMessages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
      model,
      temperature: 0.6,
      max_tokens: 500,
    },
    { signal },
  );

  return (
    completion.choices[0]?.message?.content ||
    "Dạ, hiện em chưa tìm thấy thông tin. Anh/chị gọi hotline 0912.258.461 giúp em nhé!"
  );
}

async function callGemini(
  allMessages: ChatMsg[],
  apiKey: string,
  model: string,
  signal: AbortSignal,
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  // Extract system prompt and conversation messages
  const systemInstruction = allMessages.find((m) => m.role === "system")?.content ?? "";
  const conversationMessages = allMessages.filter((m) => m.role !== "system");

  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 500,
    },
  });

  // Build Gemini-format history + current message
  const history = conversationMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }],
  }));

  const lastMsg = conversationMessages[conversationMessages.length - 1];
  const chat = generativeModel.startChat({ history });

  const result = await chat.sendMessage(
    [{ text: lastMsg?.content ?? "" }],
    { signal } as Parameters<typeof chat.sendMessage>[1],
  );
  const response = result.response;
  return (
    response.text() ||
    "Dạ, hiện em chưa tìm thấy thông tin. Anh/chị gọi hotline 0912.258.461 giúp em nhé!"
  );
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    // --- Rate limit ---
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { text: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.", error: true },
        { status: 429 },
      );
    }

    // --- Parse + validate body ---
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { text: "Dạ anh/chị cần em hỗ trợ gì ạ?", error: true },
        { status: 400 },
      );
    }

    const parsed = ChatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { text: "Dạ anh/chị cần em hỗ trợ gì ạ?", error: true },
        { status: 400 },
      );
    }

    const { message, messages: historyRaw } = parsed.data;

    // Take last 10 items from history
    const history = (historyRaw ?? []).slice(-10);

    // --- Check for at least one API key ---
    const groqKey = getEnv("GROQ_API_KEY");
    const geminiKey = getEnv("GEMINI_API_KEY");

    if (!groqKey && !geminiKey) {
      return NextResponse.json({
        text: "Trợ lý AI đang được cấu hình. Trong thời gian chờ, vui lòng gọi Hotline 0912.258.461 để được tư vấn trực tiếp!",
        error: true,
      });
    }

    // --- RAG context ---
    const inventoryContext = await buildInventoryContext();
    const systemPrompt = buildSystemPrompt(inventoryContext);

    // Build the full message array for providers
    const allMessages: ChatMsg[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // --- Try primary (Groq), then fallback (Gemini) ---
    const groqModel = getEnv("GROQ_MODEL") ?? "llama-3.3-70b-versatile";
    const geminiModel = getEnv("GEMINI_MODEL") ?? "gemini-2.0-flash";

    let lastError: unknown = null;

    // Primary: Groq
    if (groqKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        const reply = await callGroq(allMessages, groqKey, groqModel, controller.signal);
        clearTimeout(timeout);
        return NextResponse.json({ text: reply });
      } catch (err) {
        lastError = err;
        console.error("Groq failed, trying fallback:", err);
      }
    }

    // Fallback: Gemini
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        const reply = await callGemini(allMessages, geminiKey, geminiModel, controller.signal);
        clearTimeout(timeout);
        return NextResponse.json({ text: reply });
      } catch (err) {
        lastError = err;
        console.error("Gemini fallback also failed:", err);
      }
    }

    // Both providers failed
    const classified = classifyError(lastError);
    return NextResponse.json(
      { text: classified.text, error: true },
      { status: classified.status },
    );
  } catch (error: unknown) {
    console.error("Lỗi Chat API:", error);
    return NextResponse.json({
      text: "Hệ thống đang bảo trì. Gọi hotline 0912.258.461 để được hỗ trợ ngay!",
      error: true,
    });
  }
}
