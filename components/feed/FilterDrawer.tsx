"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import type { Category, StockState } from "@/types/catalog";
import { Check, Filter, RotateCcw, ArrowUpDown, Tag, DollarSign, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterValues {
  category: number | null;
  stock_state: StockState | "all";
  ordering: "price" | "-price" | "created_at" | "-created_at" | "";
  minPrice: number | "";
  maxPrice: number | "";
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
  const { isRtl } = useLocale();

  const [category, setCategory] = useState<number | null>(initialFilters.category);
  const [stockState, setStockState] = useState<StockState | "all">(initialFilters.stock_state || "all");
  const [ordering, setOrdering] = useState<FilterValues["ordering"]>(initialFilters.ordering || "-created_at");
  const [minPrice, setMinPrice] = useState<number | "">(initialFilters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(initialFilters.maxPrice ?? "");

  // Sync state with incoming initialFilters when drawer opens
  useEffect(() => {
    if (isOpen) {
      setCategory(initialFilters.category);
      setStockState(initialFilters.stock_state || "all");
      setOrdering(initialFilters.ordering || "-created_at");
      setMinPrice(initialFilters.minPrice ?? "");
      setMaxPrice(initialFilters.maxPrice ?? "");
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply({
      category,
      stock_state: stockState,
      ordering,
      minPrice,
      maxPrice,
    });
    onClose();
  };

  const handleReset = () => {
    setCategory(null);
    setStockState("all");
    setOrdering("-created_at");
    setMinPrice("");
    setMaxPrice("");
    onReset();
    onClose();
  };

  const sortOptions = [
    { value: "-created_at", labelAr: "الأحدث إضافة", labelEn: "Newest Arrivals" },
    { value: "price", labelAr: "السعر: من الأقل للأعلى", labelEn: "Price: Low to High" },
    { value: "-price", labelAr: "السعر: من الأعلى للأقل", labelEn: "Price: High to Low" },
  ];

  const stockOptions: { value: StockState | "all"; labelAr: string; labelEn: string }[] = [
    { value: "all", labelAr: "جميع الحالات", labelEn: "All Stock" },
    { value: "available", labelAr: "متوفر فقط", labelEn: "In Stock Only" },
    { value: "low_stock", labelAr: "كمية محدودة", labelEn: "Low Stock" },
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
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Price Range */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-brand-500" />
            <span>{t("catalog.filterByPrice", "نطاق السعر (شيكل)")}</span>
          </label>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <Input
                type="number"
                min={0}
                placeholder={isRtl ? "من (الأدنى)" : "Min price"}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                size="sm"
              />
            </div>
            <div>
              <Input
                type="number"
                min={0}
                placeholder={isRtl ? "إلى (الأقصى)" : "Max price"}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* 4. Availability / Stock Filter */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>{t("catalog.filterByAvailability", "حالة التوفر")}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {stockOptions.map((opt) => {
              const isSelected = stockState === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStockState(opt.value)}
                  className={cn(
                    "px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-all select-none text-center",
                    isSelected
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  {isRtl ? opt.labelAr : opt.labelEn}
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
