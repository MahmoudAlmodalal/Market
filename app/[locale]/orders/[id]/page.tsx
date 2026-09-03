"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  Phone,
  HelpCircle,
  Share2,
  Printer,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  PackageCheck,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useLocale, useTranslation } from "@/lib/context/LocaleContext";
import { OrderProgressStepper } from "@/components/orders/OrderProgressStepper";
import { OrderReceiptCard } from "@/components/orders/OrderReceiptCard";
import { CancelOrderModal } from "@/components/orders/CancelOrderModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  getMockOrders,
  INITIAL_MOCK_ORDERS,
  updateOrderStatusDirectly,
} from "@/lib/mock/orders";
import type { Order, OrderStatus } from "@/types/order";

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
  const isRtl = direction === "rtl";
  const { success, info } = useToast();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, user, locale, router]);

  const orderId = parseInt(resolvedParams.id, 10);
  const initialOrder =
    INITIAL_MOCK_ORDERS.find(
      (o: Order) => o.id === orderId || o.order_number === resolvedParams.id
    ) || INITIAL_MOCK_ORDERS[0];

  const [order, setOrder] = useState<Order>(initialOrder);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const allOrders = getMockOrders();
    const foundOrder = allOrders.find(
      (o: Order) => o.id === orderId || o.order_number === resolvedParams.id
    );
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [resolvedParams.id, orderId]);

  const handleSuccessCancel = (cancelledOrder: Order) => {
    setOrder(cancelledOrder);
    setIsCancelModalOpen(false);
    success(
      locale === "ar"
        ? "تم إلغاء الطلب بنجاح وإعادة المنتجات للمخزون"
        : "Order was cancelled successfully"
    );
  };

  const handleStatusSimulator = (status: OrderStatus) => {
    const res = updateOrderStatusDirectly(order.id, status);
    if (res.success && res.order) {
      setOrder({ ...res.order });
      info(
        locale === "ar"
          ? `تم تحديث حالة الطلب إلى: ${status}`
          : `Order status changed to: ${status}`
      );
    }
  };

  const handleCopyOrderNumber = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.order_number);
      setCopiedId(true);
      success(
        locale === "ar"
          ? `تم نسخ رقم الطلب (${order.order_number}) إلى الحافظة`
          : `Order number (${order.order_number}) copied to clipboard`
      );
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined") {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: `طلب سوقي #${order.order_number}`,
          text: `تتبع طلبي من سوقي: #${order.order_number}`,
          url,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        success(
          locale === "ar"
            ? "تم نسخ رابط تتبع الطلب بنجاح"
            : "Order tracking link copied to clipboard"
        );
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleReorder = () => {
    success(
      locale === "ar"
        ? `تمت إضافة منتجات الطلب #${order.order_number} إلى سلتك بنجاح!`
        : `Items from #${order.order_number} added to your cart!`
    );
  };

  // Status configuration for the Hero Status Card
  const statusHeroConfig: Record<
    OrderStatus,
    {
      titleAr: string;
      titleEn: string;
      descAr: string;
      descEn: string;
      etaAr: string;
      etaEn: string;
      badgeVariant: "warning" | "info" | "brand" | "success" | "danger";
      icon: React.ComponentType<{ className?: string }>;
      colorClass: string;
      bgGlow: string;
    }
  > = {
    pending: {
      titleAr: "طلبك قيد المراجعة والانتظار",
      titleEn: "Order Pending Confirmation",
      descAr: "يقوم المتجر بمراجعة تفاصيل طلبك الآن لتأكيد توفر كافة المكونات وبدء التجهيز.",
      descEn: "Merchant is reviewing your order items to confirm availability and start preparation.",
      etaAr: "التسليم المتوقع: اليوم خلال 45 - 60 دقيقة",
      etaEn: "Estimated delivery: Today within 45 - 60 mins",
      badgeVariant: "warning",
      icon: Clock,
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      bgGlow: "from-amber-500/10 via-brand-500/5 to-transparent",
    },
    confirmed: {
      titleAr: "تم تأكيد طلبك بنجاح",
      titleEn: "Order Confirmed by Merchant",
      descAr: "وافق المتجر على الطلب وبدأ تجهيز مستلزمات التعبئة والشحن بعناية.",
      descEn: "Artisan accepted your order and is readying packaging and materials.",
      etaAr: "التسليم المتوقع: اليوم خلال 35 - 50 دقيقة",
      etaEn: "Estimated delivery: Today within 35 - 50 mins",
      badgeVariant: "info",
      icon: CheckCircle2,
      colorClass: "text-blue-600 bg-blue-50 border-blue-200",
      bgGlow: "from-blue-500/10 via-brand-500/5 to-transparent",
    },
    preparing: {
      titleAr: "جاري تجهيز وتغليف طلبك",
      titleEn: "Preparing & Packing Order",
      descAr: "يقوم الحرفي حالياً بتحضير وتنسيق منتجاتك اليدوية بحب وعناية تامة.",
      descEn: "The artisan is carefully crafting and packing your handmade products.",
      etaAr: "التسليم المتوقع: اليوم خلال 25 - 40 دقيقة",
      etaEn: "Estimated delivery: Today within 25 - 40 mins",
      badgeVariant: "brand",
      icon: ChefHat,
      colorClass: "text-brand-600 bg-brand-50 border-brand-200",
      bgGlow: "from-brand-500/15 via-orange-500/5 to-transparent",
    },
    ready: {
      titleAr: "الطلب جاهز وفي طريق التوصيل",
      titleEn: "Out for Delivery",
      descAr: "استلم مندوب التوصيل الشحنة وهو في طريقه المباشر إلى عنوانك المسجل.",
      descEn: "The courier has picked up your package and is on the way to your delivery address.",
      etaAr: "المندوب في الطريق إليك (وصول متوقع خلال 10 - 20 دقيقة)",
      etaEn: "Courier is on the way (Arriving in 10 - 20 mins)",
      badgeVariant: "brand",
      icon: Truck,
      colorClass: "text-brand-600 bg-brand-50 border-brand-200",
      bgGlow: "from-brand-500/15 via-emerald-500/5 to-transparent",
    },
    completed: {
      titleAr: "تم تسليم الطلب بنجاح",
      titleEn: "Order Delivered Successfully",
      descAr: "تم استلام الطلب بالكامل. شكراً لدعمك الحرفيين والمنتجات المنزلية في فلسطين عبر سوقي.",
      descEn: "Order has been delivered. Thank you for supporting local artisans via Souqi!",
      etaAr: "تم التسليم بنجاح وتم سداد المبلغ نقداً عند الاستلام",
      etaEn: "Delivered & paid via Cash on Delivery",
      badgeVariant: "success",
      icon: PackageCheck,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      bgGlow: "from-emerald-500/15 via-brand-500/5 to-transparent",
    },
    cancelled: {
      titleAr: "تم إلغاء هذا الطلب",
      titleEn: "Order Has Been Cancelled",
      descAr: "تم إلغاء الطلب بناءً على رغبة العميل، وتمت استعادة المنتجات إلى مخزون المتجر دون أي رسوم.",
      descEn: "This order was cancelled by customer request. No charges were made and items returned to stock.",
      etaAr: "الطلب ملغي - يمكنك إعادة الطلب في أي وقت",
      etaEn: "Order cancelled - you can reorder anytime",
      badgeVariant: "danger",
      icon: XCircle,
      colorClass: "text-red-600 bg-red-50 border-red-200",
      bgGlow: "from-red-500/15 via-neutral-500/5 to-transparent",
    },
  };

  const heroConfig = statusHeroConfig[order.status] || statusHeroConfig.pending;
  const HeroIcon = heroConfig.icon;

  const formattedDate = (() => {
    if (!isMounted) return "";
    try {
      const date = new Date(order.created_at);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } catch {
      return order.created_at;
    }
  })();

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto pb-24 md:pb-16 animate-in fade-in duration-200">
      {/* Interactive Lifecycle Simulator Bar (Dev/Reviewer Demo) */}
      <div className="no-print bg-neutral-900 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs flex-wrap border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-neutral-200">
            {locale === "ar" ? "محاكي حالات الطلب المباشر:" : "Order Status Simulator:"}
          </span>
          <span className="text-neutral-400 hidden md:inline">
            ({locale === "ar" ? "اضغط لتجربة تفاعل الواجهة في كل مرحلة" : "Click to preview each stage"})
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as OrderStatus[]).map(
            (st) => {
              const isActive = order.status === st;
              const labelsAr: Record<OrderStatus, string> = {
                pending: "قيد الانتظار",
                confirmed: "تم التأكيد",
                preparing: "التجهيز",
                ready: "جاهز للتسليم",
                completed: "تم الاستلام",
                cancelled: "ملغي",
              };
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusSimulator(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isActive
                      ? "bg-brand-500 text-white ring-2 ring-brand-300 scale-105"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {locale === "ar" ? labelsAr[st] : st}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Top Sticky Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 xl:px-12 py-3 border-b border-neutral-100 flex items-center justify-between no-print">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href={`/${locale}/orders`}
            className="min-w-[40px] min-h-[40px] rounded-xl text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 border border-neutral-200/70"
            aria-label="Back to orders"
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>

          <div className="min-w-0">
            {/* Breadcrumb row */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400 mb-0.5">
              <Link href={`/${locale}`} className="hover:text-neutral-700 transition-colors">
                {locale === "ar" ? "الرئيسية" : "Home"}
              </Link>
              {isRtl ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Link href={`/${locale}/orders`} className="hover:text-neutral-700 transition-colors">
                {locale === "ar" ? "طلباتي" : "My Orders"}
              </Link>
              {isRtl ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span className="text-neutral-700 font-mono font-bold truncate">
                #{order.order_number}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-neutral-900 truncate">
                {locale === "ar" ? "تفاصيل ومسار الطلب" : "Order Tracking & Details"}
              </h1>
              <span className="font-mono text-xs text-neutral-500 font-bold hidden sm:inline">
                (#{order.order_number})
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            title={locale === "ar" ? "مشاركة رابط التتبع" : "Share Tracking Link"}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">{locale === "ar" ? "مشاركة" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            title={locale === "ar" ? "طباعة الفاتورة" : "Print Invoice"}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">{locale === "ar" ? "طباعة" : "Print"}</span>
          </button>

          {order.seller?.phone && (
            <a
              href={`tel:${order.seller.phone}`}
              className="h-10 px-3.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200/80 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
              aria-label="Call Seller"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === "ar" ? "اتصال بالمتجر" : "Call Store"}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="px-3 sm:px-6 lg:px-8 xl:px-12 py-5 sm:py-7 space-y-6">
        {/* Order Status Hero Banner */}
        <div
          className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${heroConfig.bgGlow} bg-white p-5 sm:p-7 shadow-soft-sm transition-all duration-300`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            {/* Status Information */}
            <div className="flex items-start gap-4 min-w-0">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-soft-sm ${heroConfig.colorClass}`}
              >
                <HeroIcon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant={heroConfig.badgeVariant} size="lg">
                    {locale === "ar" ? heroConfig.titleAr : heroConfig.titleEn}
                  </Badge>

                  {order.status !== "cancelled" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{locale === "ar" ? "متابعة مباشرة" : "Live Tracking"}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-tight">
                  {locale === "ar" ? heroConfig.titleAr : heroConfig.titleEn}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl font-medium">
                  {locale === "ar" ? heroConfig.descAr : heroConfig.descEn}
                </p>

                {/* Estimated Delivery Box */}
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-brand-700 flex-wrap">
                  <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>{locale === "ar" ? heroConfig.etaAr : heroConfig.etaEn}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-s border-neutral-200/80 pt-3 md:pt-0 md:ps-6">
              {/* Order ID Box */}
              <div className="flex-1 md:flex-none bg-white/90 backdrop-blur-sm border border-neutral-200/80 rounded-2xl p-2.5 sm:px-3.5 sm:py-2">
                <span className="text-[10px] font-semibold text-neutral-400 block mb-0.5">
                  {locale === "ar" ? "رقم الطلب" : "Order Number"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-neutral-900 hover:text-brand-600 transition-colors font-mono"
                  title="Copy"
                >
                  <span>{order.order_number}</span>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </button>
              </div>

              {/* Total Price Box */}
              <div className="flex-1 md:flex-none bg-white/90 backdrop-blur-sm border border-neutral-200/80 rounded-2xl p-2.5 sm:px-3.5 sm:py-2">
                <span className="text-[10px] font-semibold text-neutral-400 block mb-0.5">
                  {locale === "ar" ? "المبلغ الكلي المطلوب" : "Total Amount"}
                </span>
                <span className="text-xs sm:text-sm font-black text-brand-600 font-mono">
                  {order.total} ₪
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Stepper Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-4">
            <OrderProgressStepper
              status={order.status}
              timeline={order.timeline}
              cancellationReason={order.cancellation_reason}
            />

            {/* Quality & Delivery Guarantee Badge */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-soft-sm flex items-start gap-3 text-xs text-neutral-600 no-print">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-900 mb-0.5">
                  {locale === "ar" ? "ضمان سوقي للمشتري 100%" : "Souqi Buyer Guarantee 100%"}
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {locale === "ar"
                    ? "جميع المنتجات مصنوعة بجودة عالية من حرفيين محليين ومضمونة حتى باب منزلك مع حق الفحص قبل الدفع."
                    : "Every item is handmade by verified artisans and inspected upon delivery before payment."}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Breakdown Column */}
          <div className="lg:col-span-7">
            <OrderReceiptCard
              order={order}
              onCancelClick={() => setIsCancelModalOpen(true)}
              onReorderClick={handleReorder}
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

