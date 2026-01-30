"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { loginAdmin } from "../utils/auth"; 

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Giả lập độ trễ mạng nhẹ để tạo cảm giác xử lý
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === "admin" && password === "66771508") {
      loginAdmin(); // Gọi hàm lưu cookie
      router.push("/admin/dashboard");
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700">
        <div className="text-center mb-6">
          <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <Lock className="text-sky-700" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">QUẢN TRỊ VIÊN</h1>
          <p className="text-slate-500 text-sm">Hệ thống N.A.T CNC</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
              placeholder="Tài khoản" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={loading}
            />
          </div>
          <div>
            <input 
              type="password" 
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" 
              placeholder="Mật khẩu" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={loading}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sky-700 text-white py-3 rounded-lg font-bold hover:bg-sky-800 active:bg-sky-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> ĐANG XỬ LÝ...</> : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
}