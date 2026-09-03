"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { Button } from "@/components/ui/Button";
import { SearchX, AlertTriangle, RotateCcw, PackageOpen } from "lucide-react";

export interface CatalogGridProps {
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onResetFilters?: () => void;
  onAddToCart?: (product: Product) => void;
  skeletonCount?: number;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * CatalogGrid: Responsive marketplace grid adhering to the 16px margins & gutters
 * specification with a full 4-state lifecycle (Default, Loading Skeleton, Empty, Error + Retry).
 */
export function CatalogGrid({
  products,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onResetFilters,
  onAddToCart,
  skeletonCount = 6,
  className,
  emptyTitle,
  emptyDescription,
}: CatalogGridProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  // State 1: Loading Skeleton State
  if (isLoading) {
    return (
      <div
        className={cn(
          // Responsive Grid: 2 cols on mobile (320px+), 3 on tablet (640px+), 4 on laptop (1024px+), 5 on desktop (1280px+), 6 on wide (1536px+)
          "w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 px-3 sm:px-6 lg:px-8 xl:px-12 py-2",
          className
        )}
        aria-busy="true"
        aria-label="Loading products"
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <ProductCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  // State 2: Error with Retry State
  if (isError) {
    return (
      <div
        className={cn(
          "w-full py-12 px-6 flex flex-col items-center justify-center text-center gap-4 bg-white rounded-2xl border border-red-100 mx-auto my-4 max-w-md sm:max-w-lg",
          className
        )}
        role="alert"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 text-semantic-error flex items-center justify-center shadow-soft-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            {t("common.error", "حدث خطأ أثناء تحميل المنتجات")}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            {errorMessage ||
              (locale === "ar"
                ? "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً."
                : "Unable to load products. Please check your network connection and try again.")}
          </p>
        </div>

        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            {t("common.retry", "إعادة المحاولة")}
          </Button>
        )}
      </div>
    );
  }

  // State 3: Empty Results State
  if (!products || products.length === 0) {
    return (
      <div
        className={cn(
          "w-full py-12 px-6 flex flex-col items-center justify-center text-center gap-4 bg-white rounded-2xl border border-neutral-200/80 mx-auto my-4 max-w-md sm:max-w-lg",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center shadow-soft-sm">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            {emptyTitle || t("catalog.emptySearchTitle", "لم نجد أي منتجات")}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            {emptyDescription ||
              t(
                "catalog.emptySearchDesc",
                "جرب البحث بكلمات أخرى أو قم بإلغاء بعض معايير التصفية."
              )}
          </p>
        </div>

        {onResetFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<PackageOpen className="w-4 h-4" />}
            className="min-h-[44px]"
          >
            {t("catalog.clearFilter", "عرض جميع المنتجات")}
          </Button>
        )}
      </div>
    );
  }

  // State 4: Default Active Grid State
  return (
    <div
      className={cn(
        // Fluid multi-column responsive grid: 2 on mobile (320px+), 3 on tablet (640px+), 4 on laptop (1024px+), 5 on desktop (1280px+), 6 on wide (1536px+)
        "w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 px-3 sm:px-6 lg:px-8 xl:px-12 py-2",
        className
      )}
      role="feed"
      aria-label="Product Catalog"
    >
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          priorityImage={idx < 4}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default CatalogGrid;

