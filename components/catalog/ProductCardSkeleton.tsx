import React from "react";
import { cn } from "@/lib/utils";

export interface ProductCardSkeletonProps {
  className?: string;
}

/**
 * ProductCardSkeleton: Pulse skeleton matching exact ProductCard dimensions and layout
 * to ensure 0 Cumulative Layout Shift (CLS) during data loading transitions.
 */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full bg-white rounded-card border border-neutral-200/90 p-3 flex flex-col justify-between shadow-soft-sm overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Top Image + Badges Area */}
      <div className="w-full flex flex-col gap-2.5">
        {/* 1:1 Aspect Ratio Image Placeholder */}
        <div className="w-full aspect-square bg-neutral-200/70 rounded-2xl animate-pulse relative overflow-hidden">
          <div className="absolute top-2 start-2 w-14 h-5 bg-neutral-300/80 rounded-pill" />
        </div>

        {/* Seller / Category Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="w-20 h-3 bg-neutral-200/80 rounded-md animate-pulse" />
          <div className="w-10 h-3 bg-neutral-200/60 rounded-md animate-pulse" />
        </div>

        {/* 2-line Title Placeholder */}
        <div className="flex flex-col gap-1.5 min-h-[38px]">
          <div className="w-full h-3.5 bg-neutral-200/90 rounded-md animate-pulse" />
          <div className="w-3/4 h-3.5 bg-neutral-200/70 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Bottom Price + CTA Button Area */}
      <div className="flex flex-col gap-2.5 mt-3 pt-2 border-t border-neutral-100">
        {/* Price & Unit */}
        <div className="flex items-baseline justify-between">
          <div className="w-16 h-5 bg-neutral-200/90 rounded-md animate-pulse" />
          <div className="w-10 h-3 bg-neutral-200/60 rounded-md animate-pulse" />
        </div>

        {/* Quick Add CTA Button */}
        <div className="w-full h-9 bg-neutral-200/80 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
