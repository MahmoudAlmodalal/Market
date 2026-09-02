"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { OrderHistoryList } from "@/components/profile/OrderHistoryList";
import { Button } from "@/components/ui/Button";
import { getMockOrders } from "@/lib/mock/orders";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>(() => getMockOrders());

  return (
    <div className="w-full pb-24 animate-in fade-in duration-200">
      {/* Top Page Header */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
            aria-label="Back to Home"
          >
            {direction === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900">
              {locale === "ar" ? "طلباتي السابقة والحالية" : "My Orders"}
            </h1>
            <p className="text-[11px] text-neutral-500">
              {orders.length} {locale === "ar" ? "طلبات مسجلة" : "orders recorded"}
            </p>
          </div>
        </div>

        <Link href={`/${locale}/catalog`}>
          <Button variant="secondary" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            {locale === "ar" ? "تصفح السوق" : "Shop"}
          </Button>
        </Link>
      </div>

      {/* Orders List Component */}
      <div className="p-4">
        <OrderHistoryList
          orders={orders}
        />
      </div>
    </div>
  );
}
