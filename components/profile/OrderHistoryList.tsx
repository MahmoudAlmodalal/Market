"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { getMockOrders, INITIAL_MOCK_ORDERS } from "@/lib/mock/orders";
import { getProductById } from "@/lib/mock/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";
import type { Product } from "@/types/catalog";
import {
  Package,
  Clock,
  Store,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface OrderHistoryListProps {
  orders?: Order[];
  className?: string;
  limit?: number;
  showFilters?: boolean;
}

type FilterTab = "all" | "active" | "completed" | "cancelled";

export function OrderHistoryList({
  orders: propOrders,
  className,
  limit,
  showFilters = true,
}: OrderHistoryListProps) {
  const { t, locale, direction } = useLocale();
  const router = useRouter();
  const cartContext = useCart();
  const isRtl = direction === "rtl";

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<number, boolean>>({});
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load orders safely without hydration mismatch
  const [clientOrders, setClientOrders] = useState<Order[]>(propOrders || INITIAL_MOCK_ORDERS);

  useEffect(() => {
    if (!propOrders) {
      setClientOrders(getMockOrders());
    } else {
      setClientOrders(propOrders);
    }
  }, [propOrders]);

  const allOrders = propOrders || clientOrders;

  // Filter orders by tab
  const filteredOrders = useMemo(() => {
    let list = [...allOrders];

    if (activeTab === "active") {
      list = list.filter((o) =>
        ["pending", "confirmed", "preparing", "ready"].includes(o.status)
      );
    } else if (activeTab === "completed") {
      list = list.filter((o) => o.status === "completed");
    } else if (activeTab === "cancelled") {
      list = list.filter((o) => o.status === "cancelled");
    }

    if (limit && limit > 0) {
      return list.slice(0, limit);
    }
    return list;
  }, [allOrders, activeTab, limit]);

  // Toggle expand state
  const toggleExpand = (orderId: number) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Reorder Handler: adds order items into active Cart
  const handleReorder = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setReorderingId(order.id);

    try {
      let addedCount = 0;

      for (const item of order.items) {
        // Try finding real product or build fallback from snapshot
        let product: Product | undefined = item.product_id
          ? getProductById(item.product_id, locale)
          : undefined;

        if (!product) {
          product = {
            id: item.product_id || Date.now(),
            name: item.product_name_snapshot,
            price: item.unit_price_snapshot,
            unit: "قطعة",
            primary_image: item.primary_image || "",
            stock_state: "available",
            stock_quantity: 50,
            seller_name: order.seller?.business_name || "مشغل الياسمين",
            seller: order.seller ? {
              id: order.seller.id,
              business_name: order.seller.business_name,
              neighborhood: "وسط البلد",
              city: "رام الله",
              is_verified: true,
            } : undefined,
            category: { id: 1, name: "منتجات", slug: "general" },
          };
        }

        const res = cartContext.addItem(product, item.quantity);
        if (res.success) {
          addedCount += item.quantity;
        } else if (res.conflict) {
          // If conflict occurred, switch and add
          cartContext.confirmSwitchSellerAndAdd(product, item.quantity);
          addedCount += item.quantity;
        }
      }

      const msg =
        locale === "ar"
          ? `تمت إضافة منتجات الطلب #${order.order_number} إلى السلة بنجاح`
          : `Items from order #${order.order_number} added to your cart`;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setReorderingId(null);
    }
  };

  // Status badge config
  const statusBadgeConfig: Record<
    OrderStatus,
    { variant: "warning" | "info" | "brand" | "success" | "danger"; labelAr: string; labelEn: string }
  > = {
    pending: { variant: "warning", labelAr: "قيد الانتظار", labelEn: "Pending" },
    confirmed: { variant: "info", labelAr: "تم التأكيد", labelEn: "Confirmed" },
    preparing: { variant: "brand", labelAr: "جاري التجهيز", labelEn: "Preparing" },
    ready: { variant: "brand", labelAr: "جاهز للتسليم", labelEn: "Ready for Delivery" },
    completed: { variant: "success", labelAr: "مكتمل", labelEn: "Completed" },
    cancelled: { variant: "danger", labelAr: "ملغي", labelEn: "Cancelled" },
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toast feedback notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-soft flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <Link
            href={`/${locale}/cart`}
            className="underline underline-offset-2 hover:text-emerald-100 text-[11px]"
          >
            {locale === "ar" ? "عرض السلة" : "View Cart"}
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      {showFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(
            [
              { key: "all", labelAr: "الكل", labelEn: "All" },
              { key: "active", labelAr: "النشطة", labelEn: "Active" },
              { key: "completed", labelAr: "المكتملة", labelEn: "Completed" },
              { key: "cancelled", labelAr: "الملغية", labelEn: "Cancelled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all select-none",
                activeTab === tab.key
                  ? "bg-brand-500 text-white shadow-soft"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
              )}
            >
              {locale === "ar" ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-500 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800">
            {locale === "ar" ? "لا توجد طلبات سابقة" : "No orders found"}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            {locale === "ar"
              ? "لم يتم العثور على أي طلبات في هذه القائمة. استكشف منتجات الحرفيين وأضف طلبك الأول!"
              : "No orders match this filter. Discover handcrafted local goods today!"}
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-soft hover:bg-brand-600 active:scale-95 transition-all"
            >
              {locale === "ar" ? "تصفح المنتجات الآن" : "Explore Catalog"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = Boolean(expandedOrderIds[order.id]);
            const badge = statusBadgeConfig[order.status] || {
              variant: "brand",
              labelAr: order.status,
              labelEn: order.status,
            };

            const formattedDate = (() => {
              try {
                const date = new Date(order.created_at);
                return new Intl.DateTimeFormat(
                  locale === "ar" ? "ar-EG" : "en-US",
                  { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
                ).format(date);
              } catch {
                return order.created_at;
              }
            })();

            const totalItemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm hover:border-neutral-300 transition-all space-y-3"
              >
                {/* Header Row: Order Number, Date, Status */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-brand-500" />
                      <span className="text-xs font-bold text-neutral-900 tabular-nums">
                        {order.order_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span suppressHydrationWarning>{formattedDate}</span>
                    </div>
                  </div>

                  <Badge variant={badge.variant} size="sm">
                    {locale === "ar" ? badge.labelAr : badge.labelEn}
                  </Badge>
                </div>

                {/* Seller & Items Thumbnail Preview */}
                <div className="space-y-2">
                  {order.seller && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Store className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-800">
                        {order.seller.business_name}
                      </span>
                    </div>
                  )}

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200/70 overflow-hidden relative shrink-0"
                      >
                        {item.primary_image ? (
                          <Image
                            src={item.primary_image}
                            alt={item.product_name_snapshot}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                            {item.quantity}x
                          </div>
                        )}
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 font-bold text-xs flex items-center justify-center shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-neutral-500">
                      {locale === "ar"
                        ? `${totalItemCount} منتجات • الإجمالي:`
                        : `${totalItemCount} items • Total:`}
                    </span>
                    <span className="font-bold text-neutral-900 ms-1 text-sm tabular-nums">
                      {order.total} ₪
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-brand-600 active:scale-95 transition-all"
                  >
                    <span>
                      {isExpanded
                        ? locale === "ar"
                          ? "إخفاء التفاصيل"
                          : "Hide Items"
                        : locale === "ar"
                        ? "عرض المحتويات"
                        : "View Items"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expandable Items List */}
                {isExpanded && (
                  <div className="bg-neutral-50/90 rounded-xl p-3 border border-neutral-200/60 divide-y divide-neutral-200/60 text-xs animate-in fade-in duration-150">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">
                            {item.product_name_snapshot}
                          </p>
                          <span className="text-[11px] text-neutral-500 tabular-nums">
                            {item.quantity} × {item.unit_price_snapshot} ₪
                          </span>
                        </div>
                        <span className="font-bold text-neutral-900 tabular-nums">
                          {item.line_total} ₪
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-1 flex items-center gap-2">
                  <Link
                    href={`/${locale}/orders/${order.id}`}
                    className="flex-1 inline-flex items-center justify-center py-2 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-800 active:scale-95 transition-all group"
                  >
                    <span>{locale === "ar" ? "تتبع الطلب" : "Track Order"}</span>
                    {isRtl ? (
                      <ChevronLeft className="w-3.5 h-3.5 ms-1 group-hover:-translate-x-0.5 transition-transform" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 ms-1 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => handleReorder(e, order)}
                    isLoading={reorderingId === order.id}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-soft"
                  >
                    <RotateCcw className="w-3.5 h-3.5 me-1" />
                    <span>{locale === "ar" ? "إعادة الطلب" : "Reorder"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryList;
