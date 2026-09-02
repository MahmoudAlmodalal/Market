"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, ArrowLeft, Home, Clock } from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function OrderConfirmationPage() {
  const { locale, direction } = useLocale();
  const { t } = useTranslation();
  const [orderNumber, setOrderNumber] = useState("SQ-849201");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("last_order_number");
      if (stored) setOrderNumber(stored);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
      {/* Success Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 shadow-glow animate-bounce">
          <CheckCircle className="w-12 h-12 text-brand-500" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-2xl font-black text-neutral-900 mb-2">
        {locale === "ar" ? "تم تأكيد طلبك بنجاح!" : "Order Confirmed Successfully!"}
      </h1>
      <p className="text-sm text-neutral-500 max-w-xs mb-6 leading-relaxed">
        {locale === "ar"
          ? "شكراً لتسوقك من متاجر الحي عبر سوقي. تم إرسال إشعار للمتجر لبدء تجهيز طلبك."
          : "Thank you for shopping from neighborhood stores. The seller has been notified to prepare your items."}
      </p>

      {/* Order Badge & Info */}
      <Card className="w-full max-w-sm p-5 mb-8 bg-neutral-50/70 border border-neutral-200/80 rounded-2xl text-start flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3">
          <span className="text-xs text-neutral-500 font-medium">
            {locale === "ar" ? "رقم الطلب" : "Order ID"}
          </span>
          <Badge variant="primary" className="font-mono font-bold">
            {orderNumber}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-700">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <Clock className="w-4 h-4 text-brand-500" />
            {locale === "ar" ? "الموعد المتوقع للتسليم" : "Estimated Arrival"}
          </span>
          <span className="font-bold text-neutral-900">
            {locale === "ar" ? "اليوم، 30 - 45 دقيقة" : "Today, 30 - 45 mins"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-700">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <Package className="w-4 h-4 text-brand-500" />
            {locale === "ar" ? "حالة الطلب" : "Current Status"}
          </span>
          <Badge variant="warning" size="sm">
            {locale === "ar" ? "قيد المراجعة" : "Pending"}
          </Badge>
        </div>
      </Card>

      {/* Action CTA Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link href={`/${locale}/orders`} className="w-full">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={direction === "rtl" ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          >
            {locale === "ar" ? "متابعة مسار الطلب" : "Track Order Live"}
          </Button>
        </Link>

        <Link href={`/${locale}`} className="w-full">
          <Button variant="outline" size="lg" fullWidth leftIcon={<Home className="w-4 h-4" />}>
            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
