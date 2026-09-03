"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/context/LocaleContext";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import type { CategorySimple } from "@/lib/api/types";

export interface ProductDetailHeaderProps {
  productName: string;
  category?: CategorySimple | { id: number; name: string } | null;
}

export function ProductDetailHeader({
  productName,
  category,
}: ProductDetailHeaderProps) {
  const { direction, locale, t } = useLocale();
  const isRtl = direction === "rtl";
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-3.5 sm:px-6 lg:px-8 xl:px-12 py-2.5">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t("common.back", "رجوع")}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center text-neutral-700 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Centered Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 truncate max-w-[70%] font-medium">
          <Link
            href={`/${locale}/catalog`}
            className="hover:text-brand-600 transition-colors shrink-0"
          >
            {t("nav.catalog", "السوق")}
          </Link>
          <span className="text-neutral-300">/</span>
          {category?.name && (
            <>
              <Link
                href={`/${locale}/catalog?category=${category.id}`}
                className="hover:text-brand-600 transition-colors truncate max-w-[120px]"
              >
                {category.name}
              </Link>
              <span className="text-neutral-300">/</span>
            </>
          )}
          <span className="text-neutral-900 font-bold truncate">
            {productName}
          </span>
        </div>

        {/* Home shortcut trigger */}
        <Link
          href={`/${locale}`}
          aria-label={t("nav.home", "الرئيسية")}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center text-neutral-700 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>
    </div>
  );
}

export default ProductDetailHeader;
