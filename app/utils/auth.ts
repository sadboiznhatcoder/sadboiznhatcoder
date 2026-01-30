"use client";

// Hàm đăng nhập: Lưu vào cookie để bảo mật hơn
export const loginAdmin = () => {
  // Lưu cookie hết hạn sau 1 ngày (86400 giây)
  document.cookie = "isLoggedIn=true; path=/; max-age=86400; SameSite=Strict";
  // Lưu thêm vào localStorage để tiện kiểm tra nhanh ở client
  if (typeof window !== "undefined") {
    localStorage.setItem("isLoggedIn", "true");
  }
};

// Hàm đăng xuất: Xóa sạch mọi thứ
export const logoutAdmin = () => {
  // Xóa cookie bằng cách đặt ngày hết hạn về quá khứ
  document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  if (typeof window !== "undefined") {
    localStorage.removeItem("isLoggedIn");
  }
};

// Hàm kiểm tra trạng thái đăng nhập
export const checkAuth = () => {
  if (typeof window === "undefined") return false;
  // Kiểm tra cookie ưu tiên
  const cookieAuth = document.cookie.split('; ').find(row => row.startsWith('isLoggedIn='));
  const localAuth = localStorage.getItem("isLoggedIn");
  
  return !!cookieAuth || localAuth === "true";
};