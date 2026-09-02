# Orchestrator Execution Plan: Souqi Marketplace UI Completion

## Overview
Coordinate parallel implementation and integration of the remaining domain tracks for Souqi Marketplace bilingual mobile-first UI.

## Work Packages

### Track M3: Product Detail View (PDP)
- **Target Files Owned**:
  - `components/pdp/StickyActionBar.tsx`
  - `components/pdp/ReviewList.tsx`
  - `components/pdp/ImageGalleryViewer.tsx` (verify & complete)
  - `components/pdp/MerchantCard.tsx` (verify & complete)
  - `components/pdp/ProductMetadata.tsx` (verify & complete)
  - `components/pdp/index.ts`
  - `app/[locale]/products/[id]/page.tsx`
- **Key Features**:
  - High-resolution swipeable image gallery with thumbnails & indicators
  - Bilingual metadata (Cairo Arabic / Inter numeric), bilingual description toggle, tags, stock badge
  - Neighborhood Merchant Card with rating, delivery estimate, trust badges
  - Sticky bottom action bar with quantity stepper and CartContext integration
  - Customer review list with star ratings, verified badge, breakdown bars
  - 4-state lifecycle (Default, Loading skeleton, Empty, Error with retry)

### Track M4: Cart, Checkout & Payment
- **Target Files Owned**:
  - `components/cart/CartDrawer.tsx`
  - `components/cart/OrderPricingBreakdown.tsx`
  - `components/cart/CartHeader.tsx`, `CartLineItem.tsx`, `IssueNotice.tsx`, `MultiSellerDialog.tsx` (verify/complete)
  - `components/cart/index.ts`
  - `components/checkout/AddressSelector.tsx`
  - `components/checkout/DeliveryTimePicker.tsx`
  - `components/checkout/PaymentMethodSelector.tsx`
  - `components/checkout/index.ts`
  - `app/[locale]/cart/page.tsx`
  - `app/[locale]/checkout/page.tsx`
  - `app/[locale]/checkout/confirmation/page.tsx`
- **Key Features**:
  - Single-seller cart header with merchant lock
  - Multi-seller conflict modal on cross-seller product additions
  - Line items with swipe-to-delete / quantity stepper
  - IssueNotice alert box (price change, insufficient stock, item unavailable)
  - OrderPricingBreakdown: subtotal, dynamic delivery fee, taxes, discount voucher input
  - Checkout page: Saved address selector with Add Address modal, delivery slot pill selector, payment options (COD, Cards, Apple Pay)
  - Idempotent order submission with UUIDv4 Idempotency-Key and redirect to confirmation receipt

### Track M5: Orders, Profile & Seller Dashboard
- **Target Files Owned**:
  - `components/orders/OrderProgressStepper.tsx`
  - `components/orders/OrderReceiptCard.tsx`
  - `components/orders/CancelOrderModal.tsx`
  - `components/orders/index.ts`
  - `components/profile/ProfileHeader.tsx`
  - `components/profile/OrderHistoryList.tsx`
  - `components/profile/SellerStatsTiles.tsx`
  - `components/profile/ProductManagementTable.tsx`
  - `components/profile/AIAssistantPanel.tsx`
  - `components/profile/index.ts`
  - `app/[locale]/orders/page.tsx`
  - `app/[locale]/orders/[id]/page.tsx`
  - `app/[locale]/profile/page.tsx`
  - `app/[locale]/seller/dashboard/page.tsx`
  - `app/[locale]/login/page.tsx`
  - `app/[locale]/register/page.tsx`
- **Key Features**:
  - Real-time 5-state OrderProgressStepper (`Pending` -> `Confirmed` -> `Preparing` -> `Ready` -> `Completed`)
  - Order details with receipt breakdown, driver/merchant contact triggers, cancellation modal (active only during Pending/Confirmed)
  - Account Profile page: user info, quick language toggle, settings links, logout confirmation
  - Past order history list with status badges and "Reorder" action
  - Seller Dashboard: 4 KPI tiles (product_count, out_of_stock, low_stock, orders_by_status), product inventory table with stock quantity and status toggles, AI Assistant panel for description/tag suggestions with confidence scores and Accept/Reject actions
  - Auth pages: Login and Register forms with validation and bilingual labels

### Track M6: Polish, Micro-interactions & a11y
- **Scope**:
  - Review and refine mobile animations: smooth drawer slide-up, touch feedback (active:scale-[0.98]), hover lifts
  - Safe-area insets (`pb-safe`, `pt-safe`, bottom drawer clearance) across all sticky bars
  - ARIA attributes: roles, live regions, aria-labels, high-contrast focus rings
  - RTL/LTR transition smoothness without layout shifts

### Track M7: Full Verification & E2E Test Suite
- **Scope**:
  - Run `npm run build` to verify 0 type errors, 0 lint/compilation errors
  - Run `npx tsx tests/e2e/test_runner.ts` to execute all 476+ E2E tests across Tiers 1-4
  - Dispatch Reviewers, Challengers, and Forensic Auditor for final quality gating
