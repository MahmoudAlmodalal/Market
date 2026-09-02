"use client";

import React from "react";
import { Clock, Sun, Moon, Zap, Calendar, Check, AlertCircle } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { DeliveryTimeSlot } from "@/lib/mock/cart";

export interface DeliveryTimeSlotPickerProps {
  slots: DeliveryTimeSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: DeliveryTimeSlot) => void;
  className?: string;
}

/**
 * DeliveryTimeSlotPicker displays available and booked delivery windows
 * with icon cues, status badges, and active selection state.
 */
export function DeliveryTimeSlotPicker({
  slots,
  selectedSlotId,
  onSelectSlot,
  className,
}: DeliveryTimeSlotPickerProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const getSlotIcon = (id: string, label: string) => {
    if (id.includes("express") || label.includes("سريع") || label.includes("Express")) {
      return <Zap className="w-4 h-4 text-amber-500" />;
    }
    if (id.includes("evening") || label.includes("مساء") || label.includes("Evening") || label.includes("17:00") || label.includes("19:00")) {
      return <Moon className="w-4 h-4 text-indigo-500" />;
    }
    if (id.includes("morning") || label.includes("صباح") || label.includes("Morning") || label.includes("10:00") || label.includes("14:00")) {
      return <Sun className="w-4 h-4 text-amber-500" />;
    }
    return <Clock className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className={cn("w-full flex flex-col gap-2.5 text-start", className)}>
      <fieldset className="w-full">
        <legend className="sr-only">
          {locale === "ar" ? "اختر موعد التوصيل" : "Select delivery time slot"}
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            const isAvailable = slot.isAvailable;
            const label = locale === "ar" ? slot.label_ar : slot.label_en;

            return (
              <button
                key={slot.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectSlot(slot)}
                className={cn(
                  "relative w-full p-3 sm:p-3.5 rounded-2xl border transition-all select-none text-start",
                  "flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  !isAvailable
                    ? "bg-neutral-50 border-neutral-200/60 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "bg-brand-50/40 border-brand-500 ring-2 ring-brand-500/20 shadow-sm cursor-pointer"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 cursor-pointer"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-brand-500 text-white"
                        : isAvailable
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-neutral-200 text-neutral-400"
                    )}
                  >
                    {getSlotIcon(slot.id, label)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-bold truncate",
                        isSelected ? "text-brand-900" : isAvailable ? "text-neutral-900" : "text-neutral-400"
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate">
                      {slot.date}
                    </span>
                  </div>
                </div>

                {/* Status or Selection indicator */}
                {!isAvailable ? (
                  <Badge variant="neutral" size="sm" className="text-[10px] bg-neutral-200 text-neutral-600 shrink-0">
                    {locale === "ar" ? "محجوز" : "Booked"}
                  </Badge>
                ) : isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export default DeliveryTimeSlotPicker;
