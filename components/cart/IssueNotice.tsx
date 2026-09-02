"use client";

import React from "react";
import {
  AlertTriangle,
  AlertCircle,
  Check,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CartIssue } from "@/types/cart";

export interface IssueNoticeProps {
  issue: CartIssue;
  itemId: number;
  onAcceptPriceChange?: (itemId: number) => void;
  onClampQuantity?: (itemId: number) => void;
  onRemoveItem?: (itemId: number) => void;
  className?: string;
}

/**
 * IssueNotice renders responsive alert banners for cart anomalies:
 * - price_changed (with Accept CTA)
 * - insufficient_stock (with Clamp CTA)
 * - product_unavailable / out_of_stock (with Remove CTA)
 */
export function IssueNotice({
  issue,
  itemId,
  onAcceptPriceChange,
  onClampQuantity,
  onRemoveItem,
  className,
}: IssueNoticeProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  if (issue.code === "price_changed") {
    const oldPrice = issue.old_price || "0.00";
    const newPrice = issue.new_price || "0.00";

    return (
      <div
        role="alert"
        className={cn(
          "w-full rounded-xl bg-amber-50 border border-amber-200 p-3 text-start flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 animate-in fade-in duration-200",
          className
        )}
      >
        <div className="flex items-start gap-2 min-w-0">
          <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-amber-950">
              {issue.message ||
                t(
                  "cart.price_changed_notice",
                  { oldPrice, newPrice },
                  `تغير سعر هذا المنتج من ${oldPrice} ₪ إلى ${newPrice} ₪`
                )}
            </span>
            <span className="text-[11px] text-amber-700">
              {locale === "ar"
                ? "قام البائع بتحديث السعر الرسمي للمنتج"
                : "Seller updated the official item price"}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAcceptPriceChange && onAcceptPriceChange(itemId)}
          className="border-amber-600 text-amber-900 bg-amber-100/80 hover:bg-amber-200 text-xs h-7 px-3 shrink-0 self-end sm:self-center font-bold"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{t("cart.price_changed_accept", "أوافق على السعر الجديد")}</span>
        </Button>
      </div>
    );
  }

  if (issue.code === "insufficient_stock") {
    const available = issue.available ?? 1;

    return (
      <div
        role="alert"
        className={cn(
          "w-full rounded-xl bg-amber-50 border border-amber-200 p-3 text-start flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 animate-in fade-in duration-200",
          className
        )}
      >
        <div className="flex items-start gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-amber-950">
              {issue.message ||
                t(
                  "cart.insufficient_stock_notice",
                  { available },
                  `الكمية المتبقية ${available} فقط`
                )}
            </span>
            <span className="text-[11px] text-amber-700">
              {locale === "ar"
                ? "الكمية المطلوبة تتجاوز المخزون الحالي"
                : "Requested quantity exceeds available inventory"}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onClampQuantity && onClampQuantity(itemId)}
          className="border-amber-600 text-amber-900 bg-amber-100/80 hover:bg-amber-200 text-xs h-7 px-3 shrink-0 self-end sm:self-center font-bold"
        >
          <span>
            {t(
              "cart.clamp_stock_cta",
              { available },
              `تعديل الكمية إلى ${available}`
            )}
          </span>
        </Button>
      </div>
    );
  }

  if (issue.code === "product_unavailable") {
    return (
      <div
        role="alert"
        className={cn(
          "w-full rounded-xl bg-red-50 border border-red-200 p-3 text-start flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-red-900 animate-in fade-in duration-200",
          className
        )}
      >
        <div className="flex items-start gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-red-950">
              {issue.message ||
                t("cart.issueUnavailable", "هذا المنتج لم يعد متوفراً حالياً")}
            </span>
            <span className="text-[11px] text-red-700">
              {locale === "ar"
                ? "نفذت كمية هذا المنتج بالكامل من المتجر"
                : "This item is completely sold out"}
            </span>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveItem && onRemoveItem(itemId)}
          className="text-xs h-7 px-3 shrink-0 self-end sm:self-center font-bold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t("cart.removeUnavailable", "إزالة من السلة")}</span>
        </Button>
      </div>
    );
  }

  return null;
}

export default IssueNotice;
