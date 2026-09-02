# BRIEFING — 2026-08-31T10:44:20Z

## Mission
Implement Milestone M4: Cart, Checkout & Payment domain module for Souqi Marketplace mobile-first bilingual UI, ensuring high-quality responsive components, full CartContext state management, single-seller enforcement, issue resolution, checkout flows, address/payment selectors, and order confirmation.

## 🔒 My Identity
- Archetype: specialized implementer worker
- Roles: implementer, qa, specialist
- Working directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m4_cart_2
- Original parent: 329cff10-b92f-4469-8003-ca39d0857e13
- Milestone: M4: Cart, Checkout & Payment

## 🔒 Key Constraints
- Own exclusively: `types/cart.ts`, `lib/mock/cart.ts`, `lib/context/CartContext.tsx`, `components/cart/*`, `components/checkout/*`, `app/[locale]/cart/page.tsx`, `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/confirmation/page.tsx`.
- Must satisfy CartContext interface contract from `PROJECT.md`: `cart`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `confirmSwitchSellerAndAdd`, `resolveIssue`, `itemCount`.
- Full 4-state lifecycle (Default, Empty, Loading skeleton, Error + Retry) on Cart and Checkout.
- Bilingual (Arabic RTL default, English LTR), accessible ARIA, mobile-first max-width container, zero type errors.

## Current Parent
- Conversation ID: 329cff10-b92f-4469-8003-ca39d0857e13
- Updated: 2026-08-31T10:44:20Z

## Task Summary
- **What to build**:
  - `types/cart.ts`: Cart domain types (`Cart`, `CartItem`, `CartIssue`, `PricingBreakdown`, `Address`, `PaymentMethodOption`, `DeliverySlot`, etc.)
  - `lib/mock/cart.ts`: Authoritative mock cart data, initial address list, delivery time slots, payment methods, coupon codes.
  - `lib/context/CartContext.tsx`: Full cart management state with localStorage persistence, single-seller conflict detection/resolution, issue notices & resolution, coupon voucher calculations.
  - `components/cart/*`: `CartLineItem`, `OrderPricingBreakdown`, `CouponInput`, `MultiSellerDialog`, `IssueNotice`, `CartDrawer`, `index.ts`.
  - `components/checkout/*`: `AddressSelector`, `NewAddressModal`, `DeliveryTimeSlotPicker`, `PaymentMethodSelector`, `CheckoutSummary`, `index.ts`.
  - `app/[locale]/cart/page.tsx`: Full `/cart` page with 4-state lifecycle.
  - `app/[locale]/checkout/page.tsx`: Mobile checkout flow with step validation and idempotent submission.
  - `app/[locale]/checkout/confirmation/page.tsx`: Order success screen with snapshot, ETA, CTAs.
- **Success criteria**: Zero TypeScript errors, zero build errors, full test compliance, complete UI and state interaction.
- **Interface contracts**: `PROJECT.md § Interface Contracts`

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending inspection
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Clean
- **Tests added/modified**: TBD

## Loaded Skills
- None

## Key Decisions Made
- Will check existing files in workspace to assess what already exists and needs completion or enhancement.

## Artifact Index
- `.agents/teamwork_preview_worker_m4_cart_2/DISPATCH.md` — Assignment instructions
- `.agents/teamwork_preview_worker_m4_cart_2/BRIEFING.md` — Agent memory
- `.agents/teamwork_preview_worker_m4_cart_2/progress.md` — Heartbeat & progress log
