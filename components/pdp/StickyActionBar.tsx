"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ShoppingBag, Check, AlertCircle } from "lucide-react";
import type { Product, StockState } from "@/types/catalog";

export interface StickyActionBarProps {
  product: Product;
  selectedVariantDelta?: number;
  selectedVariantName?: string;
  className?: string;
}

export function StickyActionBar({
  product,
  selectedVariantDelta = 0,
  selectedVariantName,
  className,
}: StickyActionBarProps) {
  const { direction, t } = useLocale();
  const isRtl = direction === "rtl";
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute unit and total price
  const basePriceNum = typeof product.price === "string" ? parseFloat(product.price) || 0 : Number(product.price) || 0;
  const unitPrice = Math.max(0, basePriceNum + selectedVariantDelta);
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const currency = t("common.currency", "₪");

  // Stock check
  const availableStock = product.available_quantity ?? product.stock_quantity ?? (product.stock_state === "out_of_stock" ? 0 : 99);
  const isOutOfStock = product.stock_state === "out_of_stock" || availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isSubmitting) return;

    setIsSubmitting(true);

    const productToAdd = {
      ...product,
      price: unitPrice.toFixed(2),
      name: selectedVariantName ? `${product.name} (${selectedVariantName})` : product.name,
    };

    const result = addItem(productToAdd, quantity);

    setIsSubmitting(false);

    if (result && result.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  return (
    <div
      role="region"
      aria-label="شريط الشراء السريع"
      className={cn(
        "fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 p-3.5 pb-safe shadow-soft-xl flex items-center justify-between gap-3 select-none transition-all",
        className
      )}
    >
      {/* Quantity Stepper & Price Column */}
      <div className="flex items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={isOutOfStock ? 1 : Math.max(1, availableStock)}
          disabled={isOutOfStock}
          size="default"
        />

        <div className="flex flex-col text-start leading-tight">
          <span className="text-[11px] font-medium text-neutral-500">
            {t("pdp.total", "الإجمالي")}
          </span>
          <div className="flex items-baseline gap-0.5 text-brand-600">
            <span className="text-base sm:text-lg font-extrabold numeric-data">
              {totalPrice}
            </span>
            <span className="text-xs font-bold">{currency}</span>
          </div>
        </div>
      </div>

      {/* Add to Cart CTA Button */}
      <button
        type="button"
        disabled={isOutOfStock || isSubmitting}
        onClick={handleAddToCart}
        aria-label={isOutOfStock ? t("catalog.outOfStock", "غير متوفر حالياً") : t("catalog.addToCart", "إضافة إلى السلة")}
        className={cn(
          "flex-1 h-11 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-soft active:scale-98 focus-visible:ring-2 focus-visible:ring-brand-500",
          isOutOfStock
            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
            : isAdded
            ? "bg-semantic-success text-white shadow-emerald-500/20"
            : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25"
        )}
      >
        {isOutOfStock ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>{t("catalog.outOfStock", "نفدت الكمية")}</span>
          </>
        ) : isAdded ? (
          <>
            <Check className="w-4 h-4 stroke-[2.5] animate-in zoom-in-50 duration-200" />
            <span>{t("catalog.addedToCart", "تمت الإضافة")}</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>{t("catalog.addToCart", "إضافة للسلة")}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default StickyActionBar;
