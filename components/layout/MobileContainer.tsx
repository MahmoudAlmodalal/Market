import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withBottomPadding?: boolean;
}

/**
 * ResponsiveContainer (formerly MobileContainer) provides a fluid layout shell
 * that scales gracefully from mobile (320px+) to tablet (768px+), laptop (1024px+), and desktop (1440px+).
 * - Mobile (<768px): Adds bottom padding for the fixed mobile BottomNav and safe-area insets.
 * - Desktop (>=768px): Expands up to max-w-7xl with fluid margins, removing redundant bottom padding.
 */
export function MobileContainer({
  children,
  className,
  withBottomPadding = true,
}: MobileContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen min-h-[100dvh] w-full bg-white flex flex-col transition-all duration-200",
        // Responsive padding: pb-20 on mobile for BottomNav, reduced to pb-6 on desktop (md:) where top navbar takes over
        withBottomPadding ? "pb-20 md:pb-6" : "pb-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export default MobileContainer;

