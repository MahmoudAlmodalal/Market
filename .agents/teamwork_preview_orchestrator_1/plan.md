# Souqi Marketplace UI — Parallel Execution Plan

## Objective
Implement complete mobile-first bilingual (Arabic RTL default / English LTR) UI for Souqi Marketplace across parallel execution tracks, ensuring zero type/build errors, full mock data interactivity, and 100% E2E test suite pass rate.

---

## Parallel Milestone Tracks & File Ownership

### Track M2: Feed, Discovery & Catalog
- **Files Owned**:
  - `lib/mock/categories.ts`
  - `lib/mock/products.ts`
  - `lib/mock/stories.ts`
  - `components/feed/CategoryFilterStrip.tsx`
  - `components/feed/HeroCarousel.tsx`
  - `components/feed/StoriesStrip.tsx`
  - `components/feed/FilterDrawer.tsx`
  - `components/feed/index.ts`
  - `components/catalog/ProductCard.tsx`
  - `components/catalog/CatalogGrid.tsx`
  - `components/catalog/ProductCardSkeleton.tsx`
  - `components/catalog/index.ts`
  - `app/[locale]/page.tsx`
  - `app/[locale]/catalog/page.tsx`
- **Features**: Features 12-17 (Category Pills, Hero Carousel, Stories, Filter Sheet, ProductCard, Fluid Catalog Grid, Skeletons).

### Track M3: Product Detail View (PDP)
- **Files Owned**:
  - `lib/mock/sellers.ts`
  - `components/pdp/ImageGalleryViewer.tsx`
  - `components/pdp/ProductMetadata.tsx`
  - `components/pdp/MerchantCard.tsx`
  - `components/pdp/StickyActionBar.tsx`
  - `components/pdp/ReviewList.tsx`
  - `components/pdp/index.ts`
  - `app/[locale]/products/[id]/page.tsx`
- **Features**: Features 18-21 (Swipeable Image Gallery, Product Metadata & Tags, Merchant Context Card, Sticky Bottom Action Bar).

### Track M4: Cart, Checkout & Payment
- **Files Owned**:
  - `lib/mock/cart.ts`
  - `lib/context/CartContext.tsx`
  - `components/cart/CartHeader.tsx`
  - `components/cart/CartLineItem.tsx`
  - `components/cart/IssueNotice.tsx`
  - `components/cart/MultiSellerDialog.tsx`
  - `components/cart/OrderPricingBreakdown.tsx`
  - `components/cart/index.ts`
  - `components/checkout/AddressSelector.tsx`
  - `components/checkout/TimeSlotPicker.tsx`
  - `components/checkout/PaymentMethodSelector.tsx`
  - `components/checkout/OrderConfirmationSummary.tsx`
  - `components/checkout/index.ts`
  - `app/[locale]/cart/page.tsx`
  - `app/[locale]/checkout/page.tsx`
  - `app/[locale]/checkout/confirmation/page.tsx`
- **Features**: Features 22-30 (Single-Seller Cart Header, MultiSellerDialog, CartLineItem with Swipe/Delete, IssueNotice resolver, Pricing Breakdown, Address Selector, Time Slot Picker, Payment Method Selector, Idempotent Order Submission).

### Track M5: Orders, Profile & Seller Dashboard
- **Files Owned**:
  - `lib/mock/orders.ts`
  - `lib/mock/user.ts`
  - `lib/context/AuthContext.tsx`
  - `components/orders/OrderProgressStepper.tsx`
  - `components/orders/OrderDetailCard.tsx`
  - `components/orders/CancelOrderModal.tsx`
  - `components/orders/OrderHistoryCard.tsx`
  - `components/orders/index.ts`
  - `components/profile/ProfileHeader.tsx`
  - `components/profile/SettingsList.tsx`
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
- **Features**: Features 31-39 (OrderProgress Stepper, Order Receipt & Details, Cancel Order Modal, Account Profile Header, Expandable Order History, Settings & Logout, Seller Dashboard & Stat Tiles, Product Management Table, AI Assistant Panel).

### Track M6: Polish, Micro-interactions & a11y
- **Files Owned**:
  - Micro-animation enhancements, touch feedback, safe-area inset checks, ARIA accessibility audits across all pages.
- **Features**: Features 40-41 (Micro-animations, Touch Feedback, ARIA, Focus Ring Architecture).

### Track M7: Verification & Audit
- **Files Owned**:
  - `TEST_READY.md`
  - Verification run via test suite runner (`tests/e2e/test_runner.ts`)
  - Adversarial Tier 5 coverage audit
  - Forensic integrity audit

---

## Execution Schedule
1. **Batch 1 (Parallel)**: Launch Workers for M2, M3, M4, M5 simultaneously with clear write boundaries.
2. **Review & Gate**: Review reports from M2, M3, M4, M5 workers.
3. **Batch 2**: Launch Worker for M6 Polish & a11y.
4. **Batch 3**: Launch Challenger and Forensic Auditor for M7 Verification.
5. **Final Sign-off & Report**: Ensure zero build errors, all E2E tests pass, report back.
