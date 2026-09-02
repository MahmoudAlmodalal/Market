"use client";

import React, { useState } from "react";
import { useLocale } from "@/lib/context/LocaleContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cancelOrder } from "@/lib/mock/orders";
import type { Order, OrderStatus } from "@/types/order";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  XCircle,
} from "lucide-react";

export interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderStatus: OrderStatus;
  onSuccess: (cancelledOrder: Order) => void;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  orderId,
  orderStatus,
  onSuccess,
}: CancelOrderModalProps) {
  const { t, locale } = useLocale();

  const reasonsList = [
    {
      id: "changed_mind",
      ar: "غيّرت رأيي / لم أعد بحاجة للمنتج",
      en: "Changed my mind / No longer needed",
    },
    {
      id: "ordered_by_mistake",
      ar: "طلب بالخطأ / تكرار الطلب",
      en: "Ordered by mistake / Duplicate order",
    },
    {
      id: "wrong_address",
      ar: "تعديل العنوان أو رقم الهاتف",
      en: "Need to change address or phone number",
    },
    {
      id: "delivery_delay",
      ar: "وقت التوصيل غير مناسب",
      en: "Delivery time is not suitable",
    },
    {
      id: "other",
      ar: "سبب آخر",
      en: "Other reason",
    },
  ];

  const [selectedReason, setSelectedReason] = useState(reasonsList[0].id);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEligibleForCancel =
    orderStatus === "pending" || orderStatus === "confirmed";

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const chosen = reasonsList.find((r) => r.id === selectedReason);
    const chosenText =
      selectedReason === "other"
        ? customReason.trim() || (locale === "ar" ? "سبب آخر" : "Other reason")
        : locale === "ar"
        ? chosen?.ar || "إلغاء بناءً على رغبة العميل"
        : chosen?.en || "Cancelled by customer request";

    // Simulate minor async latency for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = cancelOrder(orderId, chosenText);
    setIsSubmitting(false);

    if (result.success && result.order) {
      onSuccess(result.order);
      onClose();
    } else {
      setErrorMsg(
        result.error ||
          (locale === "ar"
            ? "تعذر إلغاء الطلب حالياً"
            : "Could not cancel order at this time")
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-danger-600 font-bold">
          <ShieldAlert className="w-5 h-5" />
          <span>{locale === "ar" ? "تأكيد إلغاء الطلب" : "Cancel Order Confirmation"}</span>
        </div>
      }
      description={
        locale === "ar"
          ? "يرجى تحديد سبب الإلغاء لتأكيد العملية."
          : "Please select a reason to confirm order cancellation."
      }
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-600 hover:bg-neutral-100"
          >
            {locale === "ar" ? "تراجع" : "Keep Order"}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirmCancel}
            isLoading={isSubmitting}
            disabled={!isEligibleForCancel || isSubmitting}
            className="bg-danger-600 hover:bg-danger-700 text-white font-bold shadow-soft"
          >
            {locale === "ar" ? "نعم، قم بإلغاء الطلب" : "Yes, Cancel Order"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-danger-50 border border-danger-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-danger-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">
              {locale === "ar" ? "تنبيه هام:" : "Important Notice:"}
            </span>
            {locale === "ar"
              ? "سيتم إلغاء الطلب فوراً وإعادة حجز المنتجات للمخزون. لا يمكن التراجع عن هذا الإجراء بعد تنفيذه."
              : "The order will be cancelled immediately and items returned to stock. This action cannot be reversed."}
          </div>
        </div>

        {/* State Ineligibility Notice if attempting to cancel late order */}
        {!isEligibleForCancel && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 text-warning-900 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0" />
            <span>
              {locale === "ar"
                ? `لا يمكن إلغاء الطلب وهو في مرحلة "${orderStatus}". الإلغاء متاح فقط في مرحلتي قيد الانتظار وتأكيد الطلب.`
                : `Cannot cancel an order in "${orderStatus}" stage. Cancellation is only allowed for Pending or Confirmed orders.`}
            </span>
          </div>
        )}

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-800">
            {locale === "ar" ? "ما سبب الإلغاء؟" : "Reason for cancellation:"}
          </label>

          <div className="space-y-2">
            {reasonsList.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <label
                  key={reason.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? "bg-brand-50/50 border-brand-500 text-brand-950 font-bold"
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={reason.id}
                    checked={isSelected}
                    onChange={() => setSelectedReason(reason.id)}
                    className="w-4 h-4 text-brand-500 border-neutral-300 focus:ring-brand-500"
                  />
                  <span>{locale === "ar" ? reason.ar : reason.en}</span>
                </label>
              );
            })}
          </div>

          {selectedReason === "other" && (
            <div className="pt-2">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "يرجى كتابة سبب الإلغاء بالتفصيل..."
                    : "Please explain your reason..."
                }
                rows={2}
                className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-neutral-800"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-lg p-2.5 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CancelOrderModal;
