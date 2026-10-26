export const runtime = "nodejs";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "../../utils/env";
import { supabase } from "../../utils/supabase";

// ---------------------------------------------------------------------------
// Rate Limiter – In-Memory Sliding Window per IP (20 req / 60s)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateBuckets.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

// ---------------------------------------------------------------------------
// Zod Input Validation
// ---------------------------------------------------------------------------
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const ChatBodySchema = z.object({
  message: z.string().min(1, "Tin nhắn không được để trống").max(1000, "Tin nhắn quá dài (tối đa 1000 ký tự)"),
  messages: z.array(ChatMessageSchema).max(20).optional(),
});

// ---------------------------------------------------------------------------
// Error Classification for Vietnamese User-Friendly Messages
// ---------------------------------------------------------------------------
function classifyError(err: unknown): { status: number; text: string } {
  const status =
    err instanceof Object && "status" in err
      ? Number((err as { status: unknown }).status)
      : 500;

  const message = String((err as { message?: string })?.message || "").toLowerCase();

  if (status === 401 || status === 403 || message.includes("api key") || message.includes("unauthorized")) {
    return {
      status: 401,
      text: "Lỗi xác thực API. Vui lòng báo Admin kiểm tra API Key trên Vercel.",
    };
  }

  if (status === 404 || message.includes("not found") || message.includes("model")) {
    return {
      status: 404,
      text: "Model AI không khả dụng hoặc cấu hình sai. Vui lòng liên hệ Admin.",
    };
  }

  if (status === 429 || message.includes("rate limit") || message.includes("quota")) {
    return {
      status: 429,
      text: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút hoặc liên hệ hotline 0912.258.461.",
    };
  }

  if (
    status === 504 ||
    (err instanceof DOMException && err.name === "AbortError") ||
    message.includes("timeout") ||
    message.includes("abort")
  ) {
    return {
      status: 504,
      text: "Hệ thống phản hồi chậm do quá thời gian chờ (15s). Vui lòng thử lại.",
    };
  }

  return {
    status: 500,
    text: "Hệ thống đang bảo trì. Vui lòng gọi hotline 0912.258.461 để được hỗ trợ kỹ thuật ngay!",
  };
}

// ---------------------------------------------------------------------------
// RAG Context from Supabase
// ---------------------------------------------------------------------------
async function buildInventoryContext(): Promise<string> {
  try {
    const [{ data: products }, { data: posts }] = await Promise.all([
      supabase.from("products").select("name, price, quantity, category, description"),
      supabase.from("posts").select("title, content"),
    ]);

    let ctx = "=== DỮ LIỆU KHO HÀNG THỰC TẾ (N.A.T AUTOMATION) ===\n";

    if (products && products.length > 0) {
      products.forEach((p) => {
        ctx += `- Sản phẩm: ${p.name} | Loại: ${p.category} | Giá: ${p.price || "Liên hệ"} | Tồn kho: ${p.quantity} | Mô tả: ${p.description}\n`;
      });
    } else {
      ctx += "(Kho hàng online đang cập nhật)\n";
    }

    if (posts && posts.length > 0) {
      ctx += "\n=== DỊCH VỤ CÔNG TY ===\n";
      posts.forEach((p) => {
        ctx += `- ${p.title}: ${p.content}\n`;
      });
    }

    return ctx;
  } catch (error) {
    console.warn("[RAG Context Error]:", error);
    return "(Đang cập nhật danh mục kho hàng)";
  }
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------
function buildSystemPrompt(inventoryContext: string): string {
  return `
BẠN LÀ TRỢ LÝ ẢO KỸ THUẬT & BÁN HÀNG CỦA CÔNG TY TỰ ĐỘNG HÓA N.A.T.
Trụ sở: Hà Nội & các chi nhánh tại TP.HCM, Tây Ninh, Bình Dương. Hotline 24/7: 0912.258.461.

NHIỆM VỤ:
1. KIỂM TRA KHO: Dựa vào danh sách "DỮ LIỆU KHO HÀNG" bên dưới để trả lời xem có hàng không, giá bao nhiêu.
2. TƯ VẤN KỸ THUẬT: Hỗ trợ lỗi máy CNC, biến tần, servo, spindle, driver bằng kiến thức chuyên gia thực chiến.

DỮ LIỆU KHO HÀNG & DỊCH VỤ:
${inventoryContext}

QUY TẮC TRẢ LỜI:
- Nếu khách hỏi mua sản phẩm CÓ trong danh sách: Báo tên, giá và số lượng còn lại.
- Nếu khách hỏi sản phẩm KHÔNG CÓ: Lịch sự thông báo và khuyên khách gọi hotline 0912.258.461 để đặt linh kiện nhanh.
- Nếu hỏi lỗi kỹ thuật phức tạp: Tư vấn sơ bộ giải pháp an toàn rồi khuyên gọi hotline để kỹ thuật viên hỗ trợ tận nơi.
- Xưng hô: "Em" - "Anh/Chị". Thân thiện, ngắn gọn, chuyên nghiệp, không dài dòng.
`;
}

// ---------------------------------------------------------------------------
// Provider Handlers: Groq & Google GenAI (@google/genai)
// ---------------------------------------------------------------------------
type StandardMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGroq(
  messages: StandardMessage[],
  apiKey: string,
  model: string,
  signal: AbortSignal
): Promise<string> {
  const GroqModule = (await import("groq-sdk")).default;
  const groq = new GroqModule({ apiKey });

  const completion = await groq.chat.completions.create(
    {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.6,
      max_tokens: 500,
    },
    { signal }
  );

  return (
    completion.choices[0]?.message?.content ||
    "Dạ, em chưa nhận diện được thông tin. Anh/chị gọi hotline 0912.258.461 giúp em nhé!"
  );
}

async function callGemini(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  latestUserMessage: string,
  apiKey: string,
  model: string,
  signal: AbortSignal
): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  // Convert standard messages to Gemini contents format
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: latestUserMessage }],
    },
  ];

  // Call generateContent with abort signal if supported by fetch underneath
  const responsePromise = ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.6,
      maxOutputTokens: 500,
    },
  });

  // Handle abort signal timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    signal.addEventListener("abort", () => {
      reject(new DOMException("Gemini request timed out after 15s", "AbortError"));
    });
  });

  const response = await Promise.race([responsePromise, timeoutPromise]);
  return (
    response.text ||
    "Dạ, hiện em chưa tìm thấy thông tin phù hợp. Anh/chị gọi hotline 0912.258.461 để được hỗ trợ trực tiếp ạ!"
  );
}

// ---------------------------------------------------------------------------
// POST Handler with Failover
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    // 1. Rate Limit
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { text: "Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.", error: true },
        { status: 429 }
      );
    }

    // 2. Parse & Validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { text: "Dạ anh/chị cần em hỗ trợ gì ạ?", error: true },
        { status: 400 }
      );
    }

    const parsed = ChatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { text: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ", error: true },
        { status: 400 }
      );
    }

    const { message, messages: historyRaw } = parsed.data;
    const history = (historyRaw ?? []).slice(-10);

    // 3. Check API keys
    const groqKey = getEnv("GROQ_API_KEY");
    const geminiKey = getEnv("GEMINI_API_KEY");

    if (!groqKey && !geminiKey) {
      return NextResponse.json({
        text: "Trợ lý AI đang được cấu hình. Trong thời gian chờ, vui lòng gọi Hotline 0912.258.461 để được tư vấn trực tiếp!",
        error: true,
      });
    }

    // 4. Build RAG context
    const inventoryContext = await buildInventoryContext();
    const systemPrompt = buildSystemPrompt(inventoryContext);

    const groqModel = getEnv("GROQ_MODEL") || "llama-3.3-70b-versatile";
    const geminiModel = getEnv("GEMINI_MODEL") || "gemini-2.5-flash";

    let lastError: unknown = null;

    // 5. Primary Provider: Groq
    if (groqKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);

        const standardMessages: StandardMessage[] = [
          { role: "system", content: systemPrompt },
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: message },
        ];

        const reply = await callGroq(standardMessages, groqKey, groqModel, controller.signal);
        clearTimeout(timeout);
        return NextResponse.json({ text: reply });
      } catch (err) {
        lastError = err;
        console.warn("[Chatbot] Groq provider failed, falling back to Gemini:", err);
      }
    }

    // 6. Fallback Provider: Google GenAI (@google/genai)
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);

        const reply = await callGemini(
          systemPrompt,
          history,
          message,
          geminiKey,
          geminiModel,
          controller.signal
        );
        clearTimeout(timeout);
        return NextResponse.json({ text: reply });
      } catch (err) {
        lastError = err;
        console.error("[Chatbot] Gemini provider also failed:", err);
      }
    }

    // 7. Both Providers Failed
    const classified = classifyError(lastError);
    return NextResponse.json(
      { text: classified.text, error: true },
      { status: classified.status }
    );
  } catch (error: unknown) {
    console.error("[Chatbot API Unexpected Error]:", error);
    return NextResponse.json({
      text: "Hệ thống đang bảo trì. Vui lòng gọi trực tiếp hotline 0912.258.461 để được hỗ trợ!",
      error: true,
    });
  }
}
