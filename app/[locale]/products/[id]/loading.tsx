import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="w-full min-h-screen bg-neutral-50/50 pb-24 animate-in fade-in duration-150">
      {/* Top Header Skeleton */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex items-center justify-between max-w-[1600px] 2xl:max-w-[1800px] mx-auto">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-36 sm:w-56 h-4 rounded-md" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <Skeleton className="w-16 h-16 rounded-xl" />
            <Skeleton className="w-16 h-16 rounded-xl" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="w-24 h-6 rounded-pill" />
          <Skeleton className="w-full h-8 rounded-lg" />
          <Skeleton className="w-3/4 h-8 rounded-lg" />
          <Skeleton className="w-36 h-8 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-2xl" />
          <Skeleton className="w-full h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
