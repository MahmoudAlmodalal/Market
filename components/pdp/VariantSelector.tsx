"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/context/LocaleContext";
import { Check, AlertCircle } from "lucide-react";
import type { ProductVariantGroup, ProductVariant } from "@/lib/mock/sellers";

export interface VariantSelectorProps {
  groups: ProductVariantGroup[];
  selectedVariants: Record<string, string>; // { groupId: variantId }
  onSelectVariant: (groupId: string, variant: ProductVariant) => void;
  className?: string;
}

export function VariantSelector({
  groups,
  selectedVariants,
  onSelectVariant,
  className,
}: VariantSelectorProps) {
  const { locale, t } = useLocale();

  if (!groups || groups.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {groups.map((group) => {
        const groupName = locale === "en" ? group.name_en || group.name : group.name;
        const currentSelectedId = selectedVariants[group.id];

        return (
          <div key={group.id} className="flex flex-col gap-2.5">
            {/* Group Label */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">
                {groupName}
              </span>
              {currentSelectedId && (
                <span className="text-[11px] font-medium text-neutral-500">
                  {(() => {
                    const found = group.options.find((o) => o.id === currentSelectedId);
                    if (!found) return "";
                    return locale === "en" ? found.name_en || found.name : found.name;
                  })()}
                </span>
              )}
            </div>

            {/* Options List */}
            <div
              role="radiogroup"
              aria-label={groupName}
              className="flex items-center gap-2 flex-wrap"
            >
              {group.options.map((option) => {
                const isSelected = currentSelectedId === option.id;
                const isOutOfStock = !option.in_stock;
                const optName = locale === "en" ? option.name_en || option.name : option.name;
                const optBadge = locale === "en" ? option.badge_en || option.badge : option.badge;
                const currency = t("common.currency", "₪");

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-disabled={isOutOfStock}
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (!isOutOfStock) {
                        onSelectVariant(group.id, option);
                      }
                    }}
                    className={cn(
                      "relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all select-none active:scale-98",
                      isSelected
                        ? "border-brand-500 bg-brand-50/70 text-brand-700 shadow-2xs ring-1 ring-brand-500/20 font-bold"
                        : isOutOfStock
                        ? "border-neutral-200/80 bg-neutral-100/60 text-neutral-400 cursor-not-allowed line-through"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    {/* Selected Checkmark Icon */}
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Option Label */}
                    <span className={cn(isOutOfStock && "opacity-75")}>{optName}</span>

                    {/* Price Delta */}
                    {option.priceDelta !== undefined && option.priceDelta !== 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-bold numeric-data px-1.5 py-0.5 rounded-md",
                          isSelected
                            ? "bg-brand-200/60 text-brand-800"
                            : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {option.priceDelta > 0 ? `+${option.priceDelta}` : option.priceDelta} {currency}
                      </span>
                    )}

                    {/* Floating Promo / Stock Badge */}
                    {optBadge && !isOutOfStock && (
                      <span className="text-[9px] font-extrabold text-white bg-brand-500 px-1.5 py-0.5 rounded-pill shadow-2xs">
                        {optBadge}
                      </span>
                    )}

                    {isOutOfStock && (
                      <span className="text-[9px] font-bold text-neutral-500 bg-neutral-200/80 px-1.5 py-0.5 rounded-pill">
                        {t("catalog.outOfStock", "نفدت")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VariantSelector;
