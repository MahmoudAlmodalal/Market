"use client";

import React, { useMemo } from "react";
import { useLocale } from "@/lib/context/LocaleContext";
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
  Boxes,
  Clock,
} from "lucide-react";

export interface SellerStatTilesProps {
  products?: Product[];
  orders?: Order[];
  className?: string;
}

export function SellerStatTiles({
  products = [],
  orders = [],
  className,
}: SellerStatTilesProps) {
  const { locale } = useLocale();

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

    // Filter active new pending orders
    const newOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    );

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
      id: "product_count",
      titleAr: "إجمالي المنتجات",
      titleEn: "Total Products",
      value: stats.totalProducts,
      subAr: "في الكتالوج النشط",
      subEn: "In active catalog",
      icon: Boxes,
      color: "bg-blue-500 text-white",
      borderColor: "border-blue-200/80",
      bgLight: "bg-blue-50/50",
    },
    {
      id: "orders_by_status",
      titleAr: "الطلبات الجديدة",
      titleEn: "New Orders",
      value: stats.newOrdersCount,
      subAr: stats.newOrdersCount > 0 ? "تحتاج للتجهيز والتأكيد" : "تمت معالجة كافة الطلبات",
      subEn: stats.newOrdersCount > 0 ? "Pending fulfillment" : "All orders fulfilled",
      icon: ShoppingCart,
      color: "bg-brand-500 text-white",
      borderColor: "border-brand-200/80",
      bgLight: "bg-brand-50/50",
    },
    {
      id: "low_stock_count",
      titleAr: "مخزون منخفض",
      titleEn: "Low Stock Items",
      value: stats.lowStockCount,
      subAr: "متبقي ≤ 5 قطع",
      subEn: "≤ 5 items remaining",
      icon: AlertTriangle,
      color: "bg-amber-500 text-white",
      borderColor: "border-amber-200/80",
      bgLight: "bg-amber-50/50",
    },
    {
      id: "out_of_stock_count",
      titleAr: "نفد من المخزون",
      titleEn: "Out of Stock",
      value: stats.outOfStockCount,
      subAr: stats.outOfStockCount > 0 ? "يحتاج لإعادة التوريد" : "لا يوجد نواقص",
      subEn: stats.outOfStockCount > 0 ? "Requires restock" : "Full stock available",
      icon: AlertCircle,
      color: "bg-red-500 text-white",
      borderColor: "border-red-200/80",
      bgLight: "bg-red-50/50",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* 4 KPI Responsive Grid (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl border bg-white shadow-xs space-y-2 transition-all hover:shadow-sm",
                tile.borderColor
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-neutral-600">
                  {locale === "ar" ? tile.titleAr : tile.titleEn}
                </span>
                <div
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                    tile.color
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums">
                  {tile.value}
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                  {locale === "ar" ? tile.subAr : tile.subEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Sales Revenue Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-50/50 to-neutral-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-950 block">
              {locale === "ar" ? "المبيعات المكتملة" : "Completed Revenue"}
            </span>
            <span className="text-[11px] text-emerald-700">
              {locale === "ar" ? "إجمالي الطلبات المسلمة بنجاح" : "Delivered order total"}
            </span>
          </div>
        </div>

        <div className="text-end">
          <span className="text-base font-black text-emerald-900 tabular-nums">
            {stats.completedRevenue}{" "}
            <span className="text-xs font-semibold">
              {locale === "ar" ? "ر.س" : "SAR"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Support both singular and plural names
export { SellerStatTiles as SellerStatsTiles };
export default SellerStatTiles;
