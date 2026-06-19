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
// Helper: Parse giá tiền tiếng Việt → number (ULTIMATE VERSION)
// Xử lý tất cả format: "1.500k", "2tr", "1.500.000đ", "1,500,000 VNĐ"
// "Liên hệ" → null
// ============================================================

export function parseVietnamesePrice(priceInput: string | number | null | undefined): number | null {
  if (priceInput === null || priceInput === undefined) return null;
  if (typeof priceInput === "number") return priceInput > 0 ? Math.round(priceInput) : null;

  const raw = String(priceInput).toLowerCase().trim();
  if (!raw) return null;

  // Bước 1: Xác định hệ số nhân TRƯỚC KHI xóa chữ cái
  let multiplier = 1;
  if (/tr/i.test(raw)) {
    multiplier = 1_000_000;
  } else if (/k/i.test(raw)) {
    multiplier = 1_000;
  }

  // Bước 2: Xóa TOÀN BỘ ký tự không phải số
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) return null;

  // Bước 3: Parse thành integer và nhân hệ số
  const result = parseInt(digitsOnly, 10) * multiplier;

  return isNaN(result) || result <= 0 ? null : result;
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
