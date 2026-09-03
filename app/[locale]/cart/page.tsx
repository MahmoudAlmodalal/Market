"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Store,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartHeader } from "@/components/cart/CartHeader";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CouponInput } from "@/components/cart/CouponInput";
import { OrderPricingBreakdown } from "@/components/cart/OrderPricingBreakdown";
import { MultiSellerDialog } from "@/components/cart/MultiSellerDialog";

export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, direction } = useLocale();
  const {
    cart,
    itemCount,
    removeItem,
    updateQuantity,
    acceptPriceChange,
    clampQuantity,
    clearCart,
    hasBlockingIssues,
    isLoading,
    conflictState,
    confirmSwitchSellerAndAdd,
    closeConflictDialog,
  } = useCart();

  const [hasError, setHasError] = useState(false);

  const handleProceedToCheckout = () => {
    router.push(`/${locale}/checkout`);
  };

  const handleConfirmSwitch = () => {
    if (conflictState?.pendingProduct) {
      confirmSwitchSellerAndAdd(
        conflictState.pendingProduct,
        conflictState.pendingQuantity
      );
    }
    closeConflictDialog();
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-3 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-28 flex flex-col gap-4 max-w-[1600px] 2xl:max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error + Retry State
  if (hasError) {
    return (
      <div className="w-full min-h-[70vh] px-4 flex flex-col items-center justify-center text-center gap-4 max-w-md sm:max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-semantic-error">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900">
            {locale === "ar" ? "تعذر تحميل السلة" : "Failed to load cart"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            {locale === "ar"
              ? "حدث خطأ غير متوقع أثناء استرجاع بيانات السلة. يرجى المحاولة مرة أخرى."
              : "An unexpected error occurred while loading your cart data. Please try again."}
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => setHasError(false)}
          className="font-bold gap-2 min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t("common.retry", "إعادة المحاولة")}</span>
        </Button>
      </div>
    );
  }

  // 3. Empty Cart State
  if (cart.items.length === 0) {
    return (
      <div className="w-full min-h-[75vh] px-4 py-8 flex flex-col items-center justify-center text-center gap-5 max-w-md sm:max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-3xl bg-brand-50/80 border border-brand-100 flex items-center justify-center text-brand-400 shadow-sm">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-2 max-w-xs sm:max-w-sm">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
            {t("cart.emptyTitle", t("cart.empty_title", "سلتك فارغة حالياً"))}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            {t(
              "cart.emptyDesc",
              "لم تقم بإضافة أي منتجات من المتاجر المحلية بعد. استكشف أفضل المنتجات اليدوية والمصنوعة بحب!"
            )}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          asChild
          className="mt-2 font-bold shadow-soft px-6 min-h-[44px]"
        >
          <Link href={`/${locale}/catalog`} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>
              {t("cart.browseCatalog", t("cart.empty_cta", "تصفح المنتجات الآن"))}
            </span>
            {direction === "rtl" ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Link>
        </Button>
      </div>
    );
  }

  // 4. Default / Populated State: Responsive 2-column layout on Desktop (lg:)
  return (
    <div className="w-full min-h-screen px-3 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-28 md:pb-12 flex flex-col gap-5 max-w-[1600px] 2xl:max-w-[1800px] mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-2xl font-extrabold text-neutral-900">
            {t("cart.title", "سلة المشتريات")}
          </h1>
          <Badge variant="primary" size="sm" className="font-mono">
            {itemCount} {locale === "ar" ? "قطع" : "items"}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-neutral-500 hover:text-semantic-error text-xs sm:text-sm min-h-[38px] px-3"
        >
          {t("cart.clearCart", "تفريغ السلة")}
        </Button>
      </div>

      {/* Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (lg:col-span-8): Seller info, Cart Items, Coupon */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Single Seller Header */}
          {cart.seller && (
            <CartHeader
              seller={cart.seller}
              onClearCart={clearCart}
            />
          )}

          {/* Cart Line Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-500 px-1">
              <span>{locale === "ar" ? "قائمة المنتجات" : "Item List"}</span>
              <span className="text-neutral-400 numeric-data">
                {cart.items.length} {locale === "ar" ? "منتجات فريدة" : "unique items"}
              </span>
            </div>

            {cart.items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onAcceptPriceChange={acceptPriceChange}
                onClampQuantity={clampQuantity}
              />
            ))}
          </div>

          {/* Coupon Code Input */}
          <div className="mt-1">
            <CouponInput />
          </div>
        </div>

        {/* Right Column (lg:col-span-4): Sticky Order Pricing Breakdown & Checkout */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <OrderPricingBreakdown
            showVoucherInput={false}
            showCheckoutButton={true}
            onCheckout={handleProceedToCheckout}
            checkoutDisabled={hasBlockingIssues || cart.items.length === 0}
            checkoutLabel={t("cart.checkout", "متابعة لإتمام الطلب")}
          />
        </div>
      </div>

      {/* Multi-Seller Conflict Modal */}
      {conflictState && (
        <MultiSellerDialog
          isOpen={conflictState.isOpen}
          onClose={closeConflictDialog}
          currentSellerName={conflictState.existingSellerName}
          newSellerName={conflictState.newSellerName}
          onConfirmSwitch={handleConfirmSwitch}
          onKeepCurrent={closeConflictDialog}
        />
      )}
    </div>
  );
}

