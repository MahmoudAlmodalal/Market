"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "@/lib/context/LocaleContext";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderTimelineItem } from "@/types/order";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  ChefHat,
  Truck,
  XCircle,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface OrderProgressStepperProps {
  status: OrderStatus;
  timeline?: OrderTimelineItem[];
  cancellationReason?: string;
  className?: string;
  variant?: "horizontal" | "vertical" | "full";
}

interface StepConfig {
  key: OrderStatus;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepConfig[] = [
  {
    key: "pending",
    labelAr: "قيد الانتظار",
    labelEn: "Pending",
    descAr: "تم استلام الطلب وبانتظار تأكيد المتجر للبدء بالتجهيز",
    descEn: "Order placed, awaiting merchant confirmation",
    icon: Clock,
  },
  {
    key: "confirmed",
    labelAr: "تم التأكيد",
    labelEn: "Confirmed",
    descAr: "تمت مراجعة وتأكيد توفر كافة المكونات من قبل المتجر",
    descEn: "Merchant confirmed items and accepted order",
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    labelAr: "جاري التجهيز",
    labelEn: "Preparing",
    descAr: "يقوم الحرفي حالياً بتحضير وتغليف المنتجات بعناية",
    descEn: "Merchant is preparing and packing your order",
    icon: ChefHat,
  },
  {
    key: "ready",
    labelAr: "جاهز للتسليم",
    labelEn: "Ready for Delivery",
    descAr: "الطلب جاهز للتسليم، وجاري التنسيق مع مندوب التوصيل",
    descEn: "Order is ready for pickup and courier handover",
    icon: Truck,
  },
  {
    key: "completed",
    labelAr: "تم الاستلام",
    labelEn: "Completed",
    descAr: "تم تسليم الطلب للعميل بنجاح وتم تحصيل المبلغ",
    descEn: "Order delivered successfully to customer",
    icon: PackageCheck,
  },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
  cancelled: -1,
};

export function OrderProgressStepper({
  status,
  timeline = [],
  cancellationReason,
  className,
  variant = "full",
}: OrderProgressStepperProps) {
  const { locale, direction } = useLocale();
  const isRtl = direction === "rtl";
  const isCancelled = status === "cancelled";
  const currentIndex = STATUS_ORDER[status] ?? 0;

  // Hydration safety for date formatting
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString || !isMounted) return "";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } catch {
      return "";
    }
  };

  const getTimelineTime = (stepKey: OrderStatus) => {
    const item = timeline.find((t) => t.to_status === stepKey);
    return item ? formatTime(item.created_at) : "";
  };

  const getTimelineNote = (stepKey: OrderStatus, fallbackAr: string, fallbackEn: string) => {
    const item = timeline.find((t) => t.to_status === stepKey);
    if (item?.note) return item.note;
    return locale === "ar" ? fallbackAr : fallbackEn;
  };

  if (isCancelled) {
    const cancelTime = formatTime(
      timeline.find((t) => t.to_status === "cancelled")?.created_at
    );

    return (
      <div
        className={cn(
          "bg-red-50/80 border border-red-200/90 rounded-2xl p-5 text-red-950 space-y-3.5 shadow-soft-sm",
          className
        )}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <h3 className="font-bold text-base text-red-900 flex items-center gap-1.5">
                <span>{locale === "ar" ? "تم إلغاء هذا الطلب" : "Order Cancelled"}</span>
              </h3>
              {cancelTime && (
                <span className="text-xs font-semibold text-red-700 bg-red-100/90 px-2.5 py-1 rounded-full tabular-nums">
                  {cancelTime}
                </span>
              )}
            </div>

            <p className="text-xs text-red-800 leading-relaxed font-medium">
              {cancellationReason ||
                (locale === "ar"
                  ? "تم إلغاء الطلب بناءً على رغبة العميل وإعادة حجز المنتجات للمخزون."
                  : "This order was cancelled and items have been returned to stock.")}
            </p>

            <div className="flex items-center gap-2 text-xs text-red-700 font-semibold mt-3 pt-2.5 border-t border-red-200/60">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {locale === "ar"
                  ? "لم يتم خصم أي مبالغ، ويمكنك طلب المنتجات مجدداً في أي وقت."
                  : "No charges were made. You can reorder these items anytime."}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for top horizontal progress line
  const progressPercentage =
    currentIndex >= 0 ? (currentIndex / (STEPS.length - 1)) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-soft-sm space-y-6",
        className
      )}
    >
      {/* Header title with live indicator */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider">
            {locale === "ar" ? "مسار التقدم المباشر" : "Live Progress Tracking"}
          </h2>
        </div>

        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 border border-brand-100/80 px-2.5 py-0.5 rounded-full">
          {locale === "ar"
            ? `المرحلة ${currentIndex + 1} من ${STEPS.length}`
            : `Step ${currentIndex + 1} of ${STEPS.length}`}
        </span>
      </div>

      {/* Horizontal Bar Stepper */}
      <div className="pt-2 pb-1 px-1">
        <div className="relative flex items-center justify-between">
          {/* Background Gray Track */}
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-1.5 bg-neutral-100 rounded-full z-0" />

          {/* Active Gradient Filled Track */}
          <div
            className="absolute top-1/2 h-1.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700 ease-out z-0 shadow-sm"
            style={{
              [isRtl ? "right" : "left"]: "12px",
              width: `calc(${progressPercentage}% - 12px)`,
            }}
          />

          {/* Step Icon Nodes */}
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center group cursor-default"
              >
                <div
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted &&
                      "bg-emerald-600 text-white shadow-soft-sm ring-2 ring-emerald-100",
                    isCurrent &&
                      "bg-brand-500 text-white shadow-glow ring-4 ring-brand-100/90 scale-110 animate-pulse-subtle",
                    isUpcoming &&
                      "bg-white border-2 border-neutral-200 text-neutral-400 group-hover:border-neutral-300"
                  )}
                  aria-label={`${locale === "ar" ? step.labelAr : step.labelEn} - ${
                    isCompleted
                      ? locale === "ar"
                        ? "مكتمل"
                        : "Completed"
                      : isCurrent
                      ? locale === "ar"
                        ? "المرحلة الحالية"
                        : "Current step"
                      : locale === "ar"
                      ? "قادم"
                      : "Upcoming"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Micro step label for desktop */}
                <span
                  className={cn(
                    "hidden sm:block text-[11px] font-semibold mt-1.5 text-center whitespace-nowrap transition-colors",
                    isCurrent && "text-brand-600 font-bold",
                    isCompleted && "text-neutral-800",
                    isUpcoming && "text-neutral-400"
                  )}
                >
                  {locale === "ar" ? step.labelAr : step.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Detailed Timeline Section */}
      <div className="space-y-4 pt-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;
          const Icon = step.icon;
          const time = getTimelineTime(step.key);
          const note = getTimelineNote(step.key, step.descAr, step.descEn);

          return (
            <div
              key={step.key}
              className={cn(
                "relative flex items-start gap-3.5 transition-all duration-300 rounded-xl p-2.5",
                isCurrent && "bg-brand-50/40 border border-brand-100/80 shadow-soft-sm",
                isUpcoming && "opacity-45 hover:opacity-60"
              )}
            >
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute top-10 w-0.5 h-[calc(100%-12px)] transition-colors duration-300 z-0",
                    isRtl ? "right-6 -mr-[1px]" : "left-6 -ml-[1px]",
                    isCompleted ? "bg-emerald-500" : isCurrent ? "bg-brand-300" : "bg-neutral-200"
                  )}
                />
              )}

              {/* Step Icon Badge */}
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-300 shadow-xs",
                  isCompleted && "bg-emerald-600 text-white ring-2 ring-emerald-100",
                  isCurrent &&
                    "bg-brand-500 text-white shadow-soft ring-4 ring-brand-100 scale-105",
                  isUpcoming && "bg-neutral-100 border border-neutral-200 text-neutral-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold leading-tight",
                        isCurrent && "text-brand-600",
                        isCompleted && "text-neutral-900",
                        isUpcoming && "text-neutral-500"
                      )}
                    >
                      {locale === "ar" ? step.labelAr : step.labelEn}
                    </span>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-100/90 px-2 py-0.5 rounded-md animate-pulse">
                        <Sparkles className="w-3 h-3 text-brand-500" />
                        <span>{locale === "ar" ? "المرحلة الحالية" : "Active Stage"}</span>
                      </span>
                    )}
                  </div>

                  {time ? (
                    <span className="text-[11px] font-semibold text-neutral-500 tabular-nums bg-neutral-100 px-2.5 py-0.5 rounded-md">
                      {time}
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {locale === "ar" ? "قيد التنفيذ الآن" : "In Progress"}
                    </span>
                  ) : null}
                </div>

                <p
                  className={cn(
                    "text-xs leading-relaxed font-normal",
                    isCurrent ? "text-neutral-800 font-medium" : "text-neutral-600"
                  )}
                >
                  {note}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance Footer */}
      <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs text-neutral-600 flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="leading-relaxed">
          {locale === "ar"
            ? "يتم تحديث مسار الطلب آلياً عند إتمام كل خطوة بواسطة التاجر أو مندوب التوصيل."
            : "Tracking milestones are updated in real-time by the artisan and courier."}
        </span>
      </div>
    </div>
  );
}

export default OrderProgressStepper;
