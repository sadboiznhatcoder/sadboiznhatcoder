// Hàm kiểm tra xem Admin còn hạn đăng nhập không (24h)
export const checkAdminAuth = () => {
  if (typeof window === "undefined") return false;
  
  const session = localStorage.getItem("nat_admin_session");
  if (!session) return false;

  const { expiry } = JSON.parse(session);
  const now = new Date().getTime();

  // Nếu quá hạn (24h) -> Tự động xóa và bắt đăng nhập lại
  if (now > expiry) {
    logoutAdmin();
    return false;
  }
  
  return true;
};

// Hàm đăng nhập (Lưu thời gian hết hạn sau 24h)
export const loginAdmin = () => {
  const now = new Date().getTime();
  const expiry = now + 24 * 60 * 60 * 1000; // 24 tiếng tính bằng mili-giây
  
  const session = {
    isAdmin: true,
    expiry: expiry
  };
  
  localStorage.setItem("nat_admin_session", JSON.stringify(session));
};

// Hàm đăng xuất
export const logoutAdmin = () => {
  localStorage.removeItem("nat_admin_session");
  // Chuyển hướng về trang chủ
  window.location.href = "/admin"; 
};