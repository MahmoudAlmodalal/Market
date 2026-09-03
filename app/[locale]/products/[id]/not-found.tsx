"use client";

import React from "react";
import Link from "next/link";
import { PackageX, Home } from "lucide-react";
import { useLocale } from "@/lib/context/LocaleContext";

export default function ProductNotFound() {
  const { locale } = useLocale();

  return (
    <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center max-w-md sm:max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center mb-4 shadow-inner">
        <PackageX className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2 font-cairo">
        {locale === "en" ? "Product Not Found" : "المنتج غير موجود"}
      </h1>
      <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-xs sm:max-w-sm leading-relaxed font-sans">
        {locale === "en"
          ? "The item you are looking for may have been removed or is temporarily unavailable."
          : "المنتج الذي تبحث عنه قد يكون تم حذفه أو غير متوفر حالياً."}
      </p>
      <Link
        href={`/${locale}/catalog`}
        className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-soft transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Home className="w-4 h-4" />
        <span>{locale === "en" ? "Browse Marketplace" : "تصفح السوق والمنتجات"}</span>
      </Link>
    </div>
  );
}
