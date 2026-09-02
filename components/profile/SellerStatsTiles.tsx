"use client";

import React, { useMemo } from "react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import type { Order } from "@/types/order";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export interface SellerStatsTilesProps {
  products?: Product[];
  orders?: Order[];
  className?: string;
}

export function SellerStatsTiles({
  products = [],
  orders = [],
  className,
}: SellerStatsTilesProps) {
  const { t, locale, direction } = useLocale();

  // Compute live KPIs
  const stats = useMemo(() => {
    const totalProducts = products.length;

    const outOfStockCount = products.filter(
      (p) =>
        p.stock_state === "out_of_stock" ||
        (p.stock_quantity !== undefined && p.stock_quantity <= 0) ||
        (p.available_quantity !== undefined && p.available_quantity <= 0)
    ).length;

    const lowStockCount = products.filter(
      (p) =>
        p.stock_state === "low_stock" ||
        (p.stock_quantity !== undefined && p.stock_quantity > 0 && p.stock_quantity <= 5) ||
        (p.available_quantity !== undefined && p.available_quantity > 0 && p.available_quantity <= 5)
    ).length;

    // Filter orders by seller if applicable or all merchant orders
    const newOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed");

    const completedOrders = orders.filter((o) => o.status === "completed");
    const completedRevenue = completedOrders.reduce((sum, o) => {
      return sum + (parseFloat(o.total) || 0);
    }, 0);

    return {
      totalProducts,
      outOfStockCount,
      lowStockCount,
      newOrdersCount: newOrders.length,
      completedRevenue: completedRevenue.toFixed(2),
    };
  }, [products, orders]);

  const tiles = [
    {
      id: "products",
      titleAr: "إجمالي المنتجات",
      titleEn: "Total Products",
      value: stats.totalProducts,
      trendAr: "+3 هذا الشهر",
      trendEn: "+3 this month",
      trendType: "positive" as const,
      icon: Package,
      color: "bg-blue-500 text-white",
      border: "border-blue-200/80",
      bg: "bg-blue-50/50",
    },
    {
      id: "new_orders",
      titleAr: "الطلبات الجديدة",
      titleEn: "New Orders",
      value: stats.newOrdersCount,
      trendAr: "تحتاج للتأكيد والتجهيز",
      trendEn: "Pending fulfillment",
      trendType: stats.newOrdersCount > 0 ? ("alert" as const) : ("neutral" as const),
      icon: ShoppingCart,
      color: "bg-brand-500 text-white",
      border: "border-brand-200/80",
      bg: "bg-brand-50/50",
    },
    {
      id: "low_stock",
      titleAr: "تنبيهات المخزون المنخفض",
      titleEn: "Low Stock Items",
      value: stats.lowStockCount,
      trendAr: "متبقي ≤ 5 قطع",
      trendEn: "≤ 5 items remaining",
      trendType: stats.lowStockCount > 0 ? ("warning" as const) : ("neutral" as const),
      icon: AlertTriangle,
      color: "bg-amber-500 text-white",
      border: "border-amber-200/80",
      bg: "bg-amber-50/50",
    },
    {
      id: "out_of_stock",
      titleAr: "منتجات نفدت",
      titleEn: "Out of Stock",
      value: stats.outOfStockCount,
      trendAr: stats.outOfStockCount > 0 ? "يتطلب إعادة التعبئة" : "المخزون ممتاز",
      trendEn: stats.outOfStockCount > 0 ? "Restock needed" : "All in stock",
      trendType: stats.outOfStockCount > 0 ? ("danger" as const) : ("positive" as const),
      icon: AlertCircle,
      color: "bg-rose-500 text-white",
      border: "border-rose-200/80",
      bg: "bg-rose-50/50",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {tiles.map((tile) => {
        const Icon = tile.icon;

        return (
          <div
            key={tile.id}
            className={cn(
              "rounded-2xl p-3.5 border transition-all shadow-xs flex flex-col justify-between",
              tile.bg,
              tile.border
            )}
          >
            {/* Top row: title & icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-neutral-600 leading-tight">
                {locale === "ar" ? tile.titleAr : tile.titleEn}
              </span>
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                  tile.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="my-2">
              <span className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                {tile.value}
              </span>
            </div>

            {/* Trend Footer */}
            <div className="flex items-center gap-1 text-[10px] font-semibold leading-tight">
              {tile.trendType === "positive" && (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{locale === "ar" ? tile.trendAr : tile.trendEn}</span>
                </span>
              )}

              {tile.trendType === "warning" && (
                <span className="text-amber-800 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{locale === "ar" ? tile.trendAr : tile.trendEn}</span>
                </span>
              )}

              {tile.trendType === "danger" && (
                <span className="text-rose-700 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>{locale === "ar" ? tile.trendAr : tile.trendEn}</span>
                </span>
              )}

              {tile.trendType === "alert" && (
                <span className="text-brand-700 flex items-center gap-0.5 animate-pulse-subtle">
                  <span>{locale === "ar" ? tile.trendAr : tile.trendEn}</span>
                </span>
              )}

              {tile.trendType === "neutral" && (
                <span className="text-neutral-500">
                  {locale === "ar" ? tile.trendAr : tile.trendEn}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SellerStatsTiles;
