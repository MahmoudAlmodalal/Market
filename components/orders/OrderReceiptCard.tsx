"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/context/LocaleContext";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Store,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Banknote,
  Receipt,
  Copy,
  Check,
  Bike,
  ShieldAlert,
  RotateCcw,
  Printer,
  ShieldCheck,
  Package,
  Sparkles,
} from "lucide-react";

export interface OrderReceiptCardProps {
  order: Order;
  onCancelClick?: () => void;
  onReorderClick?: () => void;
  className?: string;
  showActions?: boolean;
}

/**
 * Individual Order Item Row with robust image fallback to prevent broken image displays
 */
function OrderItemRow({ item }: { item: OrderItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="py-3 flex items-center gap-3.5 group">
      {/* Product Thumbnail with fallback */}
      <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200/80 overflow-hidden relative shrink-0 flex items-center justify-center shadow-xs">
        {item.primary_image && !imgError ? (
          <Image
            src={item.primary_image}
            alt={item.product_name_snapshot}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="56px"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-brand-50/50 text-brand-500 p-1">
            <Package className="w-6 h-6 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
          {item.product_name_snapshot}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 tabular-nums">
          <span className="inline-flex items-center font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md text-[11px]">
            {item.quantity} × {item.unit_price_snapshot} ₪
          </span>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-end shrink-0 ps-2">
        <span className="text-sm font-bold text-neutral-900 tabular-nums">
          {item.line_total} ₪
        </span>
      </div>
    </div>
  );
}

export function OrderReceiptCard({
  order,
  onCancelClick,
  onReorderClick,
  className,
  showActions = true,
}: OrderReceiptCardProps) {
  const { locale, direction } = useLocale();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPendingOrConfirmed =
    order.status === "pending" || order.status === "confirmed";

  // Hydration-safe formatted creation date
  const formattedDate = (() => {
    if (!isMounted) return "";
    try {
      const date = new Date(order.created_at);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } catch {
      return order.created_at;
    }
  })();

  const handleCopyOrderNumber = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Status badge config
  const statusBadgeConfig: Record<
    string,
    { variant: "warning" | "info" | "brand" | "success" | "danger" | "neutral"; labelAr: string; labelEn: string }
  > = {
    pending: { variant: "warning", labelAr: "قيد الانتظار", labelEn: "Pending" },
    confirmed: { variant: "info", labelAr: "تم التأكيد", labelEn: "Confirmed" },
    preparing: { variant: "brand", labelAr: "جاري التجهيز", labelEn: "Preparing" },
    ready: { variant: "brand", labelAr: "جاهز للتسليم", labelEn: "Ready for Delivery" },
    completed: { variant: "success", labelAr: "مكتمل ومستلم", labelEn: "Delivered" },
    cancelled: { variant: "danger", labelAr: "ملغي", labelEn: "Cancelled" },
  };

  const currentStatusConfig = statusBadgeConfig[order.status] || {
    variant: "neutral",
    labelAr: order.status,
    labelEn: order.status,
  };

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-soft-sm space-y-6 print-receipt-container",
        className
      )}
    >
      {/* Header: Order Number, Date, Status Badge */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-100 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">
              {locale === "ar" ? "رقم الفاتورة والطلب:" : "Order ID:"}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 hover:text-brand-600 active:scale-95 transition-all tabular-nums bg-neutral-100 hover:bg-brand-50 px-2.5 py-1 rounded-lg border border-neutral-200/60"
              title={locale === "ar" ? "نسخ رقم الطلب" : "Copy Order Number"}
            >
              <span>{order.order_number}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formattedDate || (locale === "ar" ? "جاري التحميل..." : "Loading...")}</span>
          </div>
        </div>

        <Badge variant={currentStatusConfig.variant} size="lg" className="shadow-xs">
          {locale === "ar"
            ? currentStatusConfig.labelAr
            : currentStatusConfig.labelEn}
        </Badge>
      </div>

      {/* Verified Merchant & Artisan Section */}
      {order.seller && (
        <div className="bg-gradient-to-r from-neutral-50 to-brand-50/20 rounded-2xl p-4 border border-neutral-200/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-soft-sm">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 block">
                  {locale === "ar" ? "المتجر / الحرفي الشريك" : "Artisan Partner"}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{locale === "ar" ? "موثق" : "Verified"}</span>
                </span>
              </div>
              <p className="text-sm font-bold text-neutral-900 truncate mt-0.5">
                {order.seller.business_name}
              </p>
            </div>
          </div>

          {order.seller.phone && (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${order.seller.phone}`}
                className="h-9 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title={locale === "ar" ? "اتصال بالمتجر" : "Call Merchant"}
              >
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden sm:inline">{locale === "ar" ? "اتصال" : "Call"}</span>
              </a>
              <a
                href={`https://wa.me/${order.seller.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  locale === "ar"
                    ? `مرحباً، أستفسر عن طلبي رقم ${order.order_number}`
                    : `Hello, inquiring about my order ${order.order_number}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">واتساب</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Items Breakdown Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-500" />
            <span>{locale === "ar" ? "المنتجات المطلوبة" : "Ordered Items"}</span>
          </h4>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} {locale === "ar" ? "قطع" : "items"}
          </span>
        </div>

        <div className="divide-y divide-neutral-100 border-t border-b border-neutral-100">
          {order.items.map((item, idx) => (
            <OrderItemRow key={item.id || idx} item={item} />
          ))}
        </div>
      </div>

      {/* Bill & Financial Ticket Summary */}
      <div className="bg-gradient-to-b from-neutral-50/90 to-neutral-50/40 rounded-2xl p-4 sm:p-5 border border-neutral-200/70 space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>{locale === "ar" ? "المجموع الفرعي للمنتجات" : "Subtotal"}</span>
          <span className="font-bold text-neutral-900 tabular-nums">
            {order.subtotal} ₪
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span>{locale === "ar" ? "رسوم التوصيل والشحن" : "Delivery Fee"}</span>
          </span>
          <span className="font-bold text-neutral-900 tabular-nums">
            {order.delivery_fee && parseFloat(order.delivery_fee) > 0
              ? `${order.delivery_fee} ₪`
              : locale === "ar" ? "مجاني" : "Free"}
          </span>
        </div>

        {/* Dashed separator for receipt look */}
        <div className="border-t border-dashed border-neutral-300 pt-3 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-sm sm:text-base text-neutral-900 block">
              {locale === "ar" ? "المجموع الكلي المطلوب" : "Total Amount"}
            </span>
            <span className="text-[11px] text-neutral-500">
              {locale === "ar" ? "شامل جميع الرسوم والتوصيل" : "All inclusive"}
            </span>
          </div>
          <span className="text-brand-600 tabular-nums text-xl sm:text-2xl font-black">
            {order.total} <span className="text-sm font-bold">₪</span>
          </span>
        </div>

        {/* Payment Method Pill */}
        <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2 text-neutral-700 font-semibold">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>{locale === "ar" ? "طريقة الدفع: نقداً عند الاستلام" : "Payment: Cash on Delivery (COD)"}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
            <ShieldCheck className="w-3 h-3" />
            <span>{locale === "ar" ? "دفع آمن عند الباب" : "Secure Payment"}</span>
          </span>
        </div>
      </div>

      {/* Delivery Address & Contact Card */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-500" />
          <span>{locale === "ar" ? "بيانات المستلم وموقع التسليم" : "Delivery Address"}</span>
        </h4>

        <div className="bg-neutral-50/60 border border-neutral-200/80 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-neutral-900">
            <span>{order.contact_name}</span>
            <span className="text-neutral-600 tabular-nums font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-neutral-200/60">
              {order.contact_phone}
            </span>
          </div>

          <p className="text-neutral-700 leading-relaxed font-medium">
            {order.delivery_address}
          </p>

          {order.notes && (
            <div className="pt-2 mt-1 border-t border-neutral-200/60 text-xs text-neutral-700 flex items-start gap-1.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/40">
              <span className="font-bold text-amber-900 shrink-0">
                {locale === "ar" ? "ملاحظة التوصيل:" : "Note:"}
              </span>
              <span className="leading-relaxed">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Driver / Courier Section (when ready or completed) */}
      {(order.status === "ready" || order.status === "completed") && (
        <div className="bg-gradient-to-r from-brand-50/80 via-white to-brand-50/40 border border-brand-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-soft-sm">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900">
                  {locale === "ar" ? "مندوب التوصيل المعتمد" : "Courier"}
                </span>
                <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.2 rounded">
                  {order.status === "completed" ? (locale === "ar" ? "تم التسليم" : "Delivered") : (locale === "ar" ? "في الطريق" : "On the way")}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                {locale === "ar" ? "كابتن أحمد (+970 59-999-0011)" : "Captain Ahmad (+970 59-999-0011)"}
              </p>
            </div>
          </div>

          <a
            href="tel:+970599990011"
            className="h-9 px-3 rounded-xl bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold flex items-center gap-1.5 shadow-soft-sm active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "اتصال بالمندوب" : "Call"}</span>
          </a>
        </div>
      )}

      {/* Actions footer */}
      {showActions && (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 no-print">
          {/* Print Button */}
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handlePrint}
            className="border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold"
          >
            <Printer className="w-4 h-4 me-1.5" />
            <span>{locale === "ar" ? "طباعة الإيصال" : "Print Receipt"}</span>
          </Button>

          {/* Cancel Order Button */}
          {isPendingOrConfirmed && onCancelClick && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={onCancelClick}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold"
            >
              <ShieldAlert className="w-4 h-4 me-1.5" />
              <span>{locale === "ar" ? "إلغاء الطلب" : "Cancel Order"}</span>
            </Button>
          )}

          {/* Reorder Button */}
          {onReorderClick && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={onReorderClick}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-soft"
            >
              <RotateCcw className="w-4 h-4 me-1.5" />
              <span>{locale === "ar" ? "إعادة الطلب" : "Reorder"}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderReceiptCard;
