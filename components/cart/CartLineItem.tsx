"use client";

import React from "react";
import Image from "next/image";
import { Trash2, Package } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { IssueNotice } from "./IssueNotice";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onAcceptPriceChange?: (itemId: number) => void;
  onClampQuantity?: (itemId: number) => void;
  className?: string;
}

/**
 * CartLineItem represents an individual line item in the shopping cart.
 * Displays a 64x64 rounded thumbnail, title, unit price, quantity stepper,
 * line total, remove action, and embedded issue alerts.
 */
export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
  onAcceptPriceChange,
  onClampQuantity,
  className,
}: CartLineItemProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const unitPriceNum = parseFloat(item.unit_price) || 0;
  const lineTotalNum = unitPriceNum * item.quantity;
  const lineTotalFormatted = lineTotalNum.toFixed(2);
  const maxStock = item.max_quantity ?? 99;

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-neutral-200/85 p-3.5 sm:p-4 shadow-sm flex flex-col gap-3 transition-all",
        className
      )}
    >
      {/* Top Row: Thumbnail, Details, Stepper & Delete */}
      <div className="flex items-start gap-3 w-full">
        {/* 64x64 Rounded Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0 flex items-center justify-center">
          {item.primary_image ? (
            <Image
              src={item.primary_image}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover"
              onError={(e) => {
                // Image fallback
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <Package className="w-6 h-6 text-neutral-400" />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2 text-start">
              {item.name}
            </h3>

            {/* Remove item button */}
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="p-1 text-neutral-400 hover:text-semantic-error hover:bg-red-50 rounded-lg transition-colors shrink-0"
              aria-label={t("common.delete", "حذف")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Unit price */}
          <div className="text-xs text-neutral-500 text-start mt-0.5">
            <span>{t("cart.unitPrice", "سعر القطعة")}: </span>
            <span className="font-semibold text-neutral-800 numeric-data">
              {item.unit_price} ₪
            </span>
          </div>

          {/* Bottom row in card: Quantity Stepper & Line Total */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-100">
            {/* Stepper */}
            <QuantityStepper
              value={item.quantity}
              min={1}
              max={maxStock}
              size="sm"
              onChange={(newQty) => onUpdateQuantity(item.id, newQty)}
            />

            {/* Line Total */}
            <div className="text-end">
              <span className="text-[11px] text-neutral-400 block leading-none mb-0.5">
                {t("cart.itemTotal", "الإجمالي")}
              </span>
              <span className="text-sm font-extrabold text-brand-600 numeric-data">
                {lineTotalFormatted} ₪
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Issue Notices */}
      {item.issues && item.issues.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-dashed border-neutral-200">
          {item.issues.map((issue, idx) => (
            <IssueNotice
              key={`${item.id}-issue-${idx}`}
              issue={issue}
              itemId={item.id}
              onAcceptPriceChange={onAcceptPriceChange}
              onClampQuantity={onClampQuantity}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CartLineItem;
