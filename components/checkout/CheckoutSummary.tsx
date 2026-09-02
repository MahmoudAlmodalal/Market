"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderPricingBreakdown } from "@/components/cart/OrderPricingBreakdown";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/order";
import type { DeliveryTimeSlot } from "@/lib/mock/cart";

export interface CheckoutSummaryProps {
  address?: Address | null;
  timeSlot?: DeliveryTimeSlot | null;
  paymentMethod?: string;
  notes?: string;
  onSubmitOrder: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * CheckoutSummary consolidates order destination, delivery timing, payment method,
 * and server-authoritative pricing with idempotent submission trigger.
 */
export function CheckoutSummary({
  address,
  timeSlot,
  paymentMethod = "cod",
  notes,
  onSubmitOrder,
  isSubmitting = false,
  disabled = false,
  className,
}: CheckoutSummaryProps) {
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const { cart, itemCount, hasBlockingIssues, getPricingBreakdown } = useCart();

  const breakdown = getPricingBreakdown();
  const totalStr = breakdown.total || cart.total || "0.00";

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cod":
        return locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery (COD)";
      case "card":
      case "digital_card":
        return locale === "ar" ? "بطاقة دفع إلكتروني" : "Card Payment";
      case "apple_pay":
        return "Apple Pay";
      default:
        return method;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cod":
        return <Banknote className="w-4 h-4 text-neutral-500" />;
      case "card":
      case "digital_card":
        return <CreditCard className="w-4 h-4 text-neutral-500" />;
      case "apple_pay":
        return <Smartphone className="w-4 h-4 text-neutral-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-neutral-500" />;
    }
  };

  const slotLabel = timeSlot
    ? locale === "ar"
      ? timeSlot.label_ar
      : timeSlot.label_en
    : locale === "ar"
    ? "خلال أوقات العمل الرسمية"
    : "Standard delivery hours";

  return (
    <div className={cn("w-full flex flex-col gap-4 text-start", className)}>
      {/* Review Snapshot Card */}
      <div className="w-full bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          {locale === "ar" ? "مراجعة تفاصيل الاستلام" : "Delivery Review"}
        </h3>

        {/* Address snapshot */}
        <div className="flex items-start gap-2.5 text-xs text-neutral-700">
          <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-neutral-900">
              {address?.name || (locale === "ar" ? "العنوان المحدد" : "Selected Address")}
            </span>
            <span className="text-neutral-500 truncate">
              {address
                ? `${address.city}، ${address.street}`
                : locale === "ar"
                ? "لم يتم تحديد عنوان"
                : "No address selected"}
            </span>
          </div>
        </div>

        {/* Time slot snapshot */}
        <div className="flex items-start gap-2.5 text-xs text-neutral-700">
          <Clock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-neutral-900">
              {locale === "ar" ? "موعد التسليم" : "Delivery Time"}
            </span>
            <span className="text-neutral-500 truncate">{slotLabel}</span>
          </div>
        </div>

        {/* Payment snapshot */}
        <div className="flex items-start gap-2.5 text-xs text-neutral-700">
          <div className="shrink-0 mt-0.5">{getPaymentIcon(paymentMethod)}</div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-neutral-900">
              {locale === "ar" ? "طريقة الدفع" : "Payment Method"}
            </span>
            <span className="text-neutral-500 truncate">
              {getPaymentLabel(paymentMethod)}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Component */}
      <OrderPricingBreakdown
        breakdown={breakdown}
        showVoucherInput={false}
        showCheckoutButton={false}
      />

      {/* Idempotent Submit Button */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={disabled || isSubmitting || hasBlockingIssues || cart.items.length === 0}
          loading={isSubmitting}
          onClick={onSubmitOrder}
          className="h-13 text-base font-extrabold shadow-soft-lg bg-brand-500 hover:bg-brand-600 active:scale-[0.99] transition-all"
          rightIcon={
            direction === "rtl" ? (
              <ArrowLeft className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )
          }
        >
          <span>
            {isSubmitting
              ? t("checkout.processingOrder", "جاري إرسال الطلب...")
              : `${t("checkout.placeOrder", "تأكيد وإرسال الطلب")} (${totalStr} ₪)`}
          </span>
        </Button>

        {/* Security & Guarantee Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 mt-1">
          <Lock className="w-3.5 h-3.5" />
          <span>
            {locale === "ar"
              ? "معاملة آمنة ومحمية بالكامل بواسطة سوقي"
              : "Secure & Encrypted transaction via Souqi"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSummary;
