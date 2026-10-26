"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Dạ em chào anh/chị! Em là trợ lý ảo N.A.T. Anh/chị cần hỗ trợ gì ạ?" }
  ]);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = useCallback(async (userMsg: string) => {
    setInput("");
    setLastFailedInput(null);
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      // Build history in {role, content} format for the API (last 10)
      const currentMessages = messages.filter((m) => !m.isError);
      const historyForApi = currentMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          messages: historyForApi,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setLastFailedInput(userMsg);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.text || "Lỗi hệ thống.", isError: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.text || "Em đang bận xíu, anh/chị gọi 0912.258.461 giúp em nhé!" },
        ]);
      }
    } catch {
      setLastFailedInput(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Lỗi mạng rồi ạ. Vui lòng thử lại.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input.trim());
  };

  const handleRetry = () => {
    if (!lastFailedInput || isLoading) return;
    // Remove the last error message before retrying
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.isError) return prev.slice(0, -1);
      return prev;
    });
    sendMessage(lastFailedInput);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-[340px] h-[450px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-sky-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm">Trợ lý N.A.T</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm ${msg.role === "user" ? "bg-sky-600 text-white" : msg.isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-white text-slate-800 border"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {lastFailedInput && !isLoading && (
              <div className="flex justify-start">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium px-3 py-1.5 bg-sky-50 rounded-full border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                  <RotateCcw size={12} />
                  Thử lại
                </button>
              </div>
            )}
            {isLoading && <div className="text-xs text-slate-400 italic ml-2">Đang trả lời...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t flex gap-2">
            <input className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none" 
              placeholder="Nhập câu hỏi..." value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()} 
            />
            <button onClick={handleSend} disabled={isLoading} className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-700"><Send size={18} /></button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110">
        {isOpen ? <X size={30} /> : <MessageCircle size={32} className="animate-pulse" />}
      </button>
    </div>
  );
}
