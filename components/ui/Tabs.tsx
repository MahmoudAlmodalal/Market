"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (tabId: string) => void;
  variant?: "pill" | "underline";
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "default";
}

/**
 * Tabs component supporting "pill" and "underline" variants,
 * horizontal kinetic scrolling, count badges, and keyboard navigation.
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = "pill",
  className,
  fullWidth = false,
  size = "default",
}: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const direction = e.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      const nextTab = items[nextIndex];
      if (nextTab && !nextTab.disabled) {
        onChange(nextTab.id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={cn(
        "flex items-center overflow-x-auto no-scrollbar scroll-smooth gap-1.5 py-1 px-1",
        variant === "underline" && "border-b border-neutral-200 gap-4 px-0",
        fullWidth && "w-full justify-between",
        className
      )}
    >
      {items.map((tab, idx) => {
        const isActive = tab.id === value;

        if (variant === "underline") {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "relative pb-2.5 pt-1 px-1 text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap outline-none",
                "focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm",
                isActive
                  ? "text-brand-500 font-bold border-b-2 border-brand-500"
                  : "text-neutral-500 hover:text-neutral-800 border-b-2 border-transparent",
                tab.disabled && "text-neutral-300 cursor-not-allowed",
                fullWidth && "flex-1 justify-center"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-brand-50 text-brand-600 font-bold"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        // Pill variant
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "relative rounded-pill font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap outline-none select-none",
              "focus-visible:ring-2 focus-visible:ring-brand-500",
              size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2",
              isActive
                ? "bg-brand-50 text-brand-600 border border-brand-200 shadow-soft-sm font-bold"
                : "bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/60 border border-transparent",
              tab.disabled && "opacity-40 cursor-not-allowed",
              fullWidth && "flex-1 justify-center"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-brand-500 text-white font-bold"
                    : "bg-neutral-200 text-neutral-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
