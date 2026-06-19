"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../utils/CartContext";

export default function CartFloatingButton() {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <Link
      href="/thanh-toan"
      aria-label={`Giỏ hàng: ${totalItems} sản phẩm`}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 group"
    >
      <ShoppingCart size={24} className="group-hover:rotate-[-8deg] transition-transform" />

      {/* Badge số lượng */}
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
        {totalItems > 99 ? "99+" : totalItems}
      </span>

      {/* Pulse ring effect */}
      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping pointer-events-none" />
    </Link>
  );
}
