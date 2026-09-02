"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, Check, Sparkles, AlertCircle } from "lucide-react";

export interface ProductCardProps {
  product: Product;
  className?: string;
  onAddToCart?: (product: Product) => void;
  priorityImage?: boolean;
}

/**
 * ProductCard: Core catalog card following Souqi Stitch Design System specifications:
 * - 20px radius card with soft elevation and hover depth
 * - 1:1 Aspect ratio image container
 * - 2-Line clamp title in Cairo font
 * - Tabular numbers for price in Inter font
 * - Semantic stock status badges (Available, Low Stock with count, Out of stock)
 * - Accessible Quick Add CTA with single-seller cart handling and tactile feedback
 */
export function ProductCard({
  product,
  className,
  onAddToCart,
  priorityImage = false,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { isRtl, locale } = useLocale();
  const { addItem } = useCart();
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.stock_state === "out_of_stock";
  const isLowStock = product.stock_state === "low_stock";
  const currencySymbol = t("common.currency", "₪");

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const result = addItem(product, 1);

    if (onAddToCart) {
      onAddToCart(product);
    }

    if (result.success) {
      setIsAddedRecently(true);
      setTimeout(() => {
        setIsAddedRecently(false);
        setIsAdding(false);
      }, 1500);
    } else {
      setIsAdding(false);
    }
  };

  const imageSrc =
    product.primary_image ||
    (product.images && product.images.length > 0 ? product.images[0].image : "") ||
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80";

  return (
    <div
      className={cn(
        "group relative bg-white rounded-card border border-neutral-200/90 p-3 flex flex-col justify-between shadow-soft-sm hover:shadow-soft-md hover:-translate-y-1 transition-all duration-200 overflow-hidden select-none",
        isOutOfStock && "opacity-85",
        className
      )}
    >
      {/* Card Content Top Container */}
      <div className="flex flex-col gap-2.5">
        {/* 1:1 Aspect Ratio Image Container */}
        <Link
          href={`/${locale}/products/${product.id}`}
          className="relative w-full aspect-square bg-neutral-100 rounded-2xl overflow-hidden block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={product.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={product.name}
            loading={priorityImage ? "eager" : "lazy"}
            className={cn(
              "w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300",
              isOutOfStock && "grayscale-[40%]"
            )}
          />

          {/* Top Floating Badges */}
          <div className="absolute top-2 start-2 end-2 flex items-center justify-between gap-1 pointer-events-none z-10">
            {/* Left/Start Badge (AI Suggestion or Category) */}
            {product.is_ai_suggested ? (
              <span className="inline-flex items-center gap-1 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-pill shadow-glow">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{t("catalog.aiSuggested", "اقتراح ذكي")}</span>
              </span>
            ) : product.is_featured ? (
              <span className="inline-flex items-center bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-pill shadow-sm">
                {t("catalog.bestSeller", "مميز")}
              </span>
            ) : (
              <span />
            )}

            {/* Right/End Stock State Badge */}
            {isOutOfStock ? (
              <span className="inline-flex items-center bg-neutral-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-pill backdrop-blur-sm">
                {t("catalog.outOfStock", "نفد")}
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-pill">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>
                  {product.available_quantity
                    ? locale === "ar"
                      ? `بقي ${product.available_quantity}`
                      : `${product.available_quantity} left`
                    : t("catalog.lowStock", "محدود")}
                </span>
              </span>
            ) : null}
          </div>
        </Link>

        {/* Product Metadata Details */}
        <div className="flex flex-col gap-1 text-start">
          {/* Seller Name & Category */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 gap-1">
            <span className="truncate max-w-[65%] font-medium">
              {product.seller_name || product.seller?.business_name || ""}
            </span>
            {product.category?.name && (
              <span className="truncate text-neutral-400 text-[10px]">
                {product.category.name}
              </span>
            )}
          </div>

          {/* 2-line Title Clamp in Cairo */}
          <Link
            href={`/${locale}/products/${product.id}`}
            className="focus:outline-none focus-visible:underline"
          >
            <h3 className="font-cairo font-bold text-[13px] sm:text-sm text-neutral-900 leading-snug line-clamp-2 min-h-[36px] group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Card Bottom: Price and Quick Add Action */}
      <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-neutral-100/90">
        {/* Price Row in Inter font */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1 text-start">
            <span className="font-inter font-black text-base text-brand-600 tracking-tight">
              {parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-neutral-600 font-cairo">
              {currencySymbol}
            </span>
          </div>

          {product.unit && (
            <span className="text-[10px] text-neutral-400 truncate max-w-[70px]">
              /{product.unit.replace(/^(علبة|عبوة|طقم|مرطبان|كيس|زجاجة|قطعة)\s*\/?\s*/, "")}
            </span>
          )}
        </div>

        {/* Quick Add CTA Button */}
        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={handleQuickAdd}
          aria-label={
            isOutOfStock
              ? t("catalog.outOfStock", "غير متوفر حالياً")
              : `${t("catalog.addToCart", "إضافة للسلة")} - ${product.name}`
          }
          className={cn(
            "w-full h-9 rounded-xl font-cairo text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 select-none active:scale-[0.97]",
            isOutOfStock
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200/60"
              : isAddedRecently
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
              : "bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white border border-brand-200/80 hover:border-brand-500 hover:shadow-glow"
          )}
        >
          {isOutOfStock ? (
            <span>{t("catalog.unavailable", "غير متوفر")}</span>
          ) : isAddedRecently ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t("catalog.addedToCart", "تمت الإضافة")}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{t("catalog.addToCart", "إضافة")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
