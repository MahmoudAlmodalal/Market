# Project: Souqi Marketplace Bilingual Mobile-First UI

## Architecture
- **Framework & Runtime**: Next.js 15 App Router (`app/[locale]/...`), React 19, TypeScript 5.7, Tailwind CSS 3.4.
- **Bilingual & Layout Strategy**: Dynamic route segment `/[locale]` (`ar` default RTL, `en` LTR). Directional HTML `<html dir="rtl" lang="ar">` synchronized via `LocaleContext`.
- **Styling & Design Tokens**: Brand Coral `#E9495E`, neutral grayscale `#FFFFFF` to `#111111`, surface containers, Cairo font for Arabic/headings, Inter font for English/numeric tabular data.
- **Mobile Container Shell**: Fixed responsive container `max-w-[430px]` centered on viewport (`mx-auto min-h-screen bg-white shadow-soft`) with mobile safe-area insets.
- **Component Architecture**: Atomic UI primitives (`components/ui/*`), Layout Chrome (`components/layout/*`), and Domain Feature Modules (`components/feed/*`, `components/catalog/*`, `components/pdp/*`, `components/cart/*`, `components/checkout/*`, `components/orders/*`, `components/profile/*`).
- **Interactive State & Fixtures**: Authoritative mock data stores (`lib/mock/*`), client contexts (`CartContext`, `AuthContext`, `LocaleContext`).
- **Lifecycle Baseline**: 4-state lifecycle (Default, Loading Skeleton, Empty, Error + Retry) on every screen.

---

## Feature Inventory

Every feature discovered in the survey phase is enumerated below with its assigned milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Design Token Pipeline | CSS variables and Tailwind theme mapping brand colors, neutrals, semantic statuses, radii, and shadows | M1 | SOUQI_UI_PLAN §1.1 |
| 2 | Dual-Font Typography Setup | Cairo for Arabic/headings and Inter for English/numbers with tabular number isolation | M1 | SOUQI_UI_PLAN §1.1 |
| 3 | App Router Locale Routing | Dynamic routing segment `/[locale]/` encapsulating all routes | M1 | SOUQI_UI_PLAN §1.2 |
| 4 | Dynamic RTL/LTR Direction Provider | Synchronizes `<html dir="rtl" lang="ar">` and `<html dir="ltr" lang="en">` | M1 | SOUQI_UI_PLAN §1.2 |
| 5 | Mobile Container Shell | Max-width mobile constraint (390px–430px) with centered layout on larger screens | M1 | SOUQI_UI_PLAN §1.2 |
| 6 | Sticky Top Header Bar | Chrome header with brand logo, branch selector chip, notifications, and language switch toggle | M1 | SOUQI_UI_PLAN §2.1 |
| 7 | Fixed Bottom Navigation Bar | Docked bottom bar with active coral state, icons for Home, Categories, Cart, Orders, Profile | M1 | SOUQI_UI_PLAN §2.1 |
| 8 | Button System | Primary (Coral `#E9495E`), Secondary (`#FFF1F3`), Outline, Ghost, Destructive buttons | M1 | SOUQI_UI_PLAN §2.2 |
| 9 | Search Bar Primitive | Full pill input with inline search icon and clear action | M1 | SOUQI_UI_PLAN §2.2 |
| 10 | Status Badges & Chips | Soft-tinted semantic chips (Success, Warning, Danger, AI Suggestion) | M1 | SOUQI_UI_PLAN §2.2 |
| 11 | Form Controls & Stepper | Text inputs with focus rings, and numeric quantity counter buttons (`+` / `-`) | M1 | SOUQI_UI_PLAN §2.2 |
| 12 | Horizontal Category Filter Strip | Horizontal scrollable pill strip with active selection state | M2 | SOUQI_UI_PLAN §3.1 |
| 13 | Hero Promotional Carousel | Mobile 16:9 promotional carousel with rounded corners, slide dots, auto-play | M2 | SOUQI_UI_PLAN §3.1 |
| 14 | Multi-Attribute Filter Drawer | Slide-up modal sheet with filter options (Price range, Vendor, Category) | M2 | SOUQI_UI_PLAN §3.1 |
| 15 | ProductCard Component | 20px radius card, 1:1 image, 2-line title clamp, tabular price, stock badge, quick-add CTA | M2 | SOUQI_UI_PLAN §3.2 |
| 16 | Fluid Catalog Grid | 2-column mobile / 4-column desktop fluid grid with gutters and margins | M2 | SOUQI_UI_PLAN §3.2 |
| 17 | Skeleton Loading Cards | Pulse skeleton cards matching exact dimensions of ProductCard | M2 | SOUQI_UI_PLAN §3.2 |
| 18 | Swipeable Image Gallery Viewer | High-resolution image carousel with bullet pagination and thumbnail strip | M3 | SOUQI_UI_PLAN §4.1 |
| 19 | Product Metadata & Tags | Title, bilingual description toggle, price, category tag, and stock status | M3 | SOUQI_UI_PLAN §4.1 |
| 20 | Merchant Context Card | Neighborhood vendor card with business name, badge, rating, delivery estimate | M3 | SOUQI_UI_PLAN §4.1 |
| 21 | Sticky Bottom Action Bar | Pinned mobile bottom drawer with quantity stepper and "Add to Cart" conversion button | M3 | SOUQI_UI_PLAN §4.1 |
| 22 | Single-Seller Cart Header | Displays active merchant name and alerts customer that cart is single-seller | M4 | SOUQI_UI_PLAN §5.1 |
| 23 | MultiSellerDialog | Conflict modal triggered when adding product from a different seller | M4 | SOUQI_UI_PLAN §5.1 |
| 24 | CartLineItem with Swipe-to-Delete | Cart item row with 64x64 thumbnail, title, price, quantity counter, delete action | M4 | SOUQI_UI_PLAN §5.1 |
| 25 | IssueNotice (Cart Issue Resolver) | Yellow/red alert boxes for `price_changed`, `insufficient_stock`, `product_unavailable` | M4 | SOUQI_UI_PLAN §5.1 |
| 26 | Order Pricing Breakdown | Server-authoritative bill breakdown: subtotal, estimated delivery, discount voucher | M4 | SOUQI_UI_PLAN §5.1 |
| 27 | Delivery Address Selector | Saved addresses radio card list with "Add New Address" trigger | M4 | SOUQI_UI_PLAN §5.2 |
| 28 | Delivery Time Slot Picker | Horizontal time pill selector for preferred delivery windows | M4 | SOUQI_UI_PLAN §5.2 |
| 29 | Payment Method Selector | Cash on Delivery (COD) and mock digital payment cards with selection ring | M4 | SOUQI_UI_PLAN §5.2 |
| 30 | Idempotent Order Submission | Submit button with instant disable on click, UUIDv4 Idempotency-Key generation | M4 | SOUQI_UI_PLAN §5.2 |
| 31 | OrderProgress Stepper | Visual 5-step progress stepper (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`) | M5 | SOUQI_UI_PLAN §6.1 |
| 32 | Order Receipt & Snapshot Details | Order number, item snapshots, delivery address, driver/merchant contact buttons | M5 | SOUQI_UI_PLAN §6.1 |
| 33 | Cancel Order Modal Confirmation | Confirmation dialog allowing customer cancellation only during `Pending` or `Confirmed` | M5 | SOUQI_UI_PLAN §6.1 |
| 34 | Account Profile Header | User avatar, name, phone number, role badge, quick language switch toggle | M5 | SOUQI_UI_PLAN §6.2 |
| 35 | Expandable Order History List | Chronological past order cards with status chip, item thumbnails, total, "Reorder" | M5 | SOUQI_UI_PLAN §6.2 |
| 36 | Settings & Logout Confirmation | Links to addresses, notifications, terms of service, logout modal confirmation | M5 | SOUQI_UI_PLAN §6.2 |
| 37 | Seller Dashboard & Stat Tiles | 4 KPI tiles (`product_count`, `out_of_stock_count`, `low_stock_count`, `orders_by_status`) | M5 | SOUQI_UI_PLAN §6.2 |
| 38 | Product Management Table | Product list with actual `stock_quantity`, status badges, Edit, Publish, Archive | M5 | SOUQI_UI_PLAN §6.2 |
| 39 | AI Assistant Panel | AI description and tag suggestion panel with loading state, confidence score, Accept/Reject | M5 | SOUQI_UI_PLAN §6.2 |
| 40 | Micro-Animations & Touch Feedback | Active button scale (`0.98x`), card hover lift (`-2px`), cart bounce, bottom sheet spring | M6 | SOUQI_UI_PLAN §7.1 |
| 41 | ARIA & Focus Ring Architecture | WCAG AA contrast compliance, high-visibility coral focus ring, ARIA live regions | M6 | SOUQI_UI_PLAN §7.2 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation & Bilingual Core | Types (`types/*`), `lib/utils.ts`, `lib/i18n/*`, `LocaleContext`, App Router layout (`app/layout.tsx`, `app/[locale]/layout.tsx`), Navigation Shell (`components/layout/*`), Atomic UI Primitives (`components/ui/*`) | none | IN_PROGRESS |
| TEST | E2E Testing Track | E2E test runner, harness, test fixtures, Tiers 1-4 test suites (`tests/e2e/*`), `TEST_INFRA.md`, `TEST_READY.md` | M1 (contracts) | IN_PROGRESS |
| M2 | Feed, Discovery & Catalog | `types/catalog.ts`, `lib/mock/products.ts`, `lib/mock/categories.ts`, `lib/mock/stories.ts`, `components/feed/*`, `components/catalog/*`, `app/[locale]/page.tsx`, `app/[locale]/catalog/page.tsx` | M1 | PLANNED |
| M3 | Product Detail View (PDP) | `lib/mock/sellers.ts`, `components/pdp/*`, `app/[locale]/products/[id]/page.tsx` | M1, M2 | PLANNED |
| M4 | Cart, Checkout & Payment | `types/cart.ts`, `lib/mock/cart.ts`, `lib/context/CartContext.tsx`, `components/cart/*`, `components/checkout/*`, `app/[locale]/cart/page.tsx`, `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/confirmation/page.tsx` | M1, M2, M3 | PLANNED |
| M5 | Orders, Profile & Seller Dashboard | `types/order.ts`, `types/user.ts`, `lib/mock/orders.ts`, `lib/mock/user.ts`, `lib/context/AuthContext.tsx`, `components/orders/*`, `components/profile/*`, `app/[locale]/orders/*`, `app/[locale]/profile/page.tsx`, `app/[locale]/seller/dashboard/page.tsx`, `app/[locale]/login/page.tsx`, `app/[locale]/register/page.tsx` | M1, M4 | PLANNED |
| M6 | Polish, Micro-interactions & a11y | Micro-animations, safe-area insets, ARIA audit, 4-state lifecycle validation across all screens | M2, M3, M4, M5 | PLANNED |
| M7 | Final Milestone & Verification | 100% E2E test pass, adversarial coverage hardening (Tier 5), forensic integrity audit, zero-build-error verification | M1-M6, TEST | PLANNED |

---

## Interface Contracts

### 1. Class Utilities (`lib/utils.ts`)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### 2. Localization Context & Helpers (`lib/i18n/*`, `lib/context/LocaleContext.tsx`)
```typescript
export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LocaleContextValue {
  locale: Locale;
  direction: Direction;
  t: (key: string, fallback?: string) => string;
  setLocale: (locale: Locale) => void;
}
```

### 3. Cart State Context (`lib/context/CartContext.tsx`)
```typescript
export interface CartContextValue {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => { success: boolean; conflict?: boolean; sellerName?: string };
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  confirmSwitchSellerAndAdd: (product: Product, quantity?: number) => void;
  resolveIssue: (itemId: number, issueCode: string) => void;
  itemCount: number;
}
```

### 4. Domain Types (`types/index.ts`)
- `Product`, `Category`, `Seller`, `Review` (`types/catalog.ts`)
- `Cart`, `CartItem`, `CartIssue`, `PricingBreakdown` (`types/cart.ts`)
- `Order`, `OrderStatus`, `OrderTimelineItem`, `Address` (`types/order.ts`)
- `User`, `PaymentMethod`, `LoyaltyTier` (`types/user.ts`)

---

## Code Layout & Write Boundaries

- **M1 Owner**:
  - `lib/utils.ts`, `lib/i18n/*`, `lib/context/LocaleContext.tsx`
  - `app/layout.tsx`, `app/[locale]/layout.tsx`
  - `components/ui/*` (Button, Input, Badge, Card, Modal, Drawer, Tabs, QuantityStepper, Skeleton, Toast)
  - `components/layout/*` (AppHeader, BottomNav, MobileContainer, LanguageToggle)
  - `types/index.ts`, `types/i18n.ts`
- **Testing Track Owner**:
  - `tests/*`, `scripts/run_e2e_tests.sh`, `TEST_INFRA.md`, `TEST_READY.md`
- **M2 Owner**:
  - `types/catalog.ts`, `lib/mock/products.ts`, `lib/mock/categories.ts`, `lib/mock/stories.ts`
  - `components/feed/*`, `components/catalog/*`
  - `app/[locale]/page.tsx`, `app/[locale]/catalog/page.tsx`
- **M3 Owner**:
  - `lib/mock/sellers.ts`
  - `components/pdp/*`
  - `app/[locale]/products/[id]/page.tsx`
- **M4 Owner**:
  - `types/cart.ts`, `lib/mock/cart.ts`, `lib/context/CartContext.tsx`
  - `components/cart/*`, `components/checkout/*`
  - `app/[locale]/cart/page.tsx`, `app/[locale]/checkout/page.tsx`, `app/[locale]/checkout/confirmation/page.tsx`
- **M5 Owner**:
  - `types/order.ts`, `types/user.ts`, `lib/mock/orders.ts`, `lib/mock/user.ts`, `lib/context/AuthContext.tsx`
  - `components/orders/*`, `components/profile/*`
  - `app/[locale]/orders/page.tsx`, `app/[locale]/orders/[id]/page.tsx`, `app/[locale]/profile/page.tsx`, `app/[locale]/seller/dashboard/page.tsx`, `app/[locale]/login/page.tsx`, `app/[locale]/register/page.tsx`
- **M6 Owner**:
  - Polish animations across components, safe-area fixes, a11y ARIA audits.

