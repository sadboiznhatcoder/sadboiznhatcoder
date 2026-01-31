import Groq from "groq-sdk";
import { supabase } from "../../utils/supabase";

// Khởi tạo Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    // 1. Lấy tin nhắn từ người dùng
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // 2. Lấy dữ liệu TỒN KHO & BÀI VIẾT mới nhất từ Supabase (RAG)
    const { data: products } = await supabase
      .from('products')
      .select('name, price, quantity, category, description');
    
    const { data: posts } = await supabase
      .from('posts')
      .select('title, content');

    // 3. Chuẩn bị dữ liệu để "mớm" cho AI
    let contextText = "Dưới đây là DỮ LIỆU THỰC TẾ TẠI CÔNG TY N.A.T AUTOMATION:\n";
    
    if (products && products.length > 0) {
        contextText += "\n=== KHO HÀNG HIỆN CÓ ===\n";
        products.forEach(p => {
            contextText += `- Sản phẩm: ${p.name} | Loại: ${p.category} | Giá: ${p.price || 'Liên hệ'} | Tồn kho: ${p.quantity} | Chi tiết: ${p.description}\n`;
        });
    } else {
        contextText += "(Hiện kho online đang cập nhật, hãy bảo khách gọi hotline để check hàng)\n";
    }

    if (posts && posts.length > 0) {
        contextText += "\n=== DỊCH VỤ & TIN TỨC CÔNG TY ===\n";
        posts.forEach(p => {
            contextText += `- Dịch vụ: ${p.title} | Nội dung: ${p.content}\n`;
        });
    }

    // 4. CẤU HÌNH TRÍ TUỆ NHÂN TẠO (QUAN TRỌNG NHẤT)
    const systemPrompt = `
    VAI TRÒ: Bạn là Kỹ sư trưởng kiêm Nhân viên tư vấn của CÔNG TY TNHH TỰ ĐỘNG HÓA N.A.T (Địa chỉ: Tây Ninh).
    
    NHIỆM VỤ CỦA BẠN:
    Hỗ trợ khách hàng về 2 mảng chính:
    1. Tra cứu sản phẩm trong kho (Dựa vào dữ liệu cung cấp bên dưới).
    2. Tư vấn kỹ thuật chuyên sâu về CNC, Cơ khí, Tự động hóa (Dựa vào kiến thức của bạn).

    DỮ LIỆU KHO HÀNG & DỊCH VỤ CỦA CÔNG TY (Ưu tiên dùng khi khách hỏi mua):
    ${contextText}

    QUY TẮC TRẢ LỜI:
    - **Nếu khách hỏi mua hàng:** KIỂM TRA KHO NGAY.
      + Có hàng: Báo tên, giá, thông số và số lượng.
      + Hết hàng/Không có: Xin lỗi, tư vấn dòng tương đương hoặc bảo khách gọi Hotline 0912.258.461 để đặt.
    
    - **Nếu khách hỏi kỹ thuật (Lỗi máy, G-Code, Nguyên lý mài/cắt...):**
      + Bạn được phép dùng toàn bộ kiến thức chuyên gia của mình để giải thích cặn kẽ, dễ hiểu.
      + Tư vấn sửa lỗi, cách vận hành, bảo dưỡng máy CNC (Fanuc, Mitsubishi, Siemens...).
      + *Mẹo:* Sau khi tư vấn kỹ thuật xong, hãy khéo léo nhắn: "Nếu vấn đề phức tạp, bên em có dịch vụ sửa chữa tận nơi 24/7, anh có thể liên hệ để kỹ thuật viên xuống kiểm tra ạ."

    - **Thông tin liên hệ:** Hotline/Zalo: 0912.258.461.
    - **Giọng điệu:** Thân thiện, chuyên nghiệp, xưng "em" hoặc "kỹ thuật viên N.A.T".
    - **Lưu ý:** Không trả lời các vấn đề chính trị, tôn giáo, hoặc không liên quan đến kỹ thuật/máy móc.
    `;

    // 5. Gửi yêu cầu sang Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt }, // Nạp não cho AI
        ...messages // Lịch sử chat của khách
      ],
      model: "llama3-8b-8192", // Model nhanh và thông minh
      temperature: 0.6, // Sáng tạo vừa phải để tư vấn kỹ thuật tốt
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "Dạ, hiện tại em đang kiểm tra lại hệ thống. Anh/chị vui lòng gọi trực tiếp 0912.258.461 để được hỗ trợ nhanh nhất ạ!";

    return new Response(reply);

  } catch (error: any) {
    console.error("Lỗi AI:", error);
    return new Response("Hệ thống đang bận, vui lòng thử lại sau.", { status: 500 });
  }
}