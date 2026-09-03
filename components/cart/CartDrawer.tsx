"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { useTranslation, useLocale } from "@/lib/context/LocaleContext";
import { useCart } from "@/lib/context/CartContext";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CartHeader } from "./CartHeader";
import { CartLineItem } from "./CartLineItem";
import { CouponInput } from "./CouponInput";
import { OrderPricingBreakdown } from "./OrderPricingBreakdown";
import { cn } from "@/lib/utils";

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  className?: string;
}

/**
 * CartDrawer is a slide-up bottom sheet providing instant access to the shopping cart,
 * single-seller metadata, line item list, issue resolver banners, coupon input,
 * price breakdown, and direct checkout navigation.
 */
export function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
  className,
}: CartDrawerProps) {
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
  } = useCart();

  const isEmpty = cart.items.length === 0;

  const handleProceedToCheckout = () => {
    onClose();
    if (onCheckout) {
      onCheckout();
    } else {
      router.push(`/${locale}/checkout`);
    }
  };

  const handleBrowseCatalog = () => {
    onClose();
    router.push(`/${locale}/catalog`);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-neutral-900">
              {t("cart.title", "سلة المشتريات")}
            </span>
            {itemCount > 0 && (
              <Badge variant="primary" size="sm" className="font-mono">
                {itemCount}
              </Badge>
            )}
          </div>
        }
        description={
          !isEmpty
            ? (locale === "ar"
                ? "راجع المنتجات وتفاصيل الفاتورة قبل إتمام الطلب"
                : "Review selected items and summary before checkout")
            : undefined
        }
        className={cn("max-w-lg", className)}
        footer={
          !isEmpty ? (
            <div className="w-full flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={hasBlockingIssues || isEmpty}
                onClick={handleProceedToCheckout}
                className="font-bold text-sm sm:text-base shadow-soft"
                rightIcon={
                  direction === "rtl" ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
              >
                {t("cart.checkout", "متابعة لإتمام الطلب")}
              </Button>
              <div className="flex items-center justify-between text-xs px-1">
                <Link
                  href={`/${locale}/cart`}
                  onClick={onClose}
                  className="text-brand-600 hover:text-brand-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>{locale === "ar" ? "عرض صفحة السلة الكاملة" : "View Full Cart Page"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-neutral-400">
                  {locale === "ar" ? "توصيل سريع وآمن" : "Fast & Secure"}
                </span>
              </div>
            </div>
          ) : undefined
        }
      >
        {isEmpty ? (
          /* Empty Cart State */
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-3xl bg-brand-50/80 border border-brand-100 flex items-center justify-center text-brand-400">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <h3 className="text-base font-bold text-neutral-900">
                {t("cart.emptyTitle", t("cart.empty_title", "سلتك فارغة حالياً"))}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {t(
                  "cart.emptyDesc",
                  "لم تقم بإضافة أي منتجات من المتاجر المحلية بعد. استكشف أفضل المنتجات اليدوية والمصنوعة بحب!"
                )}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleBrowseCatalog}
              className="mt-2 font-bold shadow-soft"
              rightIcon={
                direction === "rtl" ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {t("cart.browseCatalog", t("cart.empty_cta", "تصفح المنتجات الآن"))}
              </span>
            </Button>
          </div>
        ) : (
          /* Populated Cart Content */
          <div className="flex flex-col gap-4 pb-2">
            {/* Single Seller Header */}
            {cart.seller && (
              <CartHeader
                seller={cart.seller}
                onClearCart={clearCart}
              />
            )}

            {/* Items List */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
                <span>{locale === "ar" ? "المنتجات المحددة" : "Selected Items"}</span>
                <span className="text-neutral-400 numeric-data">
                  {cart.items.length} {locale === "ar" ? "منتج" : "items"}
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

            {/* Order Pricing Breakdown (Summary) */}
            <OrderPricingBreakdown
              showVoucherInput={false}
              showCheckoutButton={false}
            />
          </div>
        )}
      </Drawer>
    </>
  );
}

export default CartDrawer;
