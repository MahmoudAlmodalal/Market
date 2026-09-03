"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Cart,
  CartItem,
  CartSeller,
  CartIssue,
  PricingBreakdown,
  CartContextValue,
  CartConflictState,
} from "@/types/cart";
import type { Product } from "@/types/catalog";
import {
  INITIAL_DEMO_CART,
  INITIAL_EMPTY_CART,
  MOCK_VOUCHERS,
} from "@/lib/mock/cart";
import { MultiSellerDialog } from "@/components/cart/MultiSellerDialog";

const CART_STORAGE_KEY = "souqi_cart_v1";
const VOUCHER_STORAGE_KEY = "souqi_voucher_v1";

const CartContext = createContext<CartContextValue | null>(null);

function calculateItemLineTotal(unitPrice: string | number, quantity: number): string {
  const priceNum = typeof unitPrice === "string" ? parseFloat(unitPrice) || 0 : unitPrice;
  return (priceNum * quantity).toFixed(2);
}

function recalculateCartState(
  items: CartItem[],
  seller: CartSeller | null,
  voucherCode: string | null
): {
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  has_blocking_issues: boolean;
  voucher_applied: boolean;
  voucher_error?: string;
  discount_num: number;
} {
  const subtotalNum = items.reduce((sum, item) => {
    const priceNum = parseFloat(item.unit_price) || 0;
    return sum + priceNum * item.quantity;
  }, 0);

  const deliveryFeeNum = items.length > 0 ? 15.0 : 0.0;

  let discountNum = 0;
  let voucherApplied = false;
  let voucherError: string | undefined;

  if (voucherCode && voucherCode.trim() !== "") {
    const v = MOCK_VOUCHERS[voucherCode.trim().toUpperCase()];
    if (!v) {
      voucherError = "رمز القسيمة غير صالح (Invalid voucher code)";
    } else if (!v.isValid) {
      voucherError = "هذه القسيمة منتهية الصلاحية (Voucher expired)";
    } else if (subtotalNum < v.minSubtotal) {
      voucherError = `الحد الأدنى لاستخدام القسيمة هو ${v.minSubtotal} ₪`;
    } else {
      const rawDiscount = (subtotalNum * v.discountPercent) / 100;
      discountNum = Math.min(rawDiscount, v.maxDiscount);
      voucherApplied = true;
    }
  }

  const totalNum = Math.max(0, subtotalNum + deliveryFeeNum - discountNum);

  const hasBlockingIssues = items.some((item) => {
    if (!item.issues || item.issues.length === 0) return false;
    return item.issues.some((issue) => {
      if (issue.code === "price_changed") return true;
      if (issue.code === "product_unavailable") return true;
      if (issue.code === "insufficient_stock") {
        const avail = issue.available ?? 0;
        return item.quantity > avail;
      }
      return false;
    });
  });

  return {
    subtotal: subtotalNum.toFixed(2),
    delivery_fee: deliveryFeeNum.toFixed(2),
    discount_amount: discountNum.toFixed(2),
    total: totalNum.toFixed(2),
    has_blocking_issues: hasBlockingIssues,
    voucher_applied: voucherApplied,
    voucher_error: voucherError,
    discount_num: discountNum,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(INITIAL_DEMO_CART);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [conflictState, setConflictState] = useState<CartConflictState | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedVoucher = localStorage.getItem(VOUCHER_STORAGE_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        } else {
          setCart(INITIAL_DEMO_CART);
        }
      } else {
        // Fallback to initial demo cart
        setCart(INITIAL_DEMO_CART);
      }

      if (savedVoucher) {
        setVoucherCode(savedVoucher);
      }
    } catch {
      setCart(INITIAL_DEMO_CART);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage on cart or voucher changes (skip during initial loading)
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (voucherCode) {
        localStorage.setItem(VOUCHER_STORAGE_KEY, voucherCode);
      } else {
        localStorage.removeItem(VOUCHER_STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Failed to persist cart to localStorage", err);
    }
  }, [cart, voucherCode, isLoading]);

  // Recalculate cart totals helper
  const updateCartState = useCallback(
    (
      updater: (prev: Cart) => { items: CartItem[]; seller: CartSeller | null }
    ) => {
      setCart((prev) => {
        const { items, seller } = updater(prev);
        const calc = recalculateCartState(items, seller, voucherCode);

        return {
          ...prev,
          seller,
          items,
          subtotal: calc.subtotal,
          estimated_delivery: calc.delivery_fee,
          discount_amount: calc.discount_amount,
          total: calc.total,
          has_blocking_issues: calc.has_blocking_issues,
          voucher_code: voucherCode || undefined,
        };
      });
    },
    [voucherCode]
  );

  /**
   * Single-seller cart rule enforcement (OD04)
   */
  const addItem = useCallback(
    (product: any, quantity: number = 1) => {
      const rawSellerId =
        product.seller?.id ?? product.seller_id ?? product.sellerId ?? (product.seller_name ? 101 : 101);
      const rawSellerName =
        product.seller?.business_name ??
        product.seller?.name ??
        product.seller_name ??
        "متجر محلي";
      const rawSellerNeighborhood =
        product.seller?.neighborhood ?? "المدينة";

      const currentSellerId = cart.seller?.id;

      // Conflict check: cart has items from a different seller
      if (
        currentSellerId !== undefined &&
        currentSellerId !== null &&
        currentSellerId !== rawSellerId &&
        cart.items.length > 0
      ) {
        const existingSellerName = cart.seller?.business_name || "المتجر الحالي";
        const newSellerName = rawSellerName;

        setConflictState({
          isOpen: true,
          pendingProduct: product,
          pendingQuantity: quantity,
          existingSellerName,
          newSellerName,
        });

        return {
          success: false,
          conflict: true,
          sellerName: newSellerName,
          existingSellerName,
          newSellerName,
        };
      }

      // Add item or increment
      updateCartState((prev) => {
        const newSeller: CartSeller = prev.seller || {
          id: rawSellerId,
          business_name: rawSellerName,
          neighborhood: rawSellerNeighborhood,
        };

        const itemsList = Array.isArray(prev.items) ? prev.items : [];
        const existingIndex = itemsList.findIndex(
          (item) => String(item.product_id) === String(product.id)
        );

        let newItems: CartItem[];
        const priceStr =
          typeof product.price === "number"
            ? product.price.toFixed(2)
            : String(product.price || "0.00");
        const availableStock =
          product.stock_quantity ?? product.available_quantity ?? 999;

        if (existingIndex >= 0) {
          newItems = [...itemsList];
          const current = newItems[existingIndex];
          const newQty = Math.min(current.quantity + quantity, availableStock);
          newItems[existingIndex] = {
            ...current,
            quantity: newQty,
            line_total: calculateItemLineTotal(current.unit_price, newQty),
          };
        } else {
          const itemQuantity = Math.min(quantity, availableStock);
          const rawImg =
            product.primary_image ??
            (typeof product.images?.[0] === "string"
              ? product.images[0]
              : product.images?.[0]?.image) ??
            "/images/placeholder.jpg";
          const newItem: CartItem = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            product_id: Number(product.id),
            name:
              product.name ??
              product.title_ar ??
              product.title_en ??
              "منتج بدون اسم",
            unit_price: priceStr,
            quantity: itemQuantity,
            line_total: calculateItemLineTotal(priceStr, itemQuantity),
            stock_state: product.stock_state || "available",
            primary_image: rawImg,
            seller_name: rawSellerName,
            seller_id: rawSellerId,
            issues: [],
            max_quantity: availableStock,
            price_at_addition: priceStr,
            current_server_price: priceStr,
          };
          newItems = [...itemsList, newItem];
        }

        return { items: newItems, seller: newSeller };
      });

      return { success: true };
    },
    [cart.seller, cart.items.length, updateCartState]
  );

  /**
   * Confirm switch seller: clear old items and add new seller product
   */
  const confirmSwitchSellerAndAdd = useCallback(
    (product: any, quantity: number = 1) => {
      const rawSellerId =
        product.seller?.id ?? product.seller_id ?? product.sellerId ?? 101;
      const rawSellerName =
        product.seller?.business_name ??
        product.seller?.name ??
        product.seller_name ??
        "متجر محلي";
      const rawSellerNeighborhood =
        product.seller?.neighborhood ?? "المدينة";

      const priceStr =
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : String(product.price || "0.00");
      const availableStock =
        product.stock_quantity ?? product.available_quantity ?? 999;
      const itemQuantity = Math.min(quantity, availableStock);

      const newSeller: CartSeller = {
        id: rawSellerId,
        business_name: rawSellerName,
        neighborhood: rawSellerNeighborhood,
      };

      const rawImg =
        product.primary_image ??
        (typeof product.images?.[0] === "string"
          ? product.images[0]
          : product.images?.[0]?.image) ??
        "/images/placeholder.jpg";

      const newItem: CartItem = {
        id: Date.now(),
        product_id: Number(product.id),
        name:
          product.name ??
          product.title_ar ??
          product.title_en ??
          "منتج بدون اسم",
        unit_price: priceStr,
        quantity: itemQuantity,
        line_total: calculateItemLineTotal(priceStr, itemQuantity),
        stock_state: product.stock_state || "available",
        primary_image: rawImg,
        seller_name: rawSellerName,
        seller_id: rawSellerId,
        issues: [],
        max_quantity: availableStock,
        price_at_addition: priceStr,
        current_server_price: priceStr,
      };

      setConflictState(null);

      updateCartState(() => ({
        items: [newItem],
        seller: newSeller,
      }));
    },
    [updateCartState]
  );

  const closeConflictDialog = useCallback(() => {
    setConflictState(null);
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    (itemId: number) => {
      updateCartState((prev) => {
        const remaining = prev.items.filter((i) => i.id !== itemId);
        const seller = remaining.length === 0 ? null : prev.seller || null;
        return { items: remaining, seller };
      });
    },
    [updateCartState]
  );

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    (itemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      updateCartState((prev) => {
        const newItems = prev.items.map((item) => {
          if (item.id === itemId) {
            const max = item.max_quantity ?? 999;
            const clamped = Math.min(quantity, max);
            return {
              ...item,
              quantity: clamped,
              line_total: calculateItemLineTotal(item.unit_price, clamped),
            };
          }
          return item;
        });

        return { items: newItems, seller: prev.seller || null };
      });
    },
    [removeItem, updateCartState]
  );

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setVoucherCode(null);
    setVoucherError(null);
    setCart(INITIAL_EMPTY_CART);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(VOUCHER_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  /**
   * Accept new price for price_changed issue
   */
  const acceptPriceChange = useCallback(
    (itemId: number) => {
      updateCartState((prev) => {
        const newItems = prev.items.map((item) => {
          if (item.id === itemId) {
            const priceIssue = item.issues.find(
              (i) => i.code === "price_changed"
            );
            const newPrice = priceIssue?.new_price || item.current_server_price || item.unit_price;
            const remainingIssues = item.issues.filter(
              (i) => i.code !== "price_changed"
            );

            return {
              ...item,
              unit_price: newPrice,
              current_server_price: newPrice,
              price_at_addition: newPrice,
              line_total: calculateItemLineTotal(newPrice, item.quantity),
              issues: remainingIssues,
            };
          }
          return item;
        });

        return { items: newItems, seller: prev.seller || null };
      });
    },
    [updateCartState]
  );

  /**
   * Clamp quantity for insufficient_stock issue
   */
  const clampQuantity = useCallback(
    (itemId: number) => {
      updateCartState((prev) => {
        const newItems = prev.items.map((item) => {
          if (item.id === itemId) {
            const stockIssue = item.issues.find(
              (i) => i.code === "insufficient_stock"
            );
            const available = stockIssue?.available ?? item.max_quantity ?? 1;
            const remainingIssues = item.issues.filter(
              (i) => i.code !== "insufficient_stock"
            );

            return {
              ...item,
              quantity: available,
              max_quantity: available,
              line_total: calculateItemLineTotal(item.unit_price, available),
              issues: remainingIssues,
            };
          }
          return item;
        });

        return { items: newItems, seller: prev.seller || null };
      });
    },
    [updateCartState]
  );

  /**
   * Generic resolve issue handler
   */
  const resolveIssue = useCallback(
    (itemId: number, issueCode: string) => {
      if (issueCode === "price_changed") {
        acceptPriceChange(itemId);
      } else if (issueCode === "insufficient_stock") {
        clampQuantity(itemId);
      } else if (issueCode === "product_unavailable") {
        removeItem(itemId);
      }
    },
    [acceptPriceChange, clampQuantity, removeItem]
  );

  /**
   * Apply discount voucher
   */
  const applyVoucher = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) {
        setVoucherCode(null);
        setVoucherError(null);
        return { success: false, error: "يرجى إدخال رمز القسيمة" };
      }

      const v = MOCK_VOUCHERS[cleanCode];
      const subtotalNum = parseFloat(cart.subtotal) || 0;

      if (!v) {
        const err = "رمز القسيمة غير صالح (Invalid Voucher Code)";
        setVoucherError(err);
        return { success: false, error: err };
      }

      if (!v.isValid) {
        const err = "هذه القسيمة منتهية الصلاحية (Voucher Expired)";
        setVoucherError(err);
        return { success: false, error: err };
      }

      if (subtotalNum < v.minSubtotal) {
        const err = `الحد الأدنى لاستخدام القسيمة هو ${v.minSubtotal} ₪`;
        setVoucherError(err);
        return { success: false, error: err };
      }

      const rawDiscount = (subtotalNum * v.discountPercent) / 100;
      const finalDiscount = Math.min(rawDiscount, v.maxDiscount);

      setVoucherCode(cleanCode);
      setVoucherError(null);

      // Recalculate totals immediately with new voucher
      setCart((prev) => {
        const calc = recalculateCartState(prev.items, prev.seller || null, cleanCode);
        return {
          ...prev,
          subtotal: calc.subtotal,
          estimated_delivery: calc.delivery_fee,
          discount_amount: calc.discount_amount,
          total: calc.total,
          voucher_code: cleanCode,
        };
      });

      return { success: true, discount: finalDiscount };
    },
    [cart.subtotal]
  );

  const removeVoucher = useCallback(() => {
    setVoucherCode(null);
    setVoucherError(null);
    setCart((prev) => {
      const calc = recalculateCartState(prev.items, prev.seller || null, null);
      return {
        ...prev,
        subtotal: calc.subtotal,
        estimated_delivery: calc.delivery_fee,
        discount_amount: calc.discount_amount,
        total: calc.total,
        voucher_code: undefined,
      };
    });
  }, []);

  const itemCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const hasBlockingIssues = useMemo(() => {
    return cart.has_blocking_issues;
  }, [cart.has_blocking_issues]);

  const discountAmount = useMemo(() => {
    return parseFloat(cart.discount_amount || "0") || 0;
  }, [cart.discount_amount]);

  const getPricingBreakdown = useCallback((): PricingBreakdown => {
    const calc = recalculateCartState(
      cart.items,
      cart.seller || null,
      voucherCode
    );

    const canCheckout =
      cart.items.length > 0 && !calc.has_blocking_issues;
    const blockingReason =
      cart.items.length === 0
        ? "Cart is empty"
        : calc.has_blocking_issues
        ? "Cart contains unresolved issues"
        : undefined;

    return {
      subtotal: calc.subtotal,
      delivery_fee: calc.delivery_fee,
      discount: calc.discount_amount,
      total: calc.total,
      voucher_code: voucherCode || undefined,
      voucher_applied: calc.voucher_applied,
      voucher_error: voucherError || calc.voucher_error,
      can_checkout: canCheckout,
      blocking_reason: blockingReason,
    };
  }, [cart.items, cart.seller, voucherCode, voucherError]);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      confirmSwitchSellerAndAdd,
      resolveIssue,
      acceptPriceChange,
      clampQuantity,
      applyVoucher,
      removeVoucher,
      voucherCode,
      discountAmount,
      voucherError,
      itemCount,
      hasBlockingIssues,
      isLoading,
      conflictState,
      closeConflictDialog,
      getPricingBreakdown,
    }),
    [
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      confirmSwitchSellerAndAdd,
      resolveIssue,
      acceptPriceChange,
      clampQuantity,
      applyVoucher,
      removeVoucher,
      voucherCode,
      discountAmount,
      voucherError,
      itemCount,
      hasBlockingIssues,
      isLoading,
      conflictState,
      closeConflictDialog,
      getPricingBreakdown,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      {conflictState && (
        <MultiSellerDialog
          isOpen={conflictState.isOpen}
          onClose={closeConflictDialog}
          currentSellerName={conflictState.existingSellerName}
          newSellerName={conflictState.newSellerName}
          onConfirmSwitch={() => {
            if (conflictState.pendingProduct) {
              confirmSwitchSellerAndAdd(
                conflictState.pendingProduct,
                conflictState.pendingQuantity
              );
            } else {
              closeConflictDialog();
            }
          }}
          onKeepCurrent={closeConflictDialog}
        />
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
