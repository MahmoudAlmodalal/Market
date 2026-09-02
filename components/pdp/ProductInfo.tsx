"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import { Badge } from "@/components/ui/Badge";
import {
  Heart,
  Share2,
  Sparkles,
  Tag,
  Star,
  Globe,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { Product, StockState } from "@/types/catalog";

export interface ProductInfoProps {
  product: Product & {
    title_ar?: string;
    title_en?: string;
    description_ar?: string;
    description_en?: string;
    serverPriceString?: string;
    original_price?: string | number;
    rating?: number;
    review_count?: number;
  };
  rating?: number;
  reviewCount?: number;
  onReviewsClick?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ProductInfo({
  product,
  rating = 4.9,
  reviewCount = 12,
  onReviewsClick,
  onShare,
  className,
}: ProductInfoProps) {
  const { locale, direction, t } = useLocale();
  const isRtl = direction === "rtl";

  const [activeLang, setActiveLang] = useState<"ar" | "en">(locale === "en" ? "en" : "ar");
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallbacks for bilingual title and description
  const titleArabic = product.title_ar || product.name;
  const titleEnglish = product.title_en || product.name;
  const displayTitle = activeLang === "ar" ? titleArabic : (product.title_en ? titleEnglish : titleArabic);

  const descArabic =
    product.description_ar ||
    product.description ||
    "منتج محلي أصيل مصنوع يدوياً بعناية فائقة وفق أعلى معايير الجودة من المشاريع المنزلية والحرفية.";
  const descEnglish =
    product.description_en ||
    product.description ||
    "Authentic local artisan product handcrafted with natural materials and traditional care.";
  const displayDescription = activeLang === "ar" ? descArabic : descEnglish;

  // Price formatting
  const numericPrice = typeof product.price === "string" ? parseFloat(product.price) : Number(product.price);
  const formattedPrice = !isNaN(numericPrice) ? numericPrice.toFixed(2) : "0.00";
  const currencySymbol = t("common.currency", "₪");

  // Stock status resolution
  const stockQuantity = product.available_quantity ?? product.stock_quantity ?? (product.stock_state === "out_of_stock" ? 0 : 10);
  const isLowStock = product.stock_state === "low_stock" || (stockQuantity > 0 && stockQuantity <= 5);
  const isOutOfStock = product.stock_state === "out_of_stock" || stockQuantity <= 0;

  const productRating = product.rating ?? rating;
  const productReviewCount = product.review_count ?? reviewCount;

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: displayDescription,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {/* Category, Status & Floating Social Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {product.category?.name && (
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-pill border border-brand-200/80">
              {product.category.name}
            </span>
          )}

          {product.is_ai_suggested && (
            <Badge variant="ai" size="sm">
              <Sparkles className="w-3 h-3 me-1 inline" />
              {t("catalog.aiSuggested", "اقتراح ذكي")}
            </Badge>
          )}

          {isOutOfStock ? (
            <Badge variant="error" size="sm" dot>
              {t("catalog.outOfStock", "غير متوفر حالياً")}
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm" dot>
              {t("catalog.lowStockCount", { count: stockQuantity }, `متبقي ${stockQuantity} فقط`)}
            </Badge>
          ) : (
            <Badge variant="success" size="sm" dot>
              {t("catalog.inStock", "متوفر")}
            </Badge>
          )}
        </div>

        {/* Action Buttons: Favorite & Share */}
        <div className="flex items-center gap-1.5 ms-auto">
          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className={cn(
              "p-2 rounded-xl border transition-all active:scale-95",
              isFavorite
                ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
            )}
          >
            <Heart
              className={cn("w-4 h-4 transition-transform", isFavorite && "fill-current scale-110")}
            />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="مشاركة رابط المنتج"
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 active:scale-95 transition-all relative"
          >
            {copied ? <Check className="w-4 h-4 text-semantic-success" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Title */}
      <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-snug tracking-tight font-cairo">
        {displayTitle}
      </h1>

      {/* Star Rating & Review Count Link */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReviewsClick}
          className="flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 group transition-colors"
        >
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-extrabold numeric-data text-neutral-900">
              {productRating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-semibold text-neutral-500 group-hover:text-brand-600 underline underline-offset-2 numeric-data">
            ({productReviewCount} {t("pdp.reviews", "تقييم")})
          </span>
        </button>
      </div>

      {/* Price & Unit Block */}
      <div className="flex items-baseline gap-2.5 pb-2 border-b border-neutral-100">
        <div className="flex items-baseline gap-1 text-brand-600">
          <span className="text-2xl sm:text-3xl font-extrabold numeric-data tracking-tight">
            {formattedPrice}
          </span>
          <span className="text-base font-bold">{currencySymbol}</span>
        </div>

        {product.unit && (
          <span className="text-xs font-medium text-neutral-500">
            / {product.unit}
          </span>
        )}

        {product.original_price && (
          <span className="text-sm font-medium text-neutral-400 line-through numeric-data ms-2">
            {Number(product.original_price).toFixed(2)} {currencySymbol}
          </span>
        )}
      </div>

      {/* Tags Strip */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          {product.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium text-neutral-600 bg-neutral-100/90 hover:bg-neutral-200/80 px-2.5 py-0.5 rounded-pill transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bilingual Description Block */}
      <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70 flex flex-col gap-3">
        {/* Toggle Language Header */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200/60 pb-2.5">
          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-500" />
            <span>{t("pdp.description", "الوصف")}</span>
          </span>

          <div
            role="tablist"
            aria-label="لغة الوصف"
            className="inline-flex items-center bg-white rounded-lg p-0.5 border border-neutral-200/80 shadow-2xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeLang === "ar"}
              onClick={() => setActiveLang("ar")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                activeLang === "ar"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              العربية
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeLang === "en"}
              onClick={() => setActiveLang("en")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                activeLang === "en"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              English
            </button>
          </div>
        </div>

        {/* Description Text */}
        <p
          dir={activeLang === "ar" ? "rtl" : "ltr"}
          className={cn(
            "text-xs sm:text-sm text-neutral-700 leading-relaxed",
            activeLang === "ar" ? "font-cairo text-start" : "font-sans text-start"
          )}
        >
          {displayDescription}
        </p>
      </div>
    </div>
  );
}

export default ProductInfo;
