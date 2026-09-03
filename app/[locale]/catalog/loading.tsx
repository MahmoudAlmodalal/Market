import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function CatalogLoading() {
  return (
    <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto flex flex-col gap-4 sm:gap-6 pb-24 md:pb-12 pt-2 sm:pt-4 px-3 sm:px-6 lg:px-8 xl:px-12 animate-in fade-in duration-150">
      {/* 1. Header & Search Input Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-start">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="flex-1 h-11 sm:h-12 rounded-pill" />
          <Skeleton className="lg:hidden w-11 h-11 rounded-2xl shrink-0" />
        </div>
      </div>

      {/* 2. Main Content 2-Column Skeleton */}
      <div className="flex items-start gap-8">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 bg-white border border-neutral-200/90 rounded-2xl p-4 space-y-4">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-xl" />
            ))}
          </div>
        </aside>

        {/* Products Grid Skeleton */}
        <main className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
