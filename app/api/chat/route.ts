import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { supabase } from "../../utils/supabase";

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra API Key (Đã nhập trên Vercel)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ LỖI: Chưa có GROQ_API_KEY");
      return NextResponse.json({ text: "Lỗi Server: Vui lòng báo Admin kiểm tra API Key." }, { status: 500 });
    }

    // 2. Nhận tin nhắn từ Frontend
    const body = await req.json();
    // Xử lý linh hoạt: nhận cả mảng 'messages' (lịch sử chat) hoặc 'message' (tin nhắn lẻ)
    const messages = body.messages || (body.message ? [{ role: "user", content: body.message }] : []);
    
    if (messages.length === 0) {
        return NextResponse.json({ text: "Dạ anh/chị cần em hỗ trợ gì ạ?" });
    }

    // 3. --- RAG: LẤY DỮ LIỆU TỒN KHO TỪ SUPABASE ---
    // (Bước này giúp AI biết shop đang còn hàng gì, giá bao nhiêu)
    const { data: products } = await supabase
      .from('products')
      .select('name, price, quantity, category, description');

    const { data: posts } = await supabase
      .from('posts')
      .select('title, content');

    // Tạo văn bản "Ghi chú kho hàng" để nhồi vào não AI
    let inventoryContext = "=== DỮ LIỆU KHO HÀNG THỰC TẾ (N.A.T AUTOMATION) ===\n";
    
    if (products && products.length > 0) {
        products.forEach(p => {
            inventoryContext += `- Sản phẩm: ${p.name} | Loại: ${p.category} | Giá: ${p.price || 'Liên hệ'} | Tồn kho: ${p.quantity} | Mô tả: ${p.description}\n`;
        });
    } else {
        inventoryContext += "(Kho hàng online đang cập nhật)\n";
    }
    
    if (posts && posts.length > 0) {
         inventoryContext += "\n=== DỊCH VỤ CÔNG TY ===\n";
         posts.forEach(p => inventoryContext += `- ${p.title}: ${p.content}\n`);
    }

    // 4. Kết nối Groq
    const groq = new Groq({ apiKey: apiKey });

    // 5. Cấu hình "Tính cách" và "Kiến thức" cho AI
    const systemPrompt = `
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

    // 6. Gửi yêu cầu sang Groq (Dùng Model mạnh nhất bạn yêu cầu)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt }, // Nạp kiến thức kho hàng
        ...messages // Gộp lịch sử chat của khách vào để AI nhớ ngữ cảnh
      ],
      // === SỬ DỤNG MODEL MỚI NHẤT & MẠNH NHẤT ===
      model: "llama-3.3-70b-versatile",
      // ==========================================
      temperature: 0.6, // Mức độ sáng tạo (0.6 là vừa đủ cho kỹ thuật)
      max_tokens: 500,  // Độ dài câu trả lời tối đa
    });

    // 7. Trả về kết quả
    const reply = chatCompletion.choices[0]?.message?.content || "Dạ, hiện em chưa tìm thấy thông tin. Anh/chị gọi hotline 0912.258.461 giúp em nhé!";
    
    return NextResponse.json({ text: reply });

  } catch (error: any) {
    console.error("Lỗi Chat API:", error);
    // Trả về câu mặc định nếu server lỗi để app không bị crash
    return NextResponse.json({ 
      text: "Hệ thống đang bảo trì một chút, anh/chị gọi trực tiếp 0912.258.461 giúp em nha!" 
    });
  }
}