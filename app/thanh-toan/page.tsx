"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { useCart, removeVietnameseTones, formatCurrency } from "../utils/CartContext";
import { supabase } from "../utils/supabase";

// ============================================================
// Types
// ============================================================

interface FormData {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  taxCode: string;
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface OrderResult {
  transferContent: string;
  totalAmount: number;
}

// ============================================================
// Validation helpers
// ============================================================

const VN_PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.customerName.trim()) {
    errors.customerName = "Vui lòng nhập họ và tên";
  }

  if (!data.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!VN_PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ (VD: 0912258461)";
  }

  if (!data.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.address.trim()) {
    errors.address = "Vui lòng nhập địa chỉ nhận hàng";
  }

  return errors;
}

// ============================================================
// Generate transfer content
// ============================================================

function generateTransferContent(name: string, phone: string): string {
  const cleanName = removeVietnameseTones(name)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z]/g, "");
  return `${cleanName}${phone.trim()}`;
}

// ============================================================
// Main component
// ============================================================

export default function ThanhToanPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
    taxCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Success state
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Form change handler
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (items.length === 0) {
      setSubmitError("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = getTotal();
      const transferContent = generateTransferContent(formData.customerName, formData.phone);

      // Insert into Supabase
      const { error } = await supabase.from("orders").insert([
        {
          customer_name: formData.customerName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          company_name: formData.companyName.trim() || null,
          tax_code: formData.taxCode.trim() || null,
          total_amount: totalAmount,
          transfer_content: transferContent,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      // Success
      setOrderResult({ transferContent, totalAmount });
      clearCart();
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-600" size={40} />
      </main>
    );
  }

  // ========================
  // SUCCESS SCREEN
  // ========================
  if (orderResult) {
    const vietQRUrl = `https://img.vietqr.io/image/MB-86886688686686-compact2.png?amount=${orderResult.totalAmount}&addInfo=${encodeURIComponent(orderResult.transferContent)}&accountName=${encodeURIComponent("N.A.T AUTOMATION")}`;

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-40">
          <div className="container mx-auto max-w-4xl flex items-center gap-3">
            <PackageCheck size={24} className="text-emerald-400" />
            <h1 className="font-bold text-lg text-white">ĐẶT HÀNG THÀNH CÔNG</h1>
          </div>
        </header>

        <div className="container mx-auto max-w-2xl px-4 py-8">
          {/* Success badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Cảm ơn bạn đã đặt hàng!
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng
            </p>
          </div>

          {/* QR Code Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            {/* QR Image */}
            <div className="bg-gradient-to-b from-sky-50 to-white p-6 flex justify-center">
              <div className="bg-white rounded-xl p-3 shadow-inner border border-slate-100">
                <img
                  src={vietQRUrl}
                  alt="Mã QR thanh toán VietQR MB Bank"
                  className="w-[280px] h-auto"
                  loading="eager"
                />
              </div>
            </div>

            {/* Bank details */}
            <div className="px-6 pb-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-center text-lg border-b pb-3 flex items-center justify-center gap-2">
                <CreditCard size={20} className="text-sky-600" />
                Thông tin chuyển khoản
              </h3>

              {/* Bank name */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500">Ngân hàng</span>
                <span className="font-bold text-slate-800">MB Bank (Quân Đội)</span>
              </div>

              {/* Account number */}
              <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-200">
                <span className="text-sm text-slate-500">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 font-mono text-lg">86886688686686</span>
                  <button
                    onClick={() => copyToClipboard("86886688686686", "account")}
                    className="text-sky-600 hover:text-sky-700 p-1 rounded hover:bg-sky-50 transition cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === "account" ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Account name */}
              <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-200">
                <span className="text-sm text-slate-500">Chủ tài khoản</span>
                <span className="font-bold text-slate-800">N.A.T AUTOMATION</span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-3 border-t border-dashed border-slate-200 bg-amber-50 -mx-6 px-6 rounded">
                <span className="text-sm text-slate-600 font-medium">Số tiền</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 text-xl">{formatCurrency(orderResult.totalAmount)}</span>
                  <button
                    onClick={() => copyToClipboard(String(orderResult.totalAmount), "amount")}
                    className="text-sky-600 hover:text-sky-700 p-1 rounded hover:bg-sky-50 transition cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === "amount" ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Transfer content */}
              <div className="flex justify-between items-center py-3 border-t border-dashed border-slate-200 bg-sky-50 -mx-6 px-6 rounded">
                <span className="text-sm text-slate-600 font-medium">Nội dung CK</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-700 text-lg font-mono tracking-wider">
                    {orderResult.transferContent}
                  </span>
                  <button
                    onClick={() => copyToClipboard(orderResult.transferContent, "content")}
                    className="text-sky-600 hover:text-sky-700 p-1 rounded hover:bg-sky-50 transition cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === "content" ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-300 text-sm text-center">
              <ShieldCheck size={16} className="inline mr-1 -mt-0.5" />
              Đơn hàng sẽ được xác nhận trong vòng <strong>15 phút</strong> sau khi chúng tôi nhận được thanh toán.
              Hotline hỗ trợ: <a href="tel:0912258461" className="underline font-bold hover:text-amber-200">0912.258.461</a>
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition border border-white/20"
            >
              <ArrowLeft size={18} />
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ========================
  // CHECKOUT FORM
  // ========================
  const totalAmount = getTotal();
  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-11 z-40 shadow-sm">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/linh-kien" className="text-slate-600 hover:text-sky-600 transition" aria-label="Quay lại trang linh kiện">
              <ArrowLeft size={22} />
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingCart size={22} className="text-sky-600" />
              <h1 className="font-bold text-lg text-slate-800">Thanh toán</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              Thông tin
            </span>
            <ArrowRight size={14} />
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold">2</span>
              Thanh toán
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">
        {isEmpty ? (
          /* Empty cart state */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-4">
              <ShoppingCart size={40} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-600 mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-400 mb-6">Hãy thêm sản phẩm vào giỏ trước khi thanh toán</p>
            <Link
              href="/linh-kien"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-sky-200"
            >
              <ArrowLeft size={18} />
              Xem linh kiện
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
              {/* ================================ */}
              {/* LEFT COLUMN: Customer info form */}
              {/* ================================ */}
              <div className="lg:col-span-3 space-y-6">
                {/* Shipping info section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3.5 flex items-center gap-2">
                    <Truck size={20} className="text-white" />
                    <h2 className="font-bold text-white">Thông tin giao hàng</h2>
                  </div>

                  <div className="p-5 md:p-6 space-y-5">
                    {/* Họ và Tên */}
                    <div id="field-customerName">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Họ và Tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => handleChange("customerName", e.target.value)}
                        placeholder="VD: Nguyễn Minh Nhật"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50/50 ${
                          errors.customerName
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        }`}
                      />
                      {errors.customerName && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.customerName}
                        </p>
                      )}
                    </div>

                    {/* SĐT + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div id="field-phone">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="VD: 0912258461"
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50/50 ${
                            errors.phone
                              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.phone}
                          </p>
                        )}
                      </div>

                      <div id="field-email">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="VD: email@congty.vn"
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50/50 ${
                            errors.email
                              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Địa chỉ */}
                    <div id="field-address">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Địa chỉ nhận hàng <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50/50 resize-none ${
                          errors.address
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* VAT Invoice section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 flex items-center gap-2">
                    <Building2 size={20} className="text-white" />
                    <h2 className="font-bold text-white">Xuất hóa đơn VAT</h2>
                  </div>

                  <div className="p-5 md:p-6">
                    <p className="text-sm text-slate-500 mb-5 bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-100">
                      💡 Nhập thông tin nếu bạn cần xuất hóa đơn VAT
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Tên công ty
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                          placeholder="VD: Công ty TNHH ABC"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Mã số thuế
                        </label>
                        <input
                          type="text"
                          value={formData.taxCode}
                          onChange={(e) => handleChange("taxCode", e.target.value)}
                          placeholder="VD: 0123456789"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================ */}
              {/* RIGHT COLUMN: Order summary */}
              {/* ================================ */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-28">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={20} className="text-white" />
                      <h2 className="font-bold text-white">Đơn hàng</h2>
                    </div>
                    <span className="text-emerald-100 text-sm">{items.length} sản phẩm</span>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-slate-50/50 transition">
                        <div className="flex gap-3">
                          {/* Product image */}
                          <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShoppingCart size={20} />
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm font-bold text-red-600">
                              {formatCurrency(item.price)}
                            </p>

                            {/* Quantity controls + remove */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 bg-slate-100 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition cursor-pointer"
                                  aria-label="Giảm số lượng"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition cursor-pointer"
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-700">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                                  aria-label="Xóa sản phẩm"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t-2 border-slate-200 px-5 py-4 space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Tạm tính</span>
                      <span className="text-sm font-medium text-slate-700">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Phí vận chuyển</span>
                      <span className="text-sm font-medium text-emerald-600">Liên hệ sau</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-300">
                      <span className="font-bold text-slate-800">TỔNG CỘNG</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <div className="mx-5 mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      {submitError}
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="px-5 pb-5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={20} />
                          Xác nhận & Thanh toán
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-400 text-center mt-3">
                      🔒 Thông tin của bạn được bảo mật tuyệt đối
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
