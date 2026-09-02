"use client";

import React from "react";
import { useLocale } from "@/lib/context/LocaleContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
  variant?: "pill" | "button" | "compact";
}

/**
 * LanguageToggle allows switching between Arabic ('ar') and English ('en')
 * while preserving current URL route segments and document direction.
 */
export function LanguageToggle({
  className,
  variant = "pill",
}: LanguageToggleProps) {
  const { locale, setLocale, toggleLocale } = useLocale();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-pill transition-all duration-200",
          "bg-brand-50 text-brand-600 hover:bg-brand-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          className
        )}
        aria-label={
          locale === "ar"
            ? "Switch language to English"
            : "تغيير اللغة إلى العربية"
        }
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{locale === "ar" ? "EN" : "عربي"}</span>
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md border border-neutral-200 transition-all duration-200",
          "bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          className
        )}
        aria-label={
          locale === "ar"
            ? "Switch language to English"
            : "تغيير اللغة إلى العربية"
        }
      >
        <Globe className="w-4 h-4 text-brand-500" />
        <span>{locale === "ar" ? "English" : "العربية"}</span>
      </button>
    );
  }

  // Default "pill" segmented switcher
  return (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        "inline-flex items-center p-0.5 rounded-pill bg-neutral-100 border border-neutral-200/80 text-xs font-semibold",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={cn(
          "px-2.5 py-1 rounded-pill transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          locale === "ar"
            ? "bg-brand-500 text-white shadow-soft-sm font-bold"
            : "text-neutral-600 hover:text-neutral-900"
        )}
        aria-pressed={locale === "ar"}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-2.5 py-1 rounded-pill transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          locale === "en"
            ? "bg-brand-500 text-white shadow-soft-sm font-bold"
            : "text-neutral-600 hover:text-neutral-900"
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageToggle;
