"use client";

import React, { useState } from "react";
import { Tag, Check, X, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PricingBreakdown as PricingBreakdownType } from "@/types/cart";

export interface OrderPricingBreakdownProps {
  breakdown?: PricingBreakdownType;
  showVoucherInput?: boolean;
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
  className?: string;
}

/**
 * OrderPricingBreakdown displays server-authoritative bill breakdown:
 * - Subtotal
 * - Dynamic delivery fee
 * - VAT inclusion notice
 * - Interactive voucher code input with Apply/Remove states
 * - Discount deduction
 * - Final Total
 * - Optional primary checkout CTA button
 */
export function OrderPricingBreakdown({
  breakdown: customBreakdown,
  showVoucherInput = true,
  showCheckoutButton = false,
  onCheckout,
  checkoutDisabled = false,
  checkoutLabel,
  className,
}: OrderPricingBreakdownProps) {
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const {
    cart,
    voucherCode,
    voucherError,
    applyVoucher,
    removeVoucher,
    hasBlockingIssues,
    getPricingBreakdown,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Compute breakdown from context if not provided
  const breakdown = customBreakdown || getPricingBreakdown();

  const subtotalNum = parseFloat(breakdown.subtotal || cart.subtotal || "0");
  const deliveryFeeNum = parseFloat(breakdown.delivery_fee || cart.estimated_delivery || "0");
  const discountNum = parseFloat(breakdown.discount || cart.discount_amount || "0");
  const totalNum = parseFloat(breakdown.total || cart.total || "0");

  const isVoucherApplied = Boolean(voucherCode && discountNum > 0);
  const currentVoucherError = localError || voucherError || breakdown.voucher_error;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsApplying(true);
    setLocalError(null);

    const res = applyVoucher(inputCode);
    if (!res.success) {
      setLocalError(res.error || (locale === "ar" ? "رمز القسيمة غير صالح" : "Invalid voucher code"));
    } else {
      setInputCode("");
    }
    setIsApplying(false);
  };

  const handleRemoveVoucher = () => {
    removeVoucher();
    setInputCode("");
    setLocalError(null);
  };

  const canCheckout = !hasBlockingIssues && !checkoutDisabled && cart.items.length > 0;

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-5 shadow-sm flex flex-col gap-4 transition-all text-start",
        className
      )}
    >
      <h3 className="text-sm font-bold text-neutral-900 flex items-center justify-between">
        <span>{t("checkout.orderSummary", t("cart.itemTotal", "تفاصيل الفاتورة"))}</span>
        <span className="text-xs font-normal text-neutral-400">
          {locale === "ar" ? "شامل ضريبة القيمة المضافة" : "VAT Included"}
        </span>
      </h3>

      {/* Line item prices */}
      <div className="flex flex-col gap-2.5 text-xs text-neutral-600 border-b border-neutral-100 pb-3.5">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">{t("cart.subtotal", "المجموع الفرعي")}</span>
          <span className="font-bold text-neutral-900 numeric-data">
            {subtotalNum.toFixed(2)} ₪
          </span>
        </div>

        {/* Delivery fee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-600">{t("cart.deliveryFee", "رسوم التوصيل")}</span>
            {deliveryFeeNum === 0 && (
              <Badge variant="success" size="sm">
                {locale === "ar" ? "توصيل مجاني" : "Free"}
              </Badge>
            )}
          </div>
          <span className="font-bold text-neutral-900 numeric-data">
            {deliveryFeeNum > 0 ? `${deliveryFeeNum.toFixed(2)} ₪` : (locale === "ar" ? "0.00 ₪" : "0.00 ₪")}
          </span>
        </div>

        {/* Discount (if any) */}
        {discountNum > 0 && (
          <div className="flex items-center justify-between text-semantic-success font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5">
              <span>{t("cart.discount", "خصم القسيمة")}</span>
              {voucherCode && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-50 border border-green-200 font-mono">
                  {voucherCode}
                </span>
              )}
            </div>
            <span className="numeric-data font-bold">
              -{discountNum.toFixed(2)} ₪
            </span>
          </div>
        )}
      </div>

      {/* Voucher Input & Applied Badge */}
      {showVoucherInput && (
        <div className="flex flex-col gap-2 pt-0.5">
          {isVoucherApplied ? (
            <div className="flex items-center justify-between bg-green-50/80 border border-green-200 rounded-xl p-2.5 text-xs text-green-900 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{voucherCode}</span>
                  <span className="text-[11px] text-green-700">
                    {locale === "ar" ? `تم تطبيق خصم ${discountNum.toFixed(2)} ₪` : `Discount of ${discountNum.toFixed(2)} ₪ applied`}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveVoucher}
                className="text-neutral-500 hover:text-semantic-error hover:bg-red-50 text-xs h-7 px-2"
                aria-label={locale === "ar" ? "إلغاء القسيمة" : "Remove voucher"}
              >
                <X className="w-3.5 h-3.5 me-1" />
                <span>{locale === "ar" ? "إلغاء" : "Remove"}</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleApplyVoucher} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      if (localError) setLocalError(null);
                    }}
                    placeholder={locale === "ar" ? "رمز القسيمة (مثال: SOUQI10)" : "Voucher code (e.g. SOUQI10)"}
                    startIcon={<Tag className="w-4 h-4" />}
                    variantSize="sm"
                    className="uppercase"
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={!inputCode.trim() || isApplying}
                  loading={isApplying}
                  className="shrink-0 h-10 px-4 font-bold border-neutral-300 text-neutral-800 hover:border-brand-500 hover:text-brand-600"
                >
                  {locale === "ar" ? "تطبيق" : "Apply"}
                </Button>
              </div>

              {currentVoucherError && (
                <div className="flex items-center gap-1.5 text-xs text-semantic-error mt-0.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentVoucherError}</span>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Grand Total */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-neutral-900">
            {t("cart.total", "المجموع النهائي")}
          </span>
          <span className="text-[11px] text-neutral-400">
            {locale === "ar" ? "الدفع عند الاستلام أو بالبطاقة" : "Cash on delivery or digital card"}
          </span>
        </div>

        <div className="text-end">
          <span className="text-lg sm:text-xl font-extrabold text-brand-600 numeric-data">
            {totalNum.toFixed(2)} ₪
          </span>
        </div>
      </div>

      {/* Blocking Issues Alert */}
      {hasBlockingIssues && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {t("cart.hasBlockingIssues", "يرجى معالجة التنبيهات الموضحة في السلة لمتابعة الطلب.")}
          </span>
        </div>
      )}

      {/* Optional Checkout CTA */}
      {showCheckoutButton && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canCheckout}
          onClick={onCheckout}
          className="mt-2 text-sm sm:text-base font-bold shadow-soft"
          rightIcon={
            direction === "rtl" ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )
          }
        >
          {checkoutLabel || t("cart.checkout", "متابعة لإتمام الطلب")}
        </Button>
      )}
    </div>
  );
}

export default OrderPricingBreakdown;
