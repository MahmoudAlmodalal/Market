"use client";

import React from "react";
import { Store, ShieldCheck, MapPin, Trash2 } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CartSeller } from "@/types/cart";

export interface CartHeaderProps {
  seller?: CartSeller | null;
  onClearCart?: () => void;
  className?: string;
}

/**
 * CartHeader displays active single seller metadata (name, neighborhood),
 * single-seller cart guarantee info badge, and clear cart action.
 */
export function CartHeader({ seller, onClearCart, className }: CartHeaderProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { clearCart } = useCart();

  const activeSeller = seller;
  if (!activeSeller) {
    return null;
  }

  const handleClear = () => {
    if (onClearCart) {
      onClearCart();
    } else {
      clearCart();
    }
  };

  const sellerName = activeSeller.business_name || (locale === "ar" ? "متجر محلي" : "Local Merchant");
  const neighborhood = activeSeller.neighborhood || (locale === "ar" ? "غزة - حي الرمال" : "Gaza - Al-Rimal");

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm transition-all",
        className
      )}
    >
      {/* Top row: Store info & Clear cart */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shrink-0">
            <Store className="w-5 h-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-neutral-900 truncate">
                {sellerName}
              </h2>
              <Badge variant="primary" size="sm" className="hidden xs:inline-flex">
                {locale === "ar" ? "متجر معتمد" : "Verified"}
              </Badge>
            </div>

            {neighborhood && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 truncate mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{neighborhood}</span>
              </div>
            )}
          </div>
        </div>

        {/* Clear cart action */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-neutral-500 hover:text-semantic-error hover:bg-red-50 text-xs px-2.5 h-8 shrink-0"
          aria-label={t("cart.clearCart", "تفريغ السلة")}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("cart.clearCart", "تفريغ")}</span>
        </Button>
      </div>

      {/* Single-seller guarantee notice */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-start gap-2 text-xs text-neutral-600 bg-neutral-50/70 rounded-xl p-2.5">
        <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-neutral-800">
            {t("cart.single_seller_notice", { sellerName }, `منتجات من متجر: ${sellerName}`)}
          </span>
          <span className="text-[11px] text-neutral-500 leading-relaxed">
            {t("cart.singleSellerNotice", "الطلب في سوقي يتم من متجر واحد في المرة الواحدة لضمان سرعة وجودة التوصيل.")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartHeader;
