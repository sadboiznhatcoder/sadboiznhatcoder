"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ============================================================
// Types
// ============================================================

export interface CartItem {
  id: number;
  name: string;
  price: number;        // Giá dạng số (đã parse)
  priceLabel: string;   // Giá gốc dạng text ("2.500.000đ")
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  totalItems: number;
}

// ============================================================
// Helper: Parse giá tiền tiếng Việt → number (AUTO-SCALING)
// Xử lý mọi format: "1.500k", "2tr", "1.500.000đ", "1,500,000 VNĐ"
// AUTO-SCALE: Giá < 100.000 mà không có suffix → tự nhân 1000
// (Linh kiện CNC không bao giờ có giá vài nghìn đồng)
// "Liên hệ" → null
// ============================================================

export function parseVietnamesePrice(priceInput: string | number | null | undefined): number | null {
  if (priceInput === null || priceInput === undefined) return null;

  if (typeof priceInput === "number") {
    if (isNaN(priceInput) || priceInput <= 0) return null;
    let rounded = Math.round(priceInput);
    // Domain rule: Linh kiện máy CNC luôn có giá trị >= 100.000đ.
    // Nếu giá dạng rút gọn < 100.000 (VD: 1500 = 1.500k), tự nhân 1.000
    if (rounded < 100_000) {
      rounded *= 1_000;
    }
    return rounded;
  }

  const raw = String(priceInput).toLowerCase().trim();
  if (!raw || raw.includes("liên hệ") || raw.includes("lien he")) return null;

  // Xử lý các format chứa số thập phân như "1.5tr", "1,5tr", "1.5 triệu", "1.5k"
  const trMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(?:tr|triệu|trieu)/i);
  if (trMatch) {
    const num = parseFloat(trMatch[1].replace(",", "."));
    if (!isNaN(num) && num > 0) return Math.round(num * 1_000_000);
  }

  const kMatch = raw.match(/^([0-9]+(?:[.,][0-9]+)?)\s*k/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(",", "."));
    if (!isNaN(num) && num > 0) {
      const res = Math.round(num * 1_000);
      return res < 100_000 ? res * 1_000 : res;
    }
  }

  // Loại bỏ các ký tự tiền tệ, giữ lại số
  // Ví dụ: "1.500.000đ", "1.500.000 đ", "1,500,000", "1.500đ", "1500"
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) return null;

  let result = parseInt(digitsOnly, 10);
  if (isNaN(result) || result <= 0) return null;

  // Auto-scaling: Giá < 100.000đ (như "1.500" hay "1500") thì quy chuẩn về 1.500.000đ
  if (result < 100_000) {
    result *= 1_000;
  }

  return result;
}

// Backward-compatible alias
export const parsePriceString = parseVietnamesePrice;

// ============================================================
// Helper: Bỏ dấu tiếng Việt
// ============================================================

export function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ============================================================
// Helper: Format tiền VNĐ
// ============================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

// ============================================================
// Context
// ============================================================

const CART_STORAGE_KEY = "nat-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCartFromStorage());
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(items);
    }
  }, [items, isHydrated]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
