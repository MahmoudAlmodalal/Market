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
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 xl:px-12 py-3.5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/orders`}
            className="min-w-[40px] min-h-[40px] rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Back to orders"
          >
            {direction === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-neutral-900">
              {locale === "ar" ? "تفاصيل ومسار الطلب" : "Order Tracking"}
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-500 font-mono">
              #{order.order_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.seller?.phone && (
            <a
              href={`tel:${order.seller.phone}`}
              className="min-w-[40px] min-h-[40px] rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Call Seller"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content: Responsive 2-column on desktop (lg:) */}
      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Left / Top Column: Live Stepper Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <Card className="p-4 sm:p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-soft-sm">
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3.5">
                {locale === "ar" ? "مسار التقدم المباشر" : "Live Delivery Stepper"}
              </h2>
              <OrderProgressStepper status={order.status} timeline={order.timeline} />
            </Card>
          </div>

          {/* Right Column: Full Order Receipt Breakdown */}
          <div className="lg:col-span-7">
            <OrderReceiptCard
              order={order}
              onCancelClick={() => setIsCancelModalOpen(true)}
            />
          </div>
        </div>
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
