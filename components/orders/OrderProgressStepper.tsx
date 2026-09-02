"use client";

import React from "react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
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
    descAr: "تم استلام الطلب وبانتظار تأكيد المتجر",
    descEn: "Order placed, awaiting merchant confirmation",
    icon: Clock,
  },
  {
    key: "confirmed",
    labelAr: "تم التأكيد",
    labelEn: "Confirmed",
    descAr: "تم تأكيد توفر المنتجات وقبول الطلب",
    descEn: "Merchant confirmed items and accepted order",
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    labelAr: "جاري التجهيز",
    labelEn: "Preparing",
    descAr: "يقوم المتجر بتحضير وتغليف طلبك بعناية",
    descEn: "Merchant is preparing and packing your order",
    icon: ChefHat,
  },
  {
    key: "ready",
    labelAr: "جاهز للتسليم",
    labelEn: "Ready for Delivery",
    descAr: "تم تجهيز الطلب وبانتظار مندوب التوصيل",
    descEn: "Order is ready for pickup/courier handover",
    icon: Truck,
  },
  {
    key: "completed",
    labelAr: "تم الاستلام",
    labelEn: "Completed",
    descAr: "تم تسليم الطلب بنجاح للعميل",
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
  const { t, locale, direction } = useLocale();
  const isRtl = direction === "rtl";
  const isCancelled = status === "cancelled";
  const currentIndex = STATUS_ORDER[status] ?? 0;

  // Helper to format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
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

  // Helper to find timeline item timestamp for step
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
          "bg-danger-50 border border-danger-200 rounded-2xl p-4.5 text-danger-900",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-danger-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-base text-danger-900">
                {locale === "ar" ? "تم إلغاء هذا الطلب" : "Order Cancelled"}
              </h3>
              {cancelTime && (
                <span className="text-xs font-medium text-danger-700 bg-danger-100/80 px-2 py-0.5 rounded-md">
                  {cancelTime}
                </span>
              )}
            </div>
            <p className="text-xs text-danger-700 leading-relaxed mb-2">
              {cancellationReason ||
                (locale === "ar"
                  ? "تم إلغاء الطلب وإعادة المنتجات للمخزون."
                  : "This order was cancelled and inventory has been restored.")}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-danger-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                {locale === "ar"
                  ? "لا يمكن استئناف الطلب بعد إلغائه"
                  : "Cancelled orders cannot be resumed"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm",
        className
      )}
    >
      {/* Horizontal Top Progress Bar */}
      <div className="mb-6 pt-2 px-1">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-neutral-100 rounded-full z-0" />

          {/* Active Filled Track Line */}
          <div
            className="absolute top-1/2 h-1 bg-brand-500 rounded-full transition-all duration-500 ease-out z-0"
            style={{
              [isRtl ? "right" : "left"]: 0,
              width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {/* Stepper Dots */}
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center group"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted &&
                      "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-100",
                    isCurrent &&
                      "bg-brand-500 text-white shadow-soft ring-4 ring-brand-100 scale-110 animate-pulse-subtle",
                    isUpcoming &&
                      "bg-white border-2 border-neutral-300 text-neutral-400"
                  )}
                  aria-label={`${locale === "ar" ? step.labelAr : step.labelEn} - ${
                    isCompleted
                      ? locale === "ar"
                        ? "مكتمل"
                        : "Completed"
                      : isCurrent
                      ? locale === "ar"
                        ? "الحالة الحالية"
                        : "Current step"
                      : locale === "ar"
                      ? "قادم"
                      : "Pending"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Detailed Timeline Section */}
      <div className="space-y-4 pt-1">
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
                "relative flex items-start gap-3.5 transition-opacity duration-200",
                isUpcoming && "opacity-45"
              )}
            >
              {/* Connector line between vertical items */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute top-8 w-0.5 h-[calc(100%-12px)] transition-colors duration-300",
                    isRtl ? "right-4 -mr-[1px]" : "left-4 -ml-[1px]",
                    isCompleted ? "bg-emerald-500" : isCurrent ? "bg-brand-300" : "bg-neutral-200"
                  )}
                />
              )}

              {/* Vertical Step Icon Badge */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300",
                  isCompleted && "bg-emerald-500 text-white shadow-xs",
                  isCurrent &&
                    "bg-brand-500 text-white shadow-soft ring-4 ring-brand-100 scale-105",
                  isUpcoming && "bg-neutral-100 border border-neutral-300 text-neutral-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2">
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

                  {time && (
                    <span className="text-xs font-semibold text-neutral-500 tabular-nums bg-neutral-100 px-2 py-0.5 rounded-md">
                      {time}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderProgressStepper;
