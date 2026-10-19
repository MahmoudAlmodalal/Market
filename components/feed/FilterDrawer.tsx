"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { getLocalizedCategoryName } from "@/lib/i18n/catalogTranslations";
import type { Category, StockState } from "@/types/catalog";
import { Check, Filter, RotateCcw, ArrowUpDown, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterValues {
  category: number | null;
  ordering: "price" | "-price" | "created_at" | "-created_at" | "";
  stock_state?: StockState | "all";
  minPrice?: number | "";
  maxPrice?: number | "";
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialFilters: FilterValues;
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  initialFilters,
  onApply,
  onReset,
}: FilterDrawerProps) {
  const { t } = useTranslation();
  const { isRtl, locale } = useLocale();

  const [category, setCategory] = useState<number | null>(initialFilters.category);
  const [ordering, setOrdering] = useState<FilterValues["ordering"]>(initialFilters.ordering || "-created_at");

  // Sync state with incoming initialFilters when drawer opens
  useEffect(() => {
    if (isOpen) {
      setCategory(initialFilters.category);
      setOrdering(initialFilters.ordering || "-created_at");
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply({
      category,
      ordering,
    });
    onClose();
  };

  const handleReset = () => {
    setCategory(null);
    setOrdering("-created_at");
    onReset();
    onClose();
  };

  const sortOptions = [
    { value: "-created_at", labelAr: "الأحدث إضافة", labelEn: "Newest Arrivals" },
    { value: "price", labelAr: "السعر: من الأقل للأعلى", labelEn: "Price: Low to High" },
    { value: "-price", labelAr: "السعر: من الأعلى للأقل", labelEn: "Price: High to Low" },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <Filter className="w-4 h-4 text-brand-500" />
          <span>{t("catalog.filterBy", "تصفية المنتجات")}</span>
        </span>
      }
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="flex-1 text-xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {t("catalog.clearFilter", "إعادة ضبط")}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            className="flex-[2] text-xs font-bold"
          >
            {t("catalog.applyFilter", "تطبيق التصفية")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {/* 1. Sort Order */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-500" />
            <span>{t("catalog.sortBy", "الترتيب حسب")}</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {sortOptions.map((opt) => {
              const isSelected = ordering === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOrdering(opt.value as FilterValues["ordering"])}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all select-none text-start",
                    isSelected
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  <span>{isRtl ? opt.labelAr : opt.labelEn}</span>
                  {isSelected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Category Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-500" />
            <span>{t("catalog.filterByCategory", "التصنيف")}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-pill text-xs font-medium border transition-all select-none",
                category === null
                  ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
              )}
            >
              {t("common.all", "الكل")}
            </button>
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(isSelected ? null : cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-pill text-xs font-medium border transition-all select-none",
                    isSelected
                      ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  {getLocalizedCategoryName(cat.name, locale)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default FilterDrawer;
