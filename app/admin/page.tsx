"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { loginAdmin } from "../utils/auth"; // Import bộ xử lý mới

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "66771508") {
      loginAdmin(); // Gọi hàm đăng nhập bảo mật 24h
      router.push("/admin/dashboard");
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-sky-700" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">QUẢN TRỊ VIÊN</h1>
          <p className="text-slate-500 text-sm">Đăng nhập hệ thống N.A.T CNC</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-sky-500" placeholder="Tài khoản" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-sky-500" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-sky-700 text-white py-3 rounded-lg font-bold hover:bg-sky-800 transition">ĐĂNG NHẬP</button>
        </form>
      </div>
    </div>
  );
}