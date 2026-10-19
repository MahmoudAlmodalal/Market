"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { getLocalizedCategoryName } from "@/lib/i18n/catalogTranslations";
import {
  Sparkles,
  Droplet,
  Scissors,
  Coffee,
  Heart,
  Cake,
  Sun,
  Package,
  ShoppingBag,
  Feather,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, LucideIcon> = {
  Droplet,
  Sparkles,
  Scissors,
  Coffee,
  Heart,
  Cake,
  Sun,
  Package,
  ShoppingBag,
  Feather,
  LayoutGrid,
};

export interface CategoryFilterStripProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  showAllOption?: boolean;
  className?: string;
}

/**
 * CategoryFilterStrip: Horizontal scrollable pill strip for quick category switching.
 * Full RTL/LTR direction support, active state feedback, and touch-friendly targets.
 */
export function CategoryFilterStrip({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
  className,
}: CategoryFilterStripProps) {
  const { t } = useTranslation();
  const { direction, locale } = useLocale();
  const isRtl = direction === "rtl";
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" /> : null;
  };

  return (
    <div
      className={cn("w-full relative py-1", className)}
      role="region"
      aria-label={t("catalog.categories", "التصنيفات")}
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-3 sm:px-6 lg:px-8 xl:px-12 scroll-smooth"
        tabIndex={0}
        role="tablist"
        aria-orientation="horizontal"
      >
        {/* "All" Option */}
        {showAllOption && (
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === null}
            onClick={() => onSelectCategory(null)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-pill text-xs sm:text-sm font-semibold transition-all duration-200 border select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500",
              selectedCategoryId === null
                ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                : "bg-white text-neutral-700 border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 shadow-soft-sm"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t("common.all", "الكل")}</span>
          </button>
        )}

        {/* Dynamic Categories */}
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const Icon = getCategoryIcon(category.icon);

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-pill text-xs sm:text-sm font-semibold transition-all duration-200 border select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500",
                isSelected
                  ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                  : "bg-white text-neutral-700 border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 shadow-soft-sm"
              )}
            >
              {Icon && <span className={cn(isSelected ? "text-white" : "text-brand-500")}>{Icon}</span>}
              <span>{getLocalizedCategoryName(category.name, locale)}</span>
              {category.product_count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold font-inter",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {category.product_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilterStrip;
