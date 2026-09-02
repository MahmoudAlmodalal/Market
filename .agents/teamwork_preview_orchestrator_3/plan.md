# Implementation & Verification Plan: Remaining Tracks (M3 - M7)

## Overview
Complete the mobile-first bilingual Souqi Marketplace UI across all remaining domain modules (M3, M4, M5), polish and a11y (M6), and full verification (M7: build & E2E tests).

## Milestones & Work Breakdown

### Milestone M3: Product Detail View (PDP)
- **Scope**:
  - `components/pdp/ProductGallery.tsx` (swipeable/interactive gallery, thumbnails, zoom/full view, aspect ratio)
  - `components/pdp/ProductInfo.tsx` (title, price, ratings, bilingual description toggle, tags, stock badge)
  - `components/pdp/VariantSelector.tsx` (color, size, packaging pills with disabled out-of-stock states)
  - `components/pdp/SellerTrustCard.tsx` (merchant context, verified badge, rating, delivery promise, contact shortcut)
  - `components/pdp/StickyActionBar.tsx` (sticky bottom mobile drawer with quantity stepper and "Add to Cart" button)
  - `components/pdp/ReviewList.tsx` (customer reviews, star breakdown, helpfulness counts)
  - `lib/mock/sellers.ts` & mock reviews/variants fixtures
  - `app/[locale]/products/[id]/page.tsx` (dynamic PDP route, loading skeletons, error states, 4-state lifecycle)

### Milestone M4: Cart, Checkout & Payment
- **Scope**:
  - `types/cart.ts`, `lib/context/CartContext.tsx`
  - `components/cart/CartDrawer.tsx` / `components/cart/CartLineItem.tsx` (swipe-to-delete, quantity counter)
  - `components/cart/MultiSellerDialog.tsx` (single-seller cart conflict resolver or multi-seller order splitting)
  - `components/cart/IssueNotice.tsx` (price change, stock insufficiency notices)
  - `components/cart/OrderPricingBreakdown.tsx` (subtotal, shipping, voucher discount, total)
  - `components/checkout/AddressSelector.tsx` & `NewAddressModal.tsx`
  - `components/checkout/DeliveryTimeSlotPicker.tsx`
  - `components/checkout/PaymentMethodSelector.tsx` (COD, mock cards, Apple Pay)
  - `app/[locale]/cart/page.tsx`, `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/confirmation/page.tsx`

### Milestone M5: Orders, Profile & Seller Dashboard
- **Scope**:
  - `types/order.ts`, `types/user.ts`, `lib/context/AuthContext.tsx`, `lib/mock/orders.ts`, `lib/mock/user.ts`
  - `components/orders/OrderProgressStepper.tsx` (visual 5-step progress: Pending -> Confirmed -> Preparing -> Ready -> Completed)
  - `components/orders/OrderReceiptCard.tsx` (order summary, receipt, contact driver/merchant)
  - `components/orders/CancelOrderModal.tsx`
  - `components/profile/UserProfileHeader.tsx`, `components/profile/OrderHistoryList.tsx`, `components/profile/AccountSettings.tsx`
  - `components/seller/SellerStatTiles.tsx`, `components/seller/ProductManagementTable.tsx`, `components/seller/AiAssistantPanel.tsx`
  - `app/[locale]/orders/page.tsx`, `app/[locale]/orders/[id]/page.tsx`
  - `app/[locale]/profile/page.tsx`
  - `app/[locale]/seller/dashboard/page.tsx`
  - `app/[locale]/login/page.tsx`, `app/[locale]/register/page.tsx`

### Milestone M6: Polish, Micro-interactions, Accessibility & Safe-area Insets
- **Scope**:
  - Bottom navigation and sticky action bar safe-area padding (`env(safe-area-inset-bottom)`)
  - Smooth spring transitions for bottom sheets, drawers, and modal backdrops
  - ARIA attributes, semantic landmarks, and screen reader labels
  - RTL/LTR directional verification and zero horizontal overflow on mobile viewports (390px - 430px)

### Milestone M7: Full Verification
- **Scope**:
  - Zero TypeScript / compilation errors with `npm run build`
  - E2E Test verification across all test tiers (Tiers 1-4)
  - Forensic integrity verification and clean audit handoff

## Execution Strategy
1. Dispatch parallel workers for M3, M4, and M5 to implement missing components, wire up pages, and ensure all routes render properly.
2. Once M3-M5 are integrated, dispatch M6 worker for polish, micro-animations, a11y and safe-area adjustments.
3. Dispatch M7 worker for full build verification (`npm run build`) and test execution.
4. Dispatch Reviewer and Forensic Auditor.
5. Synthesize results and report completion to parent orchestrator.
