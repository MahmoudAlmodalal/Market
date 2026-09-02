"use client";

import React, { useState } from "react";
import { Tag, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface CouponInputProps {
  onApplySuccess?: (code: string, discount: number) => void;
  className?: string;
}

/**
 * CouponInput allows customers to apply promotional voucher codes
 * (e.g. SOUQI10, WELCOME20) with instantaneous validation, success state,
 * error notification, and remove action.
 */
export function CouponInput({ onApplySuccess, className }: CouponInputProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const {
    voucherCode,
    discountAmount,
    voucherError,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isApplied = Boolean(voucherCode && discountAmount > 0);
  const currentError = localError || voucherError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;

    setIsSubmitting(true);
    setLocalError(null);

    const result = applyVoucher(clean);
    setIsSubmitting(false);

    if (result.success) {
      setInputCode("");
      if (onApplySuccess && result.discount !== undefined) {
        onApplySuccess(clean, result.discount);
      }
    } else {
      setLocalError(result.error || (locale === "ar" ? "رمز القسيمة غير صالح" : "Invalid voucher code"));
    }
  };

  const handleRemove = () => {
    removeVoucher();
    setInputCode("");
    setLocalError(null);
  };

  if (isApplied && voucherCode) {
    return (
      <div
        className={cn(
          "w-full bg-green-50/90 border border-green-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-start animate-in fade-in duration-200",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-green-950 font-mono text-sm tracking-wider uppercase">
                {voucherCode}
              </span>
              <span className="text-[10px] bg-green-200/70 text-green-800 font-bold px-1.5 py-0.5 rounded-full">
                {locale === "ar" ? "نشط" : "Applied"}
              </span>
            </div>
            <span className="text-xs text-green-800 truncate">
              {locale === "ar"
                ? `وفرت ${discountAmount.toFixed(2)} ₪ على هذا الطلب`
                : `Saved ${discountAmount.toFixed(2)} ₪ on this order`}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-neutral-500 hover:text-semantic-error hover:bg-red-50 text-xs h-8 px-2.5 rounded-xl shrink-0"
          aria-label={locale === "ar" ? "إلغاء القسيمة" : "Remove voucher"}
        >
          <X className="w-3.5 h-3.5 me-1" />
          <span>{locale === "ar" ? "إلغاء" : "Remove"}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col gap-1.5 text-start", className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Input
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (localError) setLocalError(null);
            }}
            placeholder={
              locale === "ar"
                ? "هل لديك قسيمة خصم؟ (مثل: SOUQI10)"
                : "Have a voucher code? (e.g. SOUQI10)"
            }
            startIcon={<Tag className="w-4 h-4 text-neutral-400" />}
            variantSize="md"
            className="uppercase font-mono text-xs sm:text-sm tracking-wider"
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          size="md"
          disabled={!inputCode.trim() || isSubmitting}
          loading={isSubmitting}
          className="shrink-0 font-bold border-neutral-300 hover:border-brand-500 hover:text-brand-600 px-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{locale === "ar" ? "تطبيق" : "Apply"}</span>
        </Button>
      </form>

      {currentError && (
        <div className="flex items-center gap-1.5 text-xs text-semantic-error ps-1 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{currentError}</span>
        </div>
      )}
    </div>
  );
}

export default CouponInput;
