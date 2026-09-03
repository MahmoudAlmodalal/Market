"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Input } from "@/components/ui/Input";
import {
  CategoryFilterStrip,
  FilterDrawer,
  type FilterValues,
} from "@/components/feed";
import { CatalogGrid } from "@/components/catalog";
import type { Category, ProductListItem } from "@/lib/api/types";
import { Search, SlidersHorizontal, Flame, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export interface HomeFeedClientProps {
  products: ProductListItem[];
  categories: Category[];
  totalCount: number;
  initialSearch?: string;
  initialCategory?: number | null;
  initialOrdering?: string;
}

export function HomeFeedClient({
  products,
  categories,
  totalCount,
  initialSearch = "",
  initialCategory = null,
  initialOrdering = "-created_at",
}: HomeFeedClientProps) {
  const { t } = useTranslation();
  const { isRtl, locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const updateFilters = (newParams: {
    search?: string;
    category?: number | null;
    ordering?: string;
  }) => {
    const params = new URLSearchParams();
    const searchVal = newParams.search !== undefined ? newParams.search : searchQuery;
    const catVal = newParams.category !== undefined ? newParams.category : initialCategory;
    const orderVal = newParams.ordering !== undefined ? newParams.ordering : initialOrdering;

    if (searchVal && searchVal.trim() !== "") {
      params.set("search", searchVal.trim());
    }
    if (catVal !== null && catVal !== undefined && catVal > 0) {
      params.set("category", String(catVal));
    }
    if (orderVal && orderVal !== "-created_at") {
      params.set("ordering", orderVal);
    }

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  // Debounced search input handler
  useEffect(() => {
    if (searchQuery === initialSearch) return;
    const timer = setTimeout(() => {
      updateFilters({ search: searchQuery });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCategory = (categoryId: number | null) => {
    updateFilters({ category: categoryId });
  };

  const handleApplyDrawerFilters = (newFilters: FilterValues) => {
    updateFilters({
      category: newFilters.category,
      ordering: newFilters.ordering,
    });
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const selectedCategoryObj = initialCategory
    ? categories.find((c) => c.id === initialCategory)
    : null;

  return (
    <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto flex flex-col gap-4 sm:gap-6 pb-20 md:pb-10 pt-2 sm:pt-4">
      {/* 1. Search Bar with Filter Drawer Trigger */}
      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 flex items-center gap-2 sm:gap-3">
        <div className="flex-1">
          <Input
            placeholder={t("catalog.searchPlaceholder", "ابحث عن منتج، متجر، أو تصنيف...")}
            startIcon={<Search className="w-4 h-4 text-neutral-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            clearable
            onClear={() => {
              setSearchQuery("");
              updateFilters({ search: "" });
            }}
            className="rounded-pill bg-white shadow-soft-sm text-xs sm:text-sm h-11 sm:h-12"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          className="min-h-[44px] min-w-[44px] h-11 sm:h-12 px-3 sm:px-4 shrink-0 rounded-2xl bg-white border border-neutral-200/90 shadow-soft-sm flex items-center justify-center gap-1.5 text-neutral-700 hover:text-brand-600 hover:border-brand-300 active:scale-95 transition-all text-xs font-bold"
          aria-label={t("catalog.filterBy", "تصفية")}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">{t("common.filter", "تصفية")}</span>
        </button>
      </div>

      {/* 2. Horizontal Category Filter Strip */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="px-3 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-neutral-800">
            {t("catalog.categories", "التصنيفات المميزة")}
          </h2>
          <Link
            href={`/${locale}/catalog`}
            className="text-[11px] sm:text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
          >
            <span>{t("common.viewAll", "عرض الكل")}</span>
            {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          </Link>
        </div>

        <CategoryFilterStrip
          categories={categories}
          selectedCategoryId={initialCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* 3. Feed Section Header */}
      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between pt-1 sm:pt-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500" />
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900">
            {selectedCategoryObj
              ? selectedCategoryObj.name
              : t("catalog.featuredProducts", "منتجات مختارة لك")}
          </h2>
        </div>

        <span className="text-[11px] sm:text-xs font-bold text-neutral-500 font-inter">
          {products.length} {locale === "ar" ? "منتج" : "items"}
        </span>
      </div>

      {/* 4. Product Catalog Grid */}
      <div className="w-full">
        <CatalogGrid
          products={products}
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
        initialFilters={{
          category: initialCategory,
          ordering: (initialOrdering as FilterValues["ordering"]) || "-created_at",
        }}
        onApply={handleApplyDrawerFilters}
        onReset={handleResetAllFilters}
      />
    </div>
  );
}

export default HomeFeedClient;
