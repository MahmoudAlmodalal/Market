"use client";

import React from "react";
import { Store, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface MultiSellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSellerName?: string;
  newSellerName?: string;
  onConfirmSwitch: () => void;
  onKeepCurrent: () => void;
  className?: string;
}

/**
 * MultiSellerDialog enforces the single-seller cart guarantee (OD04).
 * Confirms whether to discard the current cart and start a new cart from the newly selected merchant.
 */
export function MultiSellerDialog({
  isOpen,
  onClose,
  currentSellerName = "المتجر الحالي",
  newSellerName = "المتجر الجديد",
  onConfirmSwitch,
  onKeepCurrent,
  className,
}: MultiSellerDialogProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={true}
      title={
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{t("cart.multiSellerTitle", "تغيير المتجر في السلة")}</span>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            onClick={onKeepCurrent}
            className="text-neutral-700 hover:bg-neutral-100 order-2 sm:order-1"
          >
            {t("cart.keep_current_cart", t("cart.keepCurrent", "الإبقاء على السلة الحالية"))}
          </Button>

          <Button
            variant="primary"
            onClick={onConfirmSwitch}
            className="order-1 sm:order-2 bg-brand-500 hover:bg-brand-600 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {t(
                "cart.switch_seller_confirm",
                t("cart.clearAndSwitch", "تفريغ السلة وإضافة المنتج الجديد")
              )}
            </span>
          </Button>
        </div>
      }
    >
      <div className={cn("flex flex-col gap-4 text-start", className)}>
        {/* Warning text */}
        <p className="text-sm text-neutral-600 leading-relaxed">
          {t(
            "cart.multi_seller_warning",
            t(
              "cart.multiSellerMessage",
              { currentSeller: currentSellerName, newSeller: newSellerName },
              `سلتك تحتوي حالياً على منتجات من متجر "${currentSellerName}". هل ترغب في تفريغ السلة والبدء بالطلب من "${newSellerName}"؟`
            )
          )}
        </p>

        {/* Visual Seller Comparison Box */}
        <div className="grid grid-cols-1 gap-2.5 bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80">
          {/* Current Seller */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-neutral-400 font-medium">
                  {locale === "ar" ? "المتجر الحالي بالسلة:" : "Current Cart Seller:"}
                </span>
                <span className="text-xs font-bold text-neutral-800">
                  {currentSellerName}
                </span>
              </div>
            </div>
            <span className="text-xs text-neutral-400 line-through">
              {locale === "ar" ? "سيتم حذفه" : "Will be cleared"}
            </span>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center justify-center text-neutral-400">
            <span className="text-xs font-medium text-neutral-500">
              {locale === "ar" ? "الاستبدال بـ ↓" : "Switch to ↓"}
            </span>
          </div>

          {/* New Seller */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-50/70 border border-brand-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-brand-600 font-medium">
                  {locale === "ar" ? "المتجر الجديد:" : "New Store:"}
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  {newSellerName}
                </span>
              </div>
            </div>
            <span className="text-xs text-brand-600 font-semibold">
              {locale === "ar" ? "سلة جديدة" : "New Cart"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MultiSellerDialog;
