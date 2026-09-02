import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base pulse animated skeleton placeholder.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200/80 rounded-md",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  className,
  ...props
}: SkeletonProps & { size?: number | string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "animate-pulse bg-neutral-200/80 rounded-full shrink-0",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonLine({
  height = 16,
  width = "100%",
  className,
  ...props
}: SkeletonProps & { height?: number | string; width?: number | string }) {
  return (
    <div
      style={{ height, width }}
      className={cn(
        "animate-pulse bg-neutral-200/80 rounded-md",
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonProductCard mimics the exact 20px radius, 1:1 aspect image,
 * title, price, and CTA layout of the ProductCard component to prevent CLS.
 */
export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full bg-white rounded-card border border-neutral-200 p-3 flex flex-col gap-3 shadow-soft-sm",
        className
      )}
    >
      {/* 1:1 Aspect ratio image placeholder */}
      <div className="w-full aspect-square bg-neutral-100 rounded-2xl animate-pulse" />

      {/* Metadata placeholders */}
      <div className="flex flex-col gap-2 pt-1">
        <SkeletonLine height={16} width="85%" />
        <SkeletonLine height={12} width="55%" />
      </div>

      {/* Price & Badge Row */}
      <div className="flex items-center justify-between pt-1">
        <SkeletonLine height={20} width="35%" />
        <SkeletonLine height={18} width="25%" className="rounded-pill" />
      </div>

      {/* Action Button */}
      <div className="w-full h-11 bg-neutral-200/80 rounded-md animate-pulse mt-1" />
    </div>
  );
}

export default Skeleton;
