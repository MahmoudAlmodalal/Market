"use client";

import React, { useState, useMemo } from "react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CategoryFilterStrip,
  HeroCarousel,
  StoriesStrip,
  FilterDrawer,
  type FilterValues,
} from "@/components/feed";
import { CatalogGrid } from "@/components/catalog";
import {
  getLocalizedCategories,
  MOCK_CATEGORIES,
} from "@/lib/mock/categories";
import {
  getLocalizedProducts,
  filterProductsAdvanced,
} from "@/lib/mock/products";
import {
  getLocalizedStories,
  getLocalizedBanners,
} from "@/lib/mock/stories";
import type { Product } from "@/types/catalog";
import { Search, SlidersHorizontal, Sparkles, Flame, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { t } = useTranslation();
  const { isRtl, locale } = useLocale();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "ai">("all");

  const [filters, setFilters] = useState<FilterValues>({
    category: null,
    stock_state: "all",
    ordering: "-created_at",
    minPrice: "",
    maxPrice: "",
  });

  // Localized Mock Data
  const categories = useMemo(() => getLocalizedCategories(locale), [locale]);
  const banners = useMemo(() => getLocalizedBanners(locale), [locale]);
  const stories = useMemo(() => getLocalizedStories(locale), [locale]);
  const allProducts = useMemo(() => getLocalizedProducts(locale), [locale]);

  // Handle Category selection from pill strip
  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({ ...prev, category: categoryId }));
  };

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    let result = filterProductsAdvanced(allProducts, {
      search: searchQuery,
      category: selectedCategory ?? (filters.category || undefined),
      stock_state: filters.stock_state === "all" ? undefined : filters.stock_state,
      ordering: filters.ordering === "" ? undefined : filters.ordering,
      minPrice: filters.minPrice === "" ? undefined : Number(filters.minPrice),
      maxPrice: filters.maxPrice === "" ? undefined : Number(filters.maxPrice),
    });

    if (activeTab === "featured") {
      result = result.filter((p) => p.is_featured);
    } else if (activeTab === "ai") {
      result = result.filter((p) => p.is_ai_suggested);
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, filters, activeTab]);

  const handleApplyDrawerFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setSelectedCategory(newFilters.category);
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setActiveTab("all");
    setFilters({
      category: null,
      stock_state: "all",
      ordering: "-created_at",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-20 pt-2">
      {/* 1. Search Bar with Filter Drawer Trigger */}
      <div className="px-4 flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder={t("catalog.searchPlaceholder", "ابحث عن منتج، متجر، أو تصنيف...")}
            startIcon={<Search className="w-4 h-4 text-neutral-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            clearable
            onClear={() => setSearchQuery("")}
            className="rounded-pill bg-white shadow-soft-sm text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          className="h-11 w-11 shrink-0 rounded-2xl bg-white border border-neutral-200/90 shadow-soft-sm flex items-center justify-center text-neutral-700 hover:text-brand-600 hover:border-brand-300 active:scale-95 transition-all"
          aria-label={t("catalog.filterBy", "تصفية")}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Merchant Highlights Stories Strip */}
      <div className="w-full">
        <div className="px-4 pb-1 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-800">
            {locale === "ar" ? "قصص وتحديثات التجار" : "Merchant Stories"}
          </span>
          <span className="text-[10px] text-brand-500 font-semibold">
            {locale === "ar" ? "طازج اليوم" : "Fresh Today"}
          </span>
        </div>
        <StoriesStrip stories={stories} />
      </div>

      {/* 3. Hero Promotional Banners Carousel */}
      <div className="w-full">
        <HeroCarousel banners={banners} />
      </div>

      {/* 4. Horizontal Category Filter Strip */}
      <div className="w-full flex flex-col gap-1">
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800">
            {t("catalog.categories", "التصنيفات المميزة")}
          </h2>
          <Link
            href={`/${locale}/catalog`}
            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
          >
            <span>{t("common.viewAll", "عرض الكل")}</span>
            {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          </Link>
        </div>

        <CategoryFilterStrip
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* 5. Feed Section Header & Segment Tabs */}
      <div className="px-4 flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold text-neutral-900">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || t("catalog.allProducts", "المنتجات")
                : t("catalog.featuredProducts", "منتجات مختارة لك")}
            </h2>
          </div>

          <span className="text-[11px] font-bold text-neutral-500 font-inter">
            {filteredProducts.length} {locale === "ar" ? "منتج" : "items"}
          </span>
        </div>

        {/* Quick Segment Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {t("common.all", "الكل")}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === "featured"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <span>{t("catalog.bestSeller", "الأكثر طلباً")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === "ai"
                ? "bg-brand-500 text-white shadow-glow"
                : "bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200/60"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{t("catalog.aiSuggested", "اقتراحات ذكية")}</span>
          </button>
        </div>
      </div>

      {/* 6. Product Catalog Grid */}
      <div className="w-full">
        <CatalogGrid
          products={filteredProducts}
          onResetFilters={handleResetAllFilters}
          emptyTitle={
            searchQuery
              ? t("catalog.emptySearchTitle", "لم نجد نتائج مطابقة")
              : undefined
          }
          emptyDescription={
            searchQuery
              ? `${locale === "ar" ? "لا توجد منتجات تطابق" : "No products found for"} "${searchQuery}"`
              : undefined
          }
        />
      </div>

      {/* Multi-attribute Filter Slide-up Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        initialFilters={filters}
        onApply={handleApplyDrawerFilters}
        onReset={handleResetAllFilters}
      />
    </div>
  );
}
