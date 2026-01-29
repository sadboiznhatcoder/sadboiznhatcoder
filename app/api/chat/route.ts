import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ text: "Lỗi: Server chưa có Groq API Key." });
    }

    const groq = new Groq({ apiKey: apiKey });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Bạn là Trợ lý ảo N.A.T CNC. 
          Trả lời ngắn gọn, thân thiện, xưng "Em". 
          Hotline: 0912.258.461. 
          Khuyên khách gọi hotline nếu hỏi lỗi khó.`
        },
        { role: "user", content: message }
      ],
      // === ĐÃ ĐỔI SANG MODEL MỚI NHẤT (CHẠY 100%) ===
      model: "llama-3.3-70b-versatile", 
      // ==============================================
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = chatCompletion.choices[0]?.message?.content || "AI không trả lời được.";

    return NextResponse.json({ text: response });

  } catch (error: any) {
    console.error("Lỗi:", error);
    return NextResponse.json({ 
      text: "Xin lỗi, hệ thống đang bận. Anh/chị gọi 0912.258.461 giúp em nhé!"
    });
  }
}