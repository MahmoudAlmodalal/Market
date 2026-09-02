"use client";

import React, { useState } from "react";
import {
  Banknote,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Check,
  Lock,
} from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  className?: string;
}

export interface PaymentOptionItem {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  badge_ar?: string;
  badge_en?: string;
  icon: "cod" | "card" | "apple_pay";
}

const PAYMENT_OPTIONS: PaymentOptionItem[] = [
  {
    id: "cod",
    title_ar: "الدفع عند الاستلام (COD)",
    title_en: "Cash on Delivery (COD)",
    desc_ar: "ادفع نقداً عند استلام طلبك من مندوب التوصيل",
    desc_en: "Pay in cash when you receive your order from the courier",
    badge_ar: "الأكثر شيوعاً",
    badge_en: "Popular",
    icon: "cod",
  },
  {
    id: "card",
    title_ar: "بطاقة دفع إلكتروني (Visa / Mastercard)",
    title_en: "Credit / Debit Card (Mock Demo)",
    desc_ar: "دفع فوري وآمن عبر البطاقة المصرفية",
    desc_en: "Fast and secure checkout via bank card",
    icon: "card",
  },
  {
    id: "apple_pay",
    title_ar: "Apple Pay / محفظة رقمية",
    title_en: "Apple Pay / Digital Wallet",
    desc_ar: "دفع سريع بلمسة واحدة عبر جهازك",
    desc_en: "One-touch seamless payment through your device",
    icon: "apple_pay",
  },
];

/**
 * PaymentMethodSelector renders options for Cash on Delivery,
 * Mock Credit/Debit Cards, and Apple Pay with active selection indicators
 * and mock card input simulator.
 */
export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  className,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  // Mock card inputs
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardHolder, setCardHolder] = useState("محمود أحمد");

  const renderIcon = (type: string, isSelected: boolean) => {
    switch (type) {
      case "cod":
        return <Banknote className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "apple_pay":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-3 text-start", className)}>
      <fieldset className="w-full">
        <legend className="sr-only">
          {locale === "ar" ? "اختر طريقة الدفع" : "Select payment method"}
        </legend>

        <div className="flex flex-col gap-2.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const isSelected =
              selectedMethod === opt.id ||
              (opt.id === "card" && selectedMethod === "digital_card");

            const title = locale === "ar" ? opt.title_ar : opt.title_en;
            const desc = locale === "ar" ? opt.desc_ar : opt.desc_en;
            const badge = locale === "ar" ? opt.badge_ar : opt.badge_en;

            return (
              <div
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectMethod(opt.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onSelectMethod(opt.id);
                  }
                }}
                className={cn(
                  "relative w-full rounded-2xl border transition-all select-none p-3.5 sm:p-4 text-start cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isSelected
                    ? "bg-brand-50/40 border-brand-500 ring-2 ring-brand-500/20 shadow-sm"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5",
                        isSelected
                          ? "bg-brand-500 text-white"
                          : "bg-neutral-100 text-neutral-600"
                      )}
                    >
                      {renderIcon(opt.icon, isSelected)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {title}
                        </span>
                        {badge && (
                          <Badge variant="primary" size="sm" className="text-[10px] px-1.5 py-0">
                            {badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Radio check circle */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                      isSelected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-neutral-300 bg-white"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Sub-panel for Card details simulation */}
                {isSelected && (opt.id === "card" || selectedMethod === "digital_card") && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3.5 pt-3.5 border-t border-neutral-200 flex flex-col gap-2.5 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-800">
                        {locale === "ar" ? "بيانات البطاقة (بيئة تجريبية آمنة)" : "Card Details (Sandbox Demo)"}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-green-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>256-bit SSL</span>
                      </div>
                    </div>

                    <div>
                      <Input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        startIcon={<CreditCard className="w-4 h-4 text-neutral-400" />}
                        variantSize="sm"
                        className="font-mono numeric-data text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        variantSize="sm"
                        className="font-mono numeric-data text-xs"
                      />
                      <Input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        startIcon={<Lock className="w-3.5 h-3.5 text-neutral-400" />}
                        variantSize="sm"
                        className="font-mono numeric-data text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export default PaymentMethodSelector;
