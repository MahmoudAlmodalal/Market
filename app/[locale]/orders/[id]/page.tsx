"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Store, Phone, HelpCircle } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { OrderProgressStepper } from "@/components/orders/OrderProgressStepper";
import { OrderReceiptCard } from "@/components/orders/OrderReceiptCard";
import { CancelOrderModal } from "@/components/orders/CancelOrderModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getMockOrders } from "@/lib/mock/orders";
import type { Order } from "@/types/order";

interface OrderDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const { locale, direction } = useLocale();
  const { t } = useTranslation();

  const allOrders = getMockOrders();
  const orderId = parseInt(resolvedParams.id, 10);
  const foundOrder = allOrders.find(
    (o: Order) => o.id === orderId || o.order_number === resolvedParams.id
  ) || allOrders[0];

  const [order, setOrder] = useState<Order>(foundOrder);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleSuccessCancel = (cancelledOrder: Order) => {
    setOrder(cancelledOrder);
    setIsCancelModalOpen(false);
  };

  return (
    <div className="w-full pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/orders`}
            className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
            aria-label="Back to orders"
          >
            {direction === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900">
              {locale === "ar" ? "تفاصيل ومسار الطلب" : "Order Tracking"}
            </h1>
            <p className="text-[11px] text-neutral-500 font-mono">
              #{order.order_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.seller?.phone && (
            <a
              href={`tel:${order.seller.phone}`}
              className="p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 active:scale-95 transition-all"
              aria-label="Call Seller"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Live Stepper Card */}
        <Card className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-soft-sm">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            {locale === "ar" ? "مسار التقدم المباشر" : "Live Delivery Stepper"}
          </h2>
          <OrderProgressStepper status={order.status} timeline={order.timeline} />
        </Card>

        {/* Full Order Receipt Breakdown */}
        <OrderReceiptCard
          order={order}
          onCancelClick={() => setIsCancelModalOpen(true)}
        />
      </div>

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          orderId={order.id}
          orderStatus={order.status}
          onSuccess={handleSuccessCancel}
        />
      )}
    </div>
  );
}
