"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  AlertCircle,
  ShoppingBag,
  Store,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { DeliveryTimeSlotPicker } from "@/components/checkout/DeliveryTimeSlotPicker";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import {
  MOCK_SAVED_ADDRESSES,
  MOCK_DELIVERY_SLOTS,
  type DeliveryTimeSlot,
} from "@/lib/mock/cart";
import { createMockOrder } from "@/lib/mock/orders";
import type { Address, OrderItem } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const { cart, itemCount, clearCart, hasBlockingIssues, isLoading, getPricingBreakdown } = useCart();

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>(MOCK_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(
    MOCK_SAVED_ADDRESSES[0]?.id
  );

  // Delivery slot state
  const [deliverySlots] = useState<DeliveryTimeSlot[]>(MOCK_DELIVERY_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    MOCK_DELIVERY_SLOTS.find((s) => s.isAvailable)?.id || "slot-1"
  );

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");

  // Order notes
  const [notes, setNotes] = useState<string>("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected address object
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Selected time slot object
  const selectedSlot =
    deliverySlots.find((s) => s.id === selectedSlotId) || deliverySlots[0];

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
  };

  const handleAddAddress = (newAddr: Address) => {
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddressId(newAddr.id);
  };

  const handleUpdateAddress = (updated: Address) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  // Idempotent order submit handler
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    // Validation 1: Cart check
    if (cart.items.length === 0) {
      setSubmitError(locale === "ar" ? "سلتك فارغة" : "Your cart is empty");
      return;
    }

    // Validation 2: Blocking issues
    if (hasBlockingIssues) {
      setSubmitError(
        locale === "ar"
          ? "يرجى حل تنبيهات الأسعار والمخزون في السلة قبل إتمام الطلب"
          : "Please resolve cart alerts before checkout"
      );
      return;
    }

    // Validation 3: Address selected
    if (!selectedAddress) {
      setSubmitError(
        locale === "ar"
          ? "يرجى اختيار أو إضافة عنوان للتوصيل"
          : "Please select or add a delivery address"
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Generate unique idempotency key
      const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const breakdown = getPricingBreakdown();

      // Transform cart items to order items snapshot
      const orderItems: OrderItem[] = cart.items.map((item, idx) => ({
        id: idx + 1,
        product_id: item.product_id,
        product_name_snapshot: item.name,
        unit_price_snapshot: item.unit_price,
        quantity: item.quantity,
        line_total: item.line_total,
        primary_image: item.primary_image,
      }));

      // Full delivery address string
      const fullAddressStr = `${selectedAddress.city}، ${
        selectedAddress.neighborhood ? `${selectedAddress.neighborhood}، ` : ""
      }${selectedAddress.street}`;

      // Create new order in mock store
      const newOrder = createMockOrder({
        seller: cart.seller
          ? {
              id: cart.seller.id,
              business_name: cart.seller.business_name,
              phone: cart.seller.phone || "+970 59-911-2233",
            }
          : undefined,
        items: orderItems,
        subtotal: breakdown.subtotal,
        delivery_fee: breakdown.delivery_fee,
        total: breakdown.total,
        contact_name: selectedAddress.name || "محمود أحمد",
        contact_phone: selectedAddress.phone || "+970 59-912-3456",
        delivery_address: fullAddressStr,
        notes: notes.trim() || undefined,
      });

      // Save confirmation snapshot to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "souqi_last_order",
          JSON.stringify({
            order: newOrder,
            timeSlot: selectedSlot,
            paymentMethod,
            idempotencyKey,
          })
        );
      }

      // Clear cart
      clearCart();

      // Navigate to confirmation page
      router.push(
        `/${locale}/checkout/confirmation?orderId=${newOrder.id}&orderNumber=${newOrder.order_number}`
      );
    } catch (err) {
      console.error("Order submission failed:", err);
      setSubmitError(
        locale === "ar"
          ? "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى."
          : "Failed to place order. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-3 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-28 flex flex-col gap-4 max-w-[1600px] 2xl:max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart Guard State
  if (cart.items.length === 0 && !isSubmitting) {
    return (
      <div className="w-full min-h-[75vh] px-4 py-8 flex flex-col items-center justify-center text-center gap-5 max-w-md sm:max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-brand-50/80 border border-brand-100 flex items-center justify-center text-brand-400">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-1.5 max-w-xs sm:max-w-sm">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
            {t("cart.emptyTitle", "سلتك فارغة حالياً")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {locale === "ar"
              ? "لا يمكن متابعة إتمام الطلب لأن سلتك لا تحتوي على أي منتجات."
              : "Cannot proceed to checkout because your cart is empty."}
          </p>
        </div>

        <Button variant="primary" size="md" asChild className="font-bold shadow-soft min-h-[44px]">
          <Link href={`/${locale}/catalog`} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{t("cart.browseCatalog", "تصفح المنتجات")}</span>
          </Link>
        </Button>
      </div>
    );
  }

  // 3. Checkout Screen: Responsive 2-column layout on Desktop (lg:)
  return (
    <div className="w-full min-h-screen px-3 sm:px-6 lg:px-8 xl:px-12 pt-3 pb-28 md:pb-12 flex flex-col gap-5 max-w-[1600px] 2xl:max-w-[1800px] mx-auto animate-in fade-in duration-200 text-start">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/cart`}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={t("common.back", "رجوع للسلة")}
          >
            {direction === "rtl" ? (
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-xl font-extrabold text-neutral-900 leading-tight">
              {t("checkout.title", "إتمام الطلب")}
            </h1>
            <span className="text-[11px] sm:text-xs text-neutral-500">
              {cart.seller?.business_name || (locale === "ar" ? "متجر محلي" : "Local Seller")}
            </span>
          </div>
        </div>

        <Badge variant="primary" size="sm" className="font-mono">
          {itemCount} {locale === "ar" ? "منتجات" : "items"}
        </Badge>
      </div>

      {/* Error Alert (if any) */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-red-900 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">{locale === "ar" ? "تنبيه" : "Notice"}</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Responsive 2-Column Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (lg:col-span-7): Forms, Delivery Address, Time slot, Payment, Notes */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Section 1: Delivery Address */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                {t("checkout.deliveryInfo", "عنوان التوصيل والاستلام")}
              </h2>
            </div>

            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleSelectAddress}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
            />
          </div>

          {/* Section 2: Preferred Delivery Window */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                {t("checkout.deliveryTime", "وقت التوصيل المفضل")}
              </h2>
            </div>

            <DeliveryTimeSlotPicker
              slots={deliverySlots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
            />
          </div>

          {/* Section 3: Payment Method */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                {t("checkout.paymentMethod", "طريقة الدفع")}
              </h2>
            </div>

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

          {/* Section 4: Special Instructions / Order Notes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <label
                htmlFor="order-notes"
                className="text-sm sm:text-base font-bold text-neutral-900"
              >
                {t("checkout.orderNotes", "ملاحظات إضافية للبائع (اختياري)")}
              </label>
            </div>

            <textarea
              id="order-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                "checkout.orderNotesPlaceholder",
                "أي تعليمات خاصة بتغليف المنتجات أو إرشادات للمندوب..."
              )}
              className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-neutral-300 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition-all"
            />
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Sticky Order Summary & Review */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <CheckoutSummary
            address={selectedAddress}
            timeSlot={selectedSlot}
            paymentMethod={paymentMethod}
            notes={notes}
            onSubmitOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
            disabled={!selectedAddress || hasBlockingIssues || isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

