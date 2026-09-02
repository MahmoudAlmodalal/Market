"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Store,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Receipt,
  Copy,
  Check,
  Bike,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

export interface OrderReceiptCardProps {
  order: Order;
  onCancelClick?: () => void;
  onReorderClick?: () => void;
  className?: string;
  showActions?: boolean;
}

export function OrderReceiptCard({
  order,
  onCancelClick,
  onReorderClick,
  className,
  showActions = true,
}: OrderReceiptCardProps) {
  const { t, locale, direction } = useLocale();
  const [copied, setCopied] = useState(false);

  const isPendingOrConfirmed =
    order.status === "pending" || order.status === "confirmed";

  // Format creation date
  const formattedDate = (() => {
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

  // Status badge config
  const statusBadgeConfig: Record<
    string,
    { variant: "warning" | "info" | "brand" | "success" | "danger" | "neutral"; labelAr: string; labelEn: string }
  > = {
    pending: { variant: "warning", labelAr: "قيد الانتظار", labelEn: "Pending" },
    confirmed: { variant: "info", labelAr: "تم التأكيد", labelEn: "Confirmed" },
    preparing: { variant: "brand", labelAr: "جاري التجهيز", labelEn: "Preparing" },
    ready: { variant: "brand", labelAr: "جاهز للتسليم", labelEn: "Ready for Delivery" },
    completed: { variant: "success", labelAr: "مكتمل", labelEn: "Completed" },
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
        "bg-white border border-neutral-200/90 rounded-2xl p-4.5 shadow-sm space-y-5",
        className
      )}
    >
      {/* Header: Order Number, Date, Status Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400">
              {locale === "ar" ? "رقم الطلب" : "Order ID"}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="group flex items-center gap-1 text-sm font-bold text-neutral-900 hover:text-brand-600 active:scale-95 transition-all tabular-nums"
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
            <span>{formattedDate}</span>
          </div>
        </div>

        <Badge variant={currentStatusConfig.variant} size="md">
          {locale === "ar"
            ? currentStatusConfig.labelAr
            : currentStatusConfig.labelEn}
        </Badge>
      </div>

      {/* Seller & Contact Section */}
      {order.seller && (
        <div className="bg-neutral-50/90 rounded-xl p-3.5 border border-neutral-200/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-neutral-500 block">
                {locale === "ar" ? "المتجر المنتج" : "Merchant"}
              </span>
              <p className="text-xs font-bold text-neutral-900 truncate">
                {order.seller.business_name}
              </p>
            </div>
          </div>

          {order.seller.phone && (
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={`tel:${order.seller.phone}`}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 flex items-center justify-center transition-all shadow-xs"
                title={locale === "ar" ? "اتصال بالمتجر" : "Call Merchant"}
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${order.seller.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-all shadow-xs"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Items Breakdown Snapshot */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-neutral-400" />
          <span>{locale === "ar" ? "المنتجات المطلوبة" : "Ordered Items"}</span>
          <span className="text-neutral-400 font-normal">
            ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
          </span>
        </h4>

        <div className="divide-y divide-neutral-100">
          {order.items.map((item, idx) => (
            <div key={item.id || idx} className="py-2.5 flex items-center gap-3">
              {/* Product Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200/80 overflow-hidden relative shrink-0">
                {item.primary_image ? (
                  <Image
                    src={item.primary_image}
                    alt={item.product_name_snapshot}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                  {item.product_name_snapshot}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 tabular-nums">
                  <span>{item.quantity} × {item.unit_price_snapshot} ₪</span>
                </div>
              </div>

              {/* Line Total */}
              <div className="text-end shrink-0">
                <span className="text-xs font-bold text-neutral-900 tabular-nums">
                  {item.line_total} ₪
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Pricing Summary */}
      <div className="bg-neutral-50/80 rounded-xl p-3.5 border border-neutral-200/60 space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-600">
          <span>{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
          <span className="font-semibold text-neutral-900 tabular-nums">
            {order.subtotal} ₪
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>{locale === "ar" ? "رسوم التوصيل" : "Delivery Fee"}</span>
          <span className="font-semibold text-neutral-900 tabular-nums">
            {order.delivery_fee ? `${order.delivery_fee} ₪` : locale === "ar" ? "مجاني" : "Free"}
          </span>
        </div>

        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-bold text-sm text-neutral-900">
          <span>{locale === "ar" ? "المجموع الكلي" : "Total Amount"}</span>
          <span className="text-brand-600 tabular-nums text-base">
            {order.total} ₪
          </span>
        </div>
      </div>

      {/* Delivery Address & Contact */}
      <div className="space-y-2 pt-1 text-xs">
        <h4 className="font-bold text-neutral-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
          <span>{locale === "ar" ? "تفاصيل التسليم والتوصيل" : "Delivery Information"}</span>
        </h4>

        <div className="bg-white border border-neutral-200/80 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-neutral-900">
            <span>{order.contact_name}</span>
            <span className="text-neutral-500 tabular-nums text-[11px]">
              {order.contact_phone}
            </span>
          </div>

          <p className="text-neutral-600 leading-relaxed text-[11px]">
            {order.delivery_address}
          </p>

          {order.notes && (
            <div className="pt-1.5 mt-1 border-t border-neutral-100 text-[11px] text-neutral-500">
              <span className="font-semibold text-neutral-700">
                {locale === "ar" ? "ملاحظة: " : "Note: "}
              </span>
              {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* Driver & Courier Shortcut button if ready/completed */}
      {(order.status === "ready" || order.status === "completed") && (
        <div className="bg-brand-50/60 border border-brand-200/60 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xs">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">
                {locale === "ar" ? "مندوب التوصيل" : "Delivery Courier"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {locale === "ar" ? "كابتن أحمد (+970 59-999-0011)" : "Captain Ahmad (+970 59-999-0011)"}
              </p>
            </div>
          </div>

          <a
            href="tel:+970599990011"
            className="px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "اتصال" : "Call"}</span>
          </a>
        </div>
      )}

      {/* Actions footer */}
      {showActions && (
        <div className="pt-2 flex flex-col gap-2">
          {isPendingOrConfirmed && onCancelClick && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={onCancelClick}
              className="text-danger-600 border-danger-200 hover:bg-danger-50 hover:border-danger-300"
            >
              <ShieldAlert className="w-4 h-4 me-1.5" />
              <span>{locale === "ar" ? "إلغاء الطلب" : "Cancel Order"}</span>
            </Button>
          )}

          {onReorderClick && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={onReorderClick}
              className="bg-brand-500 hover:bg-brand-600 text-white shadow-soft"
            >
              <RotateCcw className="w-4 h-4 me-1.5" />
              <span>{locale === "ar" ? "إعادة الطلب" : "Reorder All Items"}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderReceiptCard;
