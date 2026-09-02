# Original User Request

## 2026-08-31T12:18:23+03:00

Implement the complete mobile-first bilingual (Arabic RTL default / English LTR) UI for Souqi Marketplace across all planned phases in parallel execution tracks based on the specification in SOUQI_UI_IMPLEMENTATION_PLAN.md. Note: PROJECT.md, Milestone M1 (Foundation, Types, Layouts, Atomic UI primitives), and E2E test suites (Tiers 1-4) are already created in the repository. Continue by launching and executing the parallel feature tracks: M2 (Feed & Catalog), M3 (PDP), M4 (Cart & Checkout), M5 (Orders & Profile), M6 (Polish & a11y), and M7 (Verification).

Working directory: /home/mahmoud/Desktop/p3
Integrity mode: development

## Requirements

### R1. Foundation & Bilingual Core (Phase 1 & Phase 2)
Implement the design token architecture (Cairo font for Arabic/headings, Inter for English, #E9495E brand coral), Next.js App Router dynamic locale wrapper (/app/[locale]/...), responsive navigation shell (top header, bottom bar), and atomic UI primitives (buttons, pill search bar, status badges, steppers).

### R2. Parallel Feature Domain Modules (Phase 3, 4, 5, 6)
Implement the independent UI screens and components across parallel tracks:
- Feed & Discovery: Category pills, hero promotional carousel, filter sheet, product cards and responsive catalog grid.
- Product Detail (PDP): Swipeable gallery, metadata blocks, merchant context card, sticky bottom action drawer.
- Cart & Checkout: Cart drawer/page with grouped merchant items, price breakdown, address selector, payment method options.
- Orders & Profile: Real-time order status progress stepper, order history with reorder trigger, user account profile & settings modals.

### R3. Polish, Micro-interactions & Accessibility (Phase 7)
Ensure smooth 60fps micro-interactions (press feedback, drawer transitions), full keyboard/screen-reader accessibility (ARIA landmarks, live regions), and safe-area inset adaptation for mobile devices.

## Acceptance Criteria

### Visual & Functional Criteria
- [ ] Next.js app builds with 0 type errors or bundle compilation failures (npm run build).
- [ ] All views render with correct Arabic (RTL) layout as default and English (LTR) when toggled without layout shifts.
- [ ] All component screens (Catalog, PDP, Cart, Checkout, Order Tracking, Profile) are fully interactive with realistic mock data fixtures.
- [ ] Mobile viewport constraints (390px - 430px) are adhered to with centered layout on larger screens.
