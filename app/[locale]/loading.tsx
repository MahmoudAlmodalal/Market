import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function HomeLoading() {
  return (
    <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto flex flex-col gap-4 sm:gap-6 pb-20 md:pb-10 pt-2 sm:pt-4 px-3 sm:px-6 lg:px-8 xl:px-12 animate-in fade-in duration-150">
      {/* Search Bar Skeleton */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="flex-1 h-11 sm:h-12 rounded-pill" />
        <Skeleton className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl shrink-0" />
      </div>

      {/* Category Pills Strip Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 sm:h-11 w-24 rounded-pill shrink-0" />
        ))}
      </div>

      {/* Feed Header Skeleton */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Catalog Grid Skeleton */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 py-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
