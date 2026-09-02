import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withBottomPadding?: boolean;
}

/**
 * MobileContainer provides a mobile-first 430px constrained shell
 * that centers horizontally on wider desktop/tablet viewports.
 * Features soft elevation, responsive container padding, and safe-area support.
 */
export function MobileContainer({
  children,
  className,
  withBottomPadding = true,
}: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-surface-canvas flex justify-center">
      <div
        className={cn(
          "w-full max-w-[430px] min-h-screen bg-white shadow-soft relative flex flex-col",
          withBottomPadding && "pb-20",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default MobileContainer;
