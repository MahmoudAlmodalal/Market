## 2026-08-31T09:23:53Z

You are the Worker assigned to Milestone M4: Cart, Checkout & Payment for Souqi Marketplace.

Working Directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m4_cart_1
Project Root: /home/mahmoud/Desktop/p3
Original Request: /home/mahmoud/Desktop/p3/ORIGINAL_REQUEST.md
Specification: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md (Phases 5.1 & 5.2)
Context: /home/mahmoud/Desktop/p3/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Exclusively Owned Files:
1. `lib/mock/cart.ts`: Initial cart mock state and sample items with mock issues (price change, insufficient stock).
2. `lib/context/CartContext.tsx`: Full React Context provider for Cart state management:
   - Single-seller cart rule enforcement (OD04): when adding an item from a different seller, return `{ success: false, conflict: true, sellerName: string }` and trigger MultiSellerDialog.
   - `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `confirmSwitchSellerAndAdd`, `resolveIssue`.
   - Dynamic recalculation of subtotal, delivery fee, discount vouchers, and total.
   - Automatic detection of blocking issues (`has_blocking_issues`).
   - LocalStorage persistence for cart state across page reloads.
3. `components/cart/CartHeader.tsx`: Header displaying active single seller name, neighborhood, and single-seller cart guarantee info badge.
4. `components/cart/CartLineItem.tsx`: Cart item row with 64x64 rounded image, item name, unit price, QuantityStepper, line total, remove button, and integrated IssueNotice alerts.
5. `components/cart/IssueNotice.tsx`: Alert banners for `price_changed` (with Accept New Price CTA), `insufficient_stock` (with Clamp Quantity CTA), `product_unavailable` (with Remove Item CTA).
6. `components/cart/MultiSellerDialog.tsx`: Modal dialog informing customer that the cart can only hold items from one seller at a time, showing current seller vs new item's seller, with "Keep Current Cart" and "Start New Cart from [Seller]" actions.
7. `components/cart/OrderPricingBreakdown.tsx`: Server-authoritative bill breakdown: subtotal, estimated delivery fee, discount voucher input with apply button, and total in Coral highlight.
8. `components/cart/index.ts`: Barrel export.
9. `components/checkout/AddressSelector.tsx`: Saved delivery addresses radio list with default indicator and "Add New Address" modal/form trigger.
10. `components/checkout/TimeSlotPicker.tsx`: Horizontal scrollable time slot pills (e.g., Today 2-4 PM, Today 4-6 PM, Tomorrow Morning) with active selection state.
11. `components/checkout/PaymentMethodSelector.tsx`: Payment options (Cash on Delivery / COD, Credit/Debit Card, Apple Pay) with custom selection card and details.
12. `components/checkout/OrderConfirmationSummary.tsx`: Checkout preview summary showing items, selected address, time slot, payment method, and pricing total.
13. `components/checkout/index.ts`: Barrel export.
14. `app/[locale]/cart/page.tsx`: Cart page with 4-state lifecycle (Default with items, Empty cart with "Browse Catalog" CTA, Loading skeleton, Issue resolution view), pricing breakdown, and sticky "Proceed to Checkout" button.
15. `app/[locale]/checkout/page.tsx`: Multi-step or streamlined one-page checkout with AddressSelector, TimeSlotPicker, PaymentMethodSelector, Idempotent order submit button with UUIDv4 generation, disabling on click to prevent double submissions.
16. `app/[locale]/checkout/confirmation/page.tsx`: Order success confirmation screen with order number, success animation/badge, delivery summary, and "Track Order" + "Continue Shopping" CTAs.

Requirements:
- Mobile-first constraint (`max-w-[430px]` centered).
- Strict RTL (Arabic default) and LTR (English) compliance.
- Complete state management with mock persistence in localStorage.
- Verify implementation using `npx tsc --noEmit` and ensure 0 compilation errors.
- Write your progress to `progress.md` and complete handoff report to `handoff.md` in your working directory.
- Use `send_message` to report back upon completion.
