## 2026-08-31T10:44:20Z
You are the replacement specialized implementer worker for Milestone M4: Cart, Checkout & Payment.

Your working directory is: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m4_cart_2
Your project root is: /home/mahmoud/Desktop/p3

Read the following files before starting:
- /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
- /home/mahmoud/Desktop/p3/PROJECT.md
- /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md

Write Boundaries & Files you own exclusively:
- `types/cart.ts`
- `lib/mock/cart.ts`
- `lib/context/CartContext.tsx`
- `components/cart/*` (e.g. `CartDrawer.tsx`, `CartLineItem.tsx`, `MultiSellerDialog.tsx`, `IssueNotice.tsx`, `OrderPricingBreakdown.tsx`, `CouponInput.tsx`, `index.ts`)
- `components/checkout/*` (e.g. `AddressSelector.tsx`, `NewAddressModal.tsx`, `DeliveryTimeSlotPicker.tsx`, `PaymentMethodSelector.tsx`, `CheckoutSummary.tsx`, `index.ts`)
- `app/[locale]/cart/page.tsx`
- `app/[locale]/checkout/page.tsx`
- `app/[locale]/checkout/confirmation/page.tsx`

Tasks & Requirements:
1. Ensure `lib/context/CartContext.tsx` conforms to the interface contract in `PROJECT.md § Interface Contracts`:
   - Single-seller enforcement or multi-seller conflict handling with modal (`MultiSellerDialog`).
   - `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `confirmSwitchSellerAndAdd`, `resolveIssue`, `itemCount`.
   - Issue notices (`price_changed`, `insufficient_stock`, `product_unavailable`) with resolver actions.
2. Complete cart UI components in `components/cart/*`:
   - `CartLineItem` with thumbnail, title, selected variant, price, quantity counter, and swipe/button delete action.
   - `OrderPricingBreakdown` with subtotal, estimated shipping/delivery fee, voucher coupon discount, and grand total.
   - `CartDrawer` and full `/cart` page with 4-state lifecycle (Default, Empty cart with browse CTA, Loading skeleton, Error + Retry).
3. Complete checkout UI components in `components/checkout/*`:
   - `AddressSelector` with saved addresses radio list, default badge, and `NewAddressModal` to add/edit addresses.
   - `DeliveryTimeSlotPicker` with horizontal time pills (e.g. Standard, Express, Morning, Evening).
   - `PaymentMethodSelector` supporting Cash on Delivery (COD), Mock Cards (Visa/Mastercard), and Apple Pay with active selection ring.
   - Idempotent order submission button (instant click disable, UUID idempotency key generation).
4. Complete checkout pages:
   - `app/[locale]/checkout/page.tsx`: Full mobile checkout flow with validation preventing proceeding without address/payment selected.
   - `app/[locale]/checkout/confirmation/page.tsx`: Order success screen with generated order number, summary snapshot, delivery ETA, track order CTA, and continue shopping CTA.
5. Test & verify your changes by running `npm run build` or checking for zero TypeScript errors.
