"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  CategoryFilterStrip,
  FilterDrawer,
  type FilterValues,
} from "@/components/feed";
import { CatalogGrid } from "@/components/catalog";
import {
  getLocalizedCategories,
} from "@/lib/mock/categories";
import {
  getLocalizedProducts,
  filterProductsAdvanced,
} from "@/lib/mock/products";
import type { StockState } from "@/types/catalog";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Tag,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

function CatalogContent() {
  const { t } = useTranslation();
  const { isRtl, locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query param parsing
  const initialCategoryParam = searchParams.get("category");
  const initialSearchParam = searchParams.get("search");
  const initialOrderingParam = searchParams.get("ordering") as FilterValues["ordering"];
  const initialStockParam = searchParams.get("stock_state") as StockState;

  // State
  const [searchQuery, setSearchQuery] = useState(initialSearchParam || "");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategoryParam ? parseInt(initialCategoryParam, 10) : null
  );
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({
    category: initialCategoryParam ? parseInt(initialCategoryParam, 10) : null,
    stock_state: initialStockParam || "all",
    ordering: initialOrderingParam || "-created_at",
    minPrice: "",
    maxPrice: "",
  });

  // Sync URL params when changed
  useEffect(() => {
    if (initialCategoryParam) {
      const catId = parseInt(initialCategoryParam, 10);
      setSelectedCategory(catId);
      setFilters((prev) => ({ ...prev, category: catId }));
    }
    if (initialSearchParam) {
      setSearchQuery(initialSearchParam);
    }
  }, [initialCategoryParam, initialSearchParam]);

  // Localized Data
  const categories = useMemo(() => getLocalizedCategories(locale), [locale]);
  const allProducts = useMemo(() => getLocalizedProducts(locale), [locale]);

  // Category Selection
  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({ ...prev, category: categoryId }));
  };

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    return filterProductsAdvanced(allProducts, {
      search: searchQuery,
      category: selectedCategory ?? (filters.category || undefined),
      stock_state: filters.stock_state === "all" ? undefined : filters.stock_state,
      ordering: filters.ordering === "" ? undefined : filters.ordering,
      minPrice: filters.minPrice === "" ? undefined : Number(filters.minPrice),
      maxPrice: filters.maxPrice === "" ? undefined : Number(filters.maxPrice),
    });
  }, [allProducts, searchQuery, selectedCategory, filters]);

  const handleApplyDrawerFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setSelectedCategory(newFilters.category);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilters({
      category: null,
      stock_state: "all",
      ordering: "-created_at",
      minPrice: "",
      maxPrice: "",
    });
  };

  const activeFiltersCount =
    (selectedCategory !== null ? 1 : 0) +
    (filters.stock_state !== "all" ? 1 : 0) +
    (filters.minPrice !== "" ? 1 : 0) +
    (filters.maxPrice !== "" ? 1 : 0) +
    (filters.ordering !== "-created_at" && filters.ordering !== "" ? 1 : 0);

  const sortOptions = [
    { value: "-created_at", labelAr: "الأحدث إضافة", labelEn: "Newest Arrivals" },
    { value: "price", labelAr: "السعر: من الأقل للأعلى", labelEn: "Price: Low to High" },
    { value: "-price", labelAr: "السعر: من الأعلى للأقل", labelEn: "Price: High to Low" },
  ];

  return (
    <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto flex flex-col gap-4 sm:gap-6 pb-24 md:pb-12 pt-2 sm:pt-4 px-3 sm:px-6 lg:px-8 xl:px-12">
      {/* 1. Header & Search Input */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5 text-start">
          <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 leading-tight">
            {t("catalog.allProducts", "كتالوج المنتجات")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {locale === "ar"
              ? "استكشف مئات المنتجات البلدية والمشغولات اليدوية الأصيلة"
              : "Browse hundreds of artisan & handcrafted local treasures"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1">
            <Input
              placeholder={t("catalog.searchPlaceholder", "ابحث عن منتج، متجر، أو تصنيف...")}
              startIcon={<Search className="w-4 h-4 text-neutral-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              clearable
              onClear={() => setSearchQuery("")}
              className="rounded-pill bg-white shadow-soft-sm text-xs sm:text-sm h-11 sm:h-12"
            />
          </div>

          {/* Filter Drawer button (visible on mobile/tablet < 1024px) */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={cn(
              "lg:hidden min-h-[44px] min-w-[44px] h-11 px-3.5 shrink-0 rounded-2xl bg-white border shadow-soft-sm flex items-center gap-1.5 text-xs font-bold transition-all select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500",
              activeFiltersCount > 0
                ? "border-brand-500 text-brand-600 bg-brand-50"
                : "border-neutral-200/90 text-neutral-700 hover:text-brand-600"
            )}
            aria-label={t("catalog.filterBy", "تصفية")}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t("common.filter", "تصفية")}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-inter">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pill Strip for Mobile/Tablet */}
      <div className="w-full lg:hidden">
        <CategoryFilterStrip
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* 3. Main Catalog Content: Responsive 2-column layout on Desktop (lg:) */}
      <div className="flex items-start gap-8">
        {/* Desktop Sticky Filter Sidebar (>=1024px / lg:) */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-20 bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-soft space-y-5 text-start">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-bold text-neutral-900">
                {t("catalog.filterBy", "تصفية المنتجات")}
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                {t("catalog.clearFilter", "إعادة ضبط")}
              </button>
            )}
          </div>

          {/* Category Filter List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-700">
              {t("catalog.categories", "التصنيفات")}
            </h3>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleSelectCategory(null)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl text-xs font-semibold text-start transition-all flex items-center justify-between",
                  selectedCategory === null
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <span>{t("common.all", "جميع التصنيفات")}</span>
                {selectedCategory === null && <Check className="w-3.5 h-3.5 text-brand-500" />}
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-xs font-semibold text-start transition-all flex items-center justify-between",
                    selectedCategory === c.id
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span className="truncate">{c.name}</span>
                  {selectedCategory === c.id && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-700">
              {locale === "ar" ? "حالة التوفر بالمخزون" : "Availability"}
            </h3>
            <div className="flex flex-col gap-1">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "available", labelAr: "متوفر فقط", labelEn: "In Stock" },
                { id: "low_stock", labelAr: "كميات محدودة", labelEn: "Low Stock" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      stock_state: s.id as StockState,
                    }))
                  }
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-xs font-semibold text-start transition-all flex items-center justify-between",
                    filters.stock_state === s.id
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span>{locale === "ar" ? s.labelAr : s.labelEn}</span>
                  {filters.stock_state === s.id && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-700">
              {locale === "ar" ? "نطاق السعر (₪)" : "Price Range (₪)"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={locale === "ar" ? "من" : "Min"}
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-inter focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder={locale === "ar" ? "إلى" : "Max"}
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-inter focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </aside>

        {/* Right Main Column: Sort Controls, Active Badges, and Product Grid */}
        <main className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-neutral-700 font-cairo">
              {locale === "ar"
                ? `عرض ${filteredProducts.length} من أصل ${allProducts.length} منتج`
                : `Showing ${filteredProducts.length} of ${allProducts.length} products`}
            </span>

            {/* Quick Sort Dropdown Trigger with 44px touch target */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] sm:min-h-[44px] rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold hover:border-neutral-300 shadow-soft-sm select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-500" />
                <span>
                  {
                    sortOptions.find((o) => o.value === filters.ordering)?.[
                      isRtl ? "labelAr" : "labelEn"
                    ] || t("catalog.sortBy", "الترتيب")
                  }
                </span>
              </button>

              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute end-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-soft-lg border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    {sortOptions.map((opt) => {
                      const isSelected = filters.ordering === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              ordering: opt.value as FilterValues["ordering"],
                            }));
                            setShowSortDropdown(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between text-start transition-colors min-h-[44px]",
                            isSelected
                              ? "bg-brand-50 text-brand-700 font-bold"
                              : "text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          <span>{isRtl ? opt.labelAr : opt.labelEn}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-500" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active Filter Badges Strip */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {/* Active Category Tag */}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1 rounded-pill">
                  <Tag className="w-3 h-3" />
                  <span>
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(null)}
                    className="p-0.5 hover:bg-brand-200/50 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Active Stock State Tag */}
              {filters.stock_state !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold px-3 py-1 rounded-pill">
                  <span>
                    {filters.stock_state === "available"
                      ? t("catalog.inStock", "متوفر")
                      : t("catalog.lowStock", "كمية محدودة")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, stock_state: "all" }))
                    }
                    className="p-0.5 hover:bg-neutral-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Active Price Range Tag */}
              {(filters.minPrice !== "" || filters.maxPrice !== "") && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold px-3 py-1 rounded-pill font-inter">
                  <span>
                    {filters.minPrice !== "" ? `${filters.minPrice}₪` : "0₪"} -{" "}
                    {filters.maxPrice !== "" ? `${filters.maxPrice}₪` : "∞"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }))
                    }
                    className="p-0.5 hover:bg-neutral-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Reset All Filters Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-neutral-500 hover:text-brand-600 underline px-1.5 py-1"
              >
                {t("catalog.clearFilter", "مسح الكل")}
              </button>
            </div>
          )}

          {/* Products Grid */}
          <CatalogGrid
            products={filteredProducts}
            onResetFilters={handleResetFilters}
            className="px-0"
            emptyTitle={t("catalog.emptySearchTitle", "لم نجد منتجات تطابق بحثك")}
            emptyDescription={
              searchQuery
                ? `${locale === "ar" ? "لا توجد نتائج تطابق" : "No results for"} "${searchQuery}"`
                : undefined
            }
          />
        </main>
      </div>

      {/* Filter Drawer for Mobile */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        initialFilters={filters}
        onApply={handleApplyDrawerFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-neutral-400">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}

