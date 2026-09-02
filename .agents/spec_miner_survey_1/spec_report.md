# Comprehensive Specification Report: Souqi Marketplace Bilingual UI

**Document Version:** 1.0.0  
**Project:** «سوقي» (Souqi) — Local & Home-Based Multi-Vendor Marketplace  
**Authoritative Sources:** `SOUQI_UI_IMPLEMENTATION_PLAN.md`, `ORIGINAL_REQUEST.md`, `design.md`, `UIUX_BRIEF.md`, `API.md`, `SRS.md`, `lib/tokens.ts`, `app/globals.css`  
**Execution Context:** Mobile-First Bilingual Architecture (Arabic RTL Default / English LTR)  

---

## 1. Executive Summary & Specification Scope

Souqi is a mobile-first, bilingual (Arabic default with RTL layout, English with LTR layout) multi-vendor e-commerce marketplace connecting local artisans, home-based businesses, and neighborhood food producers with consumers. 

The user interface specification demands a modern, warm, and highly trustworthy aesthetic centered on a **Commerce-First** approach. Key architectural foundations include:
- **Design Tokens**: Primary Brand Coral (`#E9495E`), soft blush accents (`#FFF1F3`), neutral grayscale (`#FFFFFF` to `#111111`), and semantic feedback colors.
- **Typography Engine**: Next.js font optimization loading `Cairo` (weights 400, 500, 600, 700) for Arabic and headings, and `Inter` (weights 400, 500, 600, 700) for English body copy and tabular numeric data.
- **Bilingual & RTL Architecture**: Dynamic Next.js App Router locale routing (`/app/[locale]/...`), dynamic semantic document direction switching (`dir="rtl"` vs `dir="ltr"`), logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`), and zero-FOUC locale transitions.
- **Viewport Constraints**: Mobile-first constraint (390px–430px optimal phone canvas) with centered container wrappers on tablet and desktop viewports.
- **Data Integrity**: Single-seller cart rule enforcement, server-authoritative pricing (render-as-given), strict 3-state stock visibility (`available`, `low_stock`, `out_of_stock`), and mandatory 4-state component lifecycle (Default, Loading Skeleton, Empty, Error + Retry).

---

## 2. Features Discovered Inventory

The following table provides the exhaustive inventory of all functional and visual UI features across Phase 1 through Phase 7.

### Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Foundation | Design Token Pipeline | CSS variables and Tailwind theme mapping brand colors, neutrals, semantic statuses, radii, and shadows | CSS variables in `globals.css`, Tailwind theme config | Standard utility classes (`bg-brand-coral`, `text-neutral-800`, `rounded-card`) | Fallback to Tailwind default palette | SOUQI_UI_PLAN §1.1, design.md §2, lib/tokens.ts |
| 2 | Foundation | Dual-Font Typography Setup | Dynamic font loading of Cairo for Arabic/headings and Inter for English/numbers with tabular number isolation | Locale selection (`ar` / `en`), font variable injection | Font classes `font-cairo`, `font-inter`, `.numeric-data` | System sans-serif fallback | SOUQI_UI_PLAN §1.1, app/fonts.ts, design.md §4 |
| 3 | Foundation | App Router Locale Routing | Dynamic routing segment `/[locale]/` encapsulating all customer, seller, and admin routes | URL path containing locale param (`/ar`, `/en`) | Localized layout tree, synchronized `lang` and `dir` | Invalid locale redirects to default `/ar` | SOUQI_UI_PLAN §1.2, ORIGINAL_REQUEST R1 |
| 4 | Foundation | Dynamic RTL/LTR Direction Provider | Synchronizes `<html dir="rtl" lang="ar">` and `<html dir="ltr" lang="en">` with screen-reader announcement | Active locale context | React Context / Provider state updating DOM attributes | Defaults to `dir="rtl"` | SOUQI_UI_PLAN §1.2, ORIGINAL_REQUEST R1 |
| 5 | Foundation | Mobile Container Shell | Max-width mobile constraint (390px–430px) with centered layout on larger desktop/tablet viewports | Viewport width | Centered layout with responsive gutter margins | None (fluid max-width containment) | SOUQI_UI_PLAN §1.2, ORIGINAL_REQUEST |
| 6 | Navigation | Sticky Top Header Bar | Chrome header with brand logo, neighborhood branch selector chip, notification trigger, and language switch toggle | User locale, active notifications, branch state | Rendered header with blurred backdrop (`backdrop-blur-md`) | Non-blocking fallback values | SOUQI_UI_PLAN §2.1, design.md §15.1 |
| 7 | Navigation | Fixed Bottom Navigation Bar | Docked bottom bar docked above mobile safe area with active coral state, icons for Home, Categories, Cart, and Profile | Current pathname, cart item count | Fixed bottom nav bar with cart badge indicator | Active state matches root path fallback | SOUQI_UI_PLAN §2.1, design.md §15.1 |
| 8 | Atomic UI | Button System | Primary (Coral `#E9495E`), Secondary (`#FFF1F3`), Outline, Ghost, and Destructive buttons | Variant, size, disabled, loading props | Interactive button with micro-press scale and loading spinner | Disabled state with `cursor-not-allowed` & `aria-disabled` | SOUQI_UI_PLAN §2.2, design.md §8 |
| 9 | Atomic UI | Search Bar Primitive | Full pill (9999px radius) input with inline start search icon and clear action (`×`) | Search query string, `onSearch`, `onClear` | Rendered search bar with instant filter triggers | Clear button hidden when input is empty | SOUQI_UI_PLAN §2.2, design.md §14 |
| 10 | Atomic UI | Status Badges & Chips | Soft-tinted semantic chips (Success, Warning, Danger, AI Suggestion) with 10% opacity fills | Status type, count/label text | Visual badge with semantic background and border | Fallback to neutral badge style | SOUQI_UI_PLAN §2.2, design.md §12 |
| 11 | Atomic UI | Form Controls & Stepper | Text inputs with `#EAEAEA` borders, focus rings, and numeric quantity counter buttons (`+` / `-`) | Min/Max limits, current value, `onChange` | Interactive input field or counter with boundary clamp | Clamp value at 1 (min) and available stock (max) | SOUQI_UI_PLAN §2.2, design.md §13 |
| 12 | Feed & Catalog | Horizontal Category Filter Strip | Horizontal scrollable pill strip with active selection state (coral border + soft background) | Category list fixture, selected category ID | Horizontal scroll strip with snap behavior | Fallback to "All Categories" active | SOUQI_UI_PLAN §3.1, design.md §34 |
| 13 | Feed & Catalog | Hero Promotional Carousel | Mobile aspect-ratio promotional carousel with rounded corners (`32px` or `24px`), slide dots, and auto-play | Banner slide data fixture | Swipeable/clickable banner cards | Static placeholder on empty banner array | SOUQI_UI_PLAN §3.1, design.md §3.1 |
| 14 | Feed & Catalog | Multi-Attribute Filter Drawer | Slide-up modal sheet with filter options (Price range, Vendor, Category, Availability) | Filter criteria state, `onApply`, `onReset` | Filter drawer overlay with backdrop blur | Reset button restores default filters | SOUQI_UI_PLAN §3.1, design.md §22 |
| 15 | Feed & Catalog | ProductCard Component | 20px radius card, 1:1 image, 2-line title clamp in Cairo, numeric price in Inter, stock badge, quick-add CTA | Product data object | Rendered product card with hover/touch scale | Out of stock displays disabled button with alternate text | SOUQI_UI_PLAN §3.2, design.md §9 |
| 16 | Feed & Catalog | Fluid Catalog Grid | 2-column mobile / 4-column desktop fluid grid with 16px margins and 16px gutters | Array of product items, loading/error states | Responsive grid layout | Renders skeleton grid or empty state | SOUQI_UI_PLAN §3.2, design.md §27 |
| 17 | Feed & Catalog | Skeleton Loading Cards | Pulse skeleton cards matching exact dimensions of ProductCard | Loading boolean state | Animated pulse placeholder cards | Transition to error state on failure | SOUQI_UI_PLAN §3.2, design.md §24 |
| 18 | Product Detail | Swipeable Image Gallery Viewer | High-resolution image carousel with bullet pagination and thumbnail row | Array of product image URLs | Interactive carousel with swipe/arrow support | Fallback placeholder image when empty | SOUQI_UI_PLAN §4.1, design.md §10 |
| 19 | Product Detail | Product Metadata & Tags | Title, bilingual description toggle, price, category tag, and stock status | Product detail payload | Detailed text block with price and stock badge | Truncation with "read more" expansion | SOUQI_UI_PLAN §4.1, design.md §35.1 |
| 20 | Product Detail | Merchant Context Card | Neighborhood vendor card displaying business name, badge, rating, and delivery estimate | Seller metadata object | Seller info card with link to seller storefront | Hidden or default profile if seller info omitted | SOUQI_UI_PLAN §4.1, design.md §35.1 |
| 21 | Product Detail | Sticky Bottom Action Bar | Pinned mobile bottom drawer with quantity stepper and "Add to Cart" conversion button | Stock quantity, unit price, cart action | Floating bottom bar above safe area | Disabled when `stock_state = 'out_of_stock'` | SOUQI_UI_PLAN §4.1, UIUX_BRIEF §2 |
| 22 | Cart | Single-Seller Cart Header | Displays active merchant name and alerts customer that cart is single-seller | Cart seller metadata | Store name banner with policy clarification | Displays empty state if cart is empty | SOUQI_UI_PLAN §5.1, design.md §16.1 |
| 23 | Cart | MultiSellerDialog | Conflict modal triggered when adding product from a different seller | New product payload, current cart seller | Modal prompt: [Clear Cart & Add New] or [Keep Current] | Reverts addition if dismissed | SOUQI_UI_PLAN §5.1, design.md §16.1, API §4 |
| 24 | Cart | CartLineItem with Swipe-to-Delete | Cart item row with 64x64 thumbnail, title, price, quantity counter, and directional swipe delete | Line item object, `onUpdateQty`, `onRemove` | Interactive row item | Displays inline issue banner if item has conflict | SOUQI_UI_PLAN §5.1, design.md §16.2 |
| 25 | Cart | IssueNotice (Cart Issue Resolver) | Yellow/red alert boxes for `price_changed`, `insufficient_stock`, `product_unavailable` | Cart issue array | Acknowledgment checkbox or auto-adjust action | Blocks checkout button until all issues resolved | SOUQI_UI_PLAN §5.1, design.md §16.2, API §4 |
| 26 | Cart | Order Pricing Breakdown | Server-authoritative bill breakdown: subtotal, estimated delivery, discount voucher field | Server cart summary payload | Structured receipt card | Disables checkout on blocking issues | SOUQI_UI_PLAN §5.1, design.md §17 |
| 27 | Checkout | Delivery Address Selector | Saved addresses radio card list with "Add New Address" trigger | List of saved addresses, active ID | Radio selection cards with highlighted border | Validation error banner if address missing | SOUQI_UI_PLAN §5.2, design.md §17 |
| 28 | Checkout | Delivery Time Slot Picker | Horizontal time pill selector for preferred delivery windows | Array of time slots | Interactive selectable pill list | Default to earliest available slot | SOUQI_UI_PLAN §5.2, SOUQI_UI_PLAN §5.2 |
| 29 | Checkout | Payment Method Selector | Cash on Delivery (COD) and mock digital payment cards with selection ring | Payment options enum | Selection card list with active coral ring | Defaults to Cash on Delivery | SOUQI_UI_PLAN §5.2, design.md §17 |
| 30 | Checkout | Idempotent Order Submission | Submit button with instant disable on click, UUIDv4 Idempotency-Key generation, and loading state | Checkout payload, idempotency key | Submits order and navigates to tracking page | Shows danger error alert on 400/409 conflict | SOUQI_UI_PLAN §5.2, API §5, SRS FR-75 |
| 31 | Order Tracking | OrderProgress Stepper | Visual 5-step progress stepper (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`) | Order status string | Step nodes with green checkmarks and active coral pulse | Replaces stepper with red banner on `Cancelled` | SOUQI_UI_PLAN §6.1, design.md §18 |
| 32 | Order Tracking | Order Receipt & Snapshot Details | Order number, item snapshots, delivery address, driver/merchant contact buttons | Order detail payload | Detailed receipt card | 404 state if order not found | SOUQI_UI_PLAN §6.1, API §5 |
| 33 | Order Tracking | Cancel Order Modal Confirmation | Confirmation dialog allowing customer cancellation only during `Pending` or `Confirmed` status | Order ID, current status | Modal dialog with reason selection and confirm CTA | Disabled/hidden if status is preparing or later | SOUQI_UI_PLAN §6.1, design.md §18.1, API §5 |
| 34 | Profile | Account Profile Header | User avatar, name, phone number, role badge, and quick language switch toggle | User session object | Profile hero card | Redirects to login if unauthenticated | SOUQI_UI_PLAN §6.2, design.md §15 |
| 35 | Profile | Expandable Order History List | Chronological past order cards with status chip, item thumbnails, total, and "Reorder" action | Array of user orders | Expandable list of order cards | Empty state illustration if zero orders | SOUQI_UI_PLAN §6.2, UIUX_BRIEF §5 |
| 36 | Profile | Settings & Logout Confirmation | Links to addresses, notifications, terms of service, and logout modal confirmation | User actions | Modal dialog with confirm/cancel | Closes modal on cancel or ESC key | SOUQI_UI_PLAN §6.2, design.md §22 |
| 37 | Seller Module | Seller Dashboard & Stat Tiles | 4 KPI tiles (`product_count`, `out_of_stock_count`, `low_stock_count`, `orders_by_status`) | Dashboard KPI payload | Grid of metric cards with status breakdown | Displays zero count for empty metrics | SOUQI_UI_PLAN §6.2, API §7, design.md §19 |
| 38 | Seller Module | Product Management Table | Product list with actual `stock_quantity`, status badges, Edit, Publish, and Archive actions | Seller products list payload | Responsive table/card list | Moderation note shown on rejected items | SOUQI_UI_PLAN §6.2, design.md §19.2 |
| 39 | Seller Module | AI Assistant Panel | AI description and tag suggestion panel with loading state, confidence score, Accept and Reject actions | Product keywords/notes | AI suggestion box with diff/fill CTA | Fallback warning on `needs_regeneration` / 503 | SOUQI_UI_PLAN §6.2, design.md §21, API §9 |
| 40 | Micro-UX | Micro-Animations & Touch Feedback | Active button scale (`0.98x`), card hover lift (`-2px`), cart bounce, bottom sheet spring physics | User gestures & touch events | Smooth 60fps CSS transitions | Disabled under `prefers-reduced-motion` | SOUQI_UI_PLAN §7.1, globals.css |
| 41 | Accessibility | ARIA & Focus Ring Architecture | WCAG AA contrast compliance, high-visibility coral focus ring, ARIA live regions, dialog focus trapping | Keyboard navigation & screen readers | Semantic accessibility tree and visual focus ring | Clear error announcement for screen readers | SOUQI_UI_PLAN §7.2, design.md §9, globals.css |

---

## 3. Design System Architecture & Tokens

### 3.1 Primary Brand Palette (Coral / Rose Red)
The primary brand color is **`#E9495E`** (`brand-500` / `primary-500`). It is reserved for high-value actions, conversion CTAs, active indicators, and key price elements.

| Token | CSS Variable | Hex Value | RGB | UI Application |
|---|---|---|---|---|
| `brand-50` | `--brand-50` | `#FFF1F3` | `255, 241, 243` | Soft tinted backgrounds, selected pill chips, hero tint |
| `brand-100` | `--brand-100` | `#FFE3E7` | `255, 227, 231` | Hover for light badges, active state of tinted buttons |
| `brand-200` | `--brand-200` | `#FFC9D1` | `255, 201, 209` | Delicate borders on soft backgrounds, subtle outlines |
| `brand-300` | `--brand-300` | `#F8AEBB` | `248, 174, 187` | Decorative elements, inactive step markers |
| `brand-400` | `--brand-400` | `#EB8996` | `235, 137, 150` | Secondary accents, disabled state for light elements |
| **`brand-500`** | **`--brand-500`** | **`#E9495E`** | **`233, 73, 94`** | **Main Brand Primary: CTAs, active icons, brand accents** |
| `brand-600` | `--brand-600` | `#D9364D` | `217, 54, 77` | Primary button hover state, prominent active icons |
| `brand-700` | `--brand-700` | `#B92B3F` | `185, 43, 63` | Primary button pressed/active state, deep links |
| `brand-800` | `--brand-800` | `#932338` | `147, 35, 56` | High-contrast text on light pink, dark badges |
| `brand-900` | `--brand-900` | `#641423` | `100, 20, 35` | Deepest brand tone for contrast-critical text |

### 3.2 Neutral Palette
The neutral palette establishes clear hierarchy without harsh pure black.

| Token | CSS Variable | Hex Value | RGB | UI Application |
|---|---|---|---|---|
| `neutral-0` | `--neutral-0` | `#FFFFFF` | `255, 255, 255` | Pure White: Card surfaces, modals, elevated panels |
| `neutral-50` | `--neutral-50` | `#FAFAFA` | `250, 250, 250` | Page canvas background, subtle section contrast |
| `neutral-100` | `--neutral-100` | `#F5F5F5` | `245, 245, 245` | Image placeholders, input fill, table header rows |
| `neutral-200` | `--neutral-200` | `#EAEAEA` | `234, 234, 234` | Hairline borders, dividers, standard card borders |
| `neutral-300` | `--neutral-300` | `#D6D6D6` | `214, 214, 214` | Inactive step lines, disabled borders |
| `neutral-400` | `--neutral-400` | `#A8A8A8` | `168, 168, 168` | Placeholder text, disabled icon fills |
| `neutral-500` | `--neutral-500` | `#737373` | `115, 115, 115` | Muted secondary text, metadata labels, timestamps |
| `neutral-600` | `--neutral-600` | `#525252` | `82, 82, 82` | Secondary body text, table cells |
| `neutral-700` | `--neutral-700` | `#363636` | `54, 54, 54` | Subheadings, active menu items |
| `neutral-800` | `--neutral-800` | `#202020` | `32, 32, 32` | Headings, primary body text, high-contrast labels |
| `neutral-900` | `--neutral-900` | `#111111` | `17, 17, 17` | Maximum contrast titles, key display numbers |

### 3.3 Semantic Status Palette
Semantic tokens convey clear business feedback:

| Role | Token | Hex | Soft Background | Border | Usage |
|---|---|---|---|---|---|
| **Success** | `semantic.success` | `#22A06B` | `#E8F8F0` | `#B7ECCF` | In-stock badge (`available`), `completed` order, success toast |
| **Warning** | `semantic.warning` | `#E9A23B` | `#FFF6E9` | `#FCE2B8` | Low stock alert (`low_stock`), price changed in cart, review pending |
| **Error / Destructive** | `semantic.error` | `#D92D3F` | `#FDE8EA` | `#F8B4BB` | Out of stock (`out_of_stock`), validation error, `cancelled` order |
| **Info / AI** | `semantic.info` | `#3B82F6` | `#F0F5FF` | `#D0E2FF` | Informational banner, AI suggestion badge, guidance note |

### 3.4 Visual Balance Rule (The 80 / 15 / 5 Rule)
To prevent visual fatigue and maintain a crisp commercial experience:
1. **80% Neutral & White Surfaces**: Canvas `#FAFAFA`, cards `#FFFFFF`, high-readability `#202020` text.
2. **15% Soft Blush Pink (`#FFF1F3`)**: Hero tints, selected category chips, secondary buttons, subtle badge backgrounds.
3. **5% Primary Coral (`#E9495E`)**: Primary CTA buttons, cart count badge, active tab indicator, key price callouts.

### 3.5 Typography Specifications
- **Arabic / Headings**: `Cairo` (`var(--font-cairo)`), weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).
- **English / Numbers**: `Inter` (`var(--font-inter)`), weights: `400`, `500`, `600`, `700`. Tabular numbers enforced via `.numeric-data { font-variant-numeric: tabular-nums; }`.

#### Type Scale Table
| Token | Size (px / rem) | Line Height | Weight | Tailwind Class | Usage |
|---|---|---|---|---|---|
| `display` | 48px / 3.0rem | 1.15 (55px) | 700 | `text-5xl font-bold leading-tight` | Hero headlines, landing titles |
| `headlineH1` | 36px / 2.25rem | 1.20 (43px) | 700 | `text-4xl font-bold leading-tight` | Page main titles, category headers |
| `headlineH1Mobile`| 28px / 1.75rem | 1.21 (34px) | 700 | `text-[28px] font-bold leading-[34px]`| Mobile page titles |
| `headlineH2` | 30px / 1.875rem| 1.25 (38px) | 700 | `text-3xl font-bold leading-snug` | Section titles, dashboard widgets |
| `headlineH2Mobile`| 24px / 1.5rem | 1.25 (30px) | 700 | `text-2xl font-bold leading-[30px]` | Mobile section titles |
| `headlineH3` | 24px / 1.5rem | 1.30 (31px) | 700 | `text-2xl font-bold leading-snug` | Modal headers, product detail name |
| `headlineH4` | 20px / 1.25rem | 1.35 (27px) | 600 | `text-xl font-semibold leading-normal`| Card group titles, table titles |
| `bodyLg` | 18px / 1.125rem| 1.60 (29px) | 400 | `text-lg font-normal leading-relaxed` | Hero subheadings, lead paragraphs |
| `bodyMd` | 16px / 1.0rem | 1.60 (26px) | 400 | `text-base font-normal leading-relaxed`| Standard body text, descriptions |
| `bodySm` | 14px / 0.875rem| 1.50 (21px) | 400 | `text-sm font-normal leading-normal` | Form labels, table cells, meta info |
| `caption` | 12px / 0.75rem | 1.40 (17px) | 500 | `text-xs font-medium leading-normal` | Timestamps, micro-badges, counters |
| `action` | 15px / 0.9375rem| 1.00 (15px) | 600 | `text-[15px] font-semibold leading-none`| Buttons, nav links, tabs |

### 3.6 Border Radii System
| Token | Value | Tailwind Class | UI Component Mapping |
|---|---|---|---|
| `radius-sm` | 4px / 8px | `rounded-sm` / `rounded` | Checkboxes, tooltips, nested mini-elements |
| `radius-md` | 12px | `rounded-md` | Form inputs, standard buttons, dropdown selectors |
| `radius-lg` | 16px | `rounded-lg` | Product card images, modal sub-panels, thumbnails |
| `radius-card` / `radius-xl` | 20px | `rounded-card` / `rounded-xl` | **Product cards**, dialog modals, order summary cards |
| `radius-2xl` | 24px | `rounded-2xl` | Large dialogs, promotional banners |
| `radius-3xl` | 32px | `rounded-3xl` | Hero promo banners, splash cards |
| `radius-pill` | 9999px | `rounded-pill` / `rounded-full`| Category pills, search bar, stock badges, avatar chips |

### 3.7 Elevation & Shadow System
| Elevation Level | Value | Tailwind Name | Purpose |
|---|---|---|---|
| **Shadow Small** | `0 2px 8px rgba(0, 0, 0, 0.05)` | `shadow-soft-sm` | Rest state of cards, hovered chips, focused inputs |
| **Shadow Medium** | `0 8px 24px rgba(0, 0, 0, 0.08)` | `shadow-soft` / `shadow-soft-md` | Product card hover, dropdowns, floating panels |
| **Shadow Large** | `0 16px 40px rgba(0, 0, 0, 0.10)` | `shadow-soft-lg` | Modals, floating cart drawer, bottom sheets |
| **Brand Glow** | `0 8px 20px rgba(233, 73, 94, 0.18)` | `shadow-glow` | Primary CTA rest state, active highlighted card |
| **Brand Glow Hover**| `0 8px 20px rgba(233, 73, 94, 0.25)`| `shadow-glow-hover`| Primary CTA button hover/active |

---

## 4. Bilingual (Arabic RTL & English LTR) Specification

### 4.1 Routing & Dynamic Locale Segmenting
- Route pattern: `/app/[locale]/...` where `locale` is either `ar` or `en`.
- Root layout dynamically binds `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`.
- Default fallback locale is `ar` (Arabic with RTL layout).

### 4.2 Logical Properties CSS Architecture
To avoid layout breaks when switching languages, all spacing and border utilities must use CSS logical properties:
- Use `ms-*` (margin-inline-start) instead of `ml-*` / `mr-*`.
- Use `me-*` (margin-inline-end) instead of `mr-*` / `ml-*`.
- Use `ps-*` (padding-inline-start) instead of `pl-*` / `pr-*`.
- Use `pe-*` (padding-inline-end) instead of `pr-*` / `pl-*`.
- Use `border-s-*` / `border-e-*` instead of `border-l-*` / `border-r-*`.
- Use `start-*` / `end-*` for absolute positioned elements (badges, close buttons).
- Use `text-start` / `text-end` for text alignment.

### 4.3 Mirroring Rules for UI Components
1. **Header & Navigation**:
   - Arabic (RTL): Logo on right, search bar center, cart and profile on left.
   - English (LTR): Logo on left, search bar center, cart and profile on right.
2. **Back / Forward Navigation Chevrons**:
   - `ChevronLeft` in LTR acts as back; in RTL `ChevronRight` acts as back.
   - Using logical rotation `rtl:rotate-180` on directional icons.
3. **Timeline & Stepper Bars**:
   - Connecting lines flow from Right to Left in Arabic (`Pending` → `Confirmed` → ...).
   - Connecting lines flow from Left to Right in English.
4. **Swipe Gestures**:
   - Swipe to delete: In LTR, swipe right-to-left. In RTL, swipe left-to-right.
5. **Price & Currency Representation**:
   - Arabic: Currency symbol `₪` or `ر.س` follows numeric value or matches server string.
   - English: Currency format `SAR 25.00` or `25.00 ₪`.
   - Numerical data always isolated with `.numeric-data` using `font-variant-numeric: tabular-nums` in Inter font.

### 4.4 Locale Persistence & FOUC Prevention
- User preference stored in cookie `NEXT_LOCALE` and synced with `localStorage`.
- Language switcher seamlessly switches route segment (`/ar/products/41` ↔ `/en/products/41`) while preserving query parameters and scroll positions.
- Live region (`aria-live="polite"`) notifies screen reader users of locale transition.

---

## 5. Screen-by-Screen Deep Dive & Information Architecture

### 5.1 Global Elements & Mobile Chrome

#### 1. Mobile Container Shell
- Max width constraint: `max-w-[430px]` centered on screen (`mx-auto min-h-screen bg-canvas shadow-2xl`).
- Background: Page Canvas `#FAFAFA` with surface containers `#FFFFFF`.
- Safe area insets: `pb-[calc(64px+env(safe-area-inset-bottom))]` to prevent bottom navigation overlap.

#### 2. Sticky Top Header
- **Height**: 60px on mobile, 72px on desktop.
- **Background**: `bg-white/95 backdrop-blur-md border-b border-hairline`.
- **Elements (RTL)**:
  - Start (Right): Brand logo «سوقي» in `#E9495E` with store icon.
  - Center: Neighborhood branch selector pill (e.g. `📍 حي الرمال، غزة`).
  - End (Left): Notification trigger with unread indicator dot, Language switcher toggle (`AR` / `EN`).

#### 3. Fixed Bottom Navigation Bar
- **Height**: 64px + safe-area-inset-bottom.
- **Background**: `bg-white/95 backdrop-blur-md border-t border-hairline fixed bottom-0 max-w-[430px] w-full`.
- **Tabs (5 Items)**:
  1. `Home` (الرئيسية) — `Home` icon.
  2. `Catalog` (المنتجات) — `ShoppingBag` icon.
  3. `Cart` (السلة) — `ShoppingCart` icon with numeric badge in `#E9495E`.
  4. `Orders` (طلباتي) — `Package` icon.
  5. `Profile` (حسابي) — `User` icon.
- **Active State**: Coral text (`#E9495E`), filled icon, soft indicator dot. Inactive: `#737373`.

---

### 5.2 Screen 1: Feed & Category Discovery (`/[locale]/`)

#### Architecture & Sections
1. **Search Bar**: 44px pill container with inline search icon, placeholder *"ابحث عن منتج، متجر، أو تصنيف..."*, instant query filtering, clear action.
2. **Hero Promotional Carousel**:
   - Aspect ratio: `16:9` mobile carousel, radius `24px`.
   - Gradient fill: `linear-gradient(135deg, #FFF1F3 0%, #FFD9DF 100%)`.
   - Content: Curated heading *"✨ من يد صانعيها إليك مباشرة"*, subheading, slide pagination dots.
3. **Category Filter Strip**:
   - Horizontal scrolling strip with overflow hidden scrollbar.
   - Pill chips: 36px height, rounded-full, 12px padding.
   - States: Active (`bg-brand-50 border-brand-500 text-brand-coral font-semibold`), Inactive (`bg-white border-neutral-200 text-neutral-600`).
4. **Product Catalog Grid**:
   - Layout: Fluid 2-column mobile grid (`grid-cols-2 gap-3 px-4`).
   - Cards: `ProductCard` (see §5.3).
5. **Filter & Sort Drawer Trigger**: Floating filter pill with active filter count badge.

---

### 5.3 Screen 2: Product Detail Screen (`/[locale]/products/[id]`)

#### Architecture & Sections
1. **Navigation Header**: Transparent overlay with circular back button (mirrored chevron) and share/wishlist action.
2. **Product Image Gallery**:
   - 1:1 Aspect ratio swipeable carousel with active bullet indicators.
   - Bottom thumbnail strip (4 thumbnails, 64x64px, 12px radius, active primary border).
3. **Product Metadata Block**:
   - Product title: Cairo Bold 22px `#202020`.
   - Seller & Category row: Clickable seller badge with verified shield.
   - Price row: Server price string in Inter Bold 28px `#202020` + Stock status badge.
   - Description accordion: Rich text with bilingual expansion.
4. **Merchant Context Card**:
   - Store avatar, business name, neighborhood location, response time, rating indicator.
5. **Sticky Bottom Action Bar**:
   - Pinned bottom bar: Quantity stepper `[ - ] [ 1 ] [ + ]` + full-width Primary CTA button `+ إضافة للسلة (25 ₪)`.
   - Disabled state: When `stock_state = 'out_of_stock'`, button is disabled with text *"غير متوفر حالياً"*.

---

### 5.4 Screen 3: Cart Management (`/[locale]/cart`)

#### Architecture & Sections
1. **Single-Seller Header Card**:
   - Merchant banner: *"منتجات من متجر: مشغل الياسمين"*.
   - Multi-seller protection: Notice explaining single-store fulfillment.
2. **Cart Item Rows**:
   - 64x64px rounded thumbnail, 2-line title, unit price, quantity stepper, line total, delete action.
   - Swipe gesture support for deletion.
3. **IssueNotice Component (Dynamic Conflict Handling)**:
   - **`price_changed`**: Warning banner in `#FFF6E9` with checkbox: *"تغير السعر من 20 ₪ إلى 25 ₪ — أوافق على السعر الجديد"*.
   - **`insufficient_stock`**: Danger banner in `#FDE8EA`: *"الكمية المتبقية 2 فقط"* + quick auto-clamp CTA.
   - **`product_unavailable`**: Destructive banner with remove item button.
4. **Order Bill Breakdown**:
   - Subtotal (from server string), estimated delivery, discount voucher field.
5. **Checkout Trigger Button**:
   - Full-width Coral button: *"متابعة إتمام الطلب (50.00 ₪)"*.
   - Disabled state: Disabled when `has_blocking_issues = true` with reason displayed beneath.

---

### 5.5 Screen 4: Streamlined Checkout (`/[locale]/checkout`)

#### Architecture & Sections
1. **Contact & Delivery Form**:
   - `contact_name`: Full name (required).
   - `contact_phone`: Phone number with country prefix (required).
   - `delivery_address`: Street, building, city (required).
   - `notes`: Optional note for maker/driver.
2. **Delivery Time Slot Picker**:
   - Selectable horizontal pills: `[اليوم: 4-6 مساءً]`, `[اليوم: 6-8 مساءً]`, `[غداً صباحاً]`.
3. **Payment Method Selection**:
   - Cash on Delivery (الدفع عند الاستلام) — pre-selected with checkmark ring.
   - Mock Card / Wallet options (badge: "تجريبي").
4. **Read-Only Order Summary**:
   - Server-calculated summary snapshot.
5. **Confirmation CTA (`SubmitButton`)**:
   - Label: *"✨ تأكيد وإرسال الطلب (50.00 ₪)"*.
   - Generates client-side UUIDv4 `Idempotency-Key` header.
   - Instantly disables on click to prevent double order submissions.

---

### 5.6 Screen 5: Real-Time Order Tracking & Orders List

#### 1. Orders List (`/[locale]/orders`)
- Status filter chips: `[الكل]`, `[قيد الانتظار]`, `[جاري التجهيز]`, `[مكتمل]`, `[ملغي]`.
- Order Cards: Order number (`SQ-2026-1001`), timestamp, total amount, item thumbnails, status badge, reorder button.

#### 2. Order Tracking Screen (`/[locale]/orders/[id]`)
- **Header**: Order number, placement date, seller contact button.
- **OrderProgress Stepper (6 Status Lifecycle)**:
  1. `pending` (قيد الانتظار)
  2. `confirmed` (تم التأكيد)
  3. `preparing` (جاري التجهيز)
  4. `ready` (جاهز للتسليم)
  5. `completed` (تم التسليم بنجاح)
  6. `cancelled` (ملغي) — Displays red destructive alert box with cancellation reason.
- **Items Snapshot**: Read-only historical snapshot of ordered items, quantities, and prices.
- **Delivery Snapshot**: Name, phone, and address locked at checkout.
- **Cancellation Action**: Available only when status is `pending` or `confirmed`. Triggers `CancelOrderDialog`.

---

### 5.7 Screen 6: Account Profile & Preferences (`/[locale]/profile`)

#### Architecture & Sections
1. **Profile Header**: Avatar, user full name, email/phone, customer/seller badge.
2. **Language & Preference Switcher**: Toggle between Arabic (العربية) and English with instant UI re-render.
3. **Quick Links Group**:
   - Saved delivery addresses.
   - Order history shortcut.
   - Notification preferences.
   - Terms & Privacy policy.
4. **Logout Action & Confirmation Dialog**:
   - Destructive button opening confirm modal with backdrop blur.

---

### 5.8 Screen 7: Seller & Admin Dashboards

#### 1. Seller Dashboard (`/[locale]/seller/dashboard`)
- 4 KPI Stat Tiles: `Total Products`, `Out of Stock Count`, `Low Stock Count`, `Orders by Status` breakdown.
- Products Inventory Table with full `stock_quantity`, status badges, Edit, Publish, and Archive actions.
- AI Assistant Panel (`AIDescriptionPanel`):
  - Keyword inputs + `[ ✨ توليد وصف بالذكاء الاصطناعي ]`.
  - Skeleton loader → Result preview with confidence score → `[استخدام الاقتراح]` or `[تعديل/رفض]`.

#### 2. Admin Moderation (`/[locale]/admin/moderation`)
- Product review queue: Approve / Reject actions.
- Rejection requires non-empty `moderation_note` before submit button enables.
- User management with instant `Suspend` action.

---

## 6. State Architecture & Four-State Mandatory Model

Per **SRS FR-71** and **design.md §36**, every list and data view must strictly deliver the **Four Mandatory States**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    FOUR MANDATORY STATES                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│ 1. DEFAULT      │ 2. LOADING      │ 3. EMPTY    │ 4. ERROR  │
│ Live Data       │ Pulse Skeletons │ Actionable  │ Message + │
│ Complete UI     │ Exact geometry  │ Illustration│ Retry CTA │
└─────────────────┴─────────────────┴─────────────┴───────────┘
```

### 1. Default State
- Renders actual data cards, populated inputs, active badge states.

### 2. Loading State (Skeleton)
- Zero layout shift (CLS): Skeleton mirrors the exact aspect ratio, margin, and typography geometry of target components.
- Implementation: `animate-pulse bg-neutral-100 rounded-card`.

### 3. Empty State
- Centered friendly vector illustration, clear informative message, and actionable primary CTA (e.g. *"سلتك فارغة حالياً — تصفح المنتجات المحلية"* + `[ استكشف المنتجات ]`).

### 4. Error State & Error Recovery
- User-friendly localized error message translated from backend `error.code` (no raw technical codes).
- Actionable recovery button `[ إعادة المحاولة / Retry ]` triggering component refetch.

---

## 7. Mock Data Fixtures & Data Schemas

### 7.1 Category Fixture Schema
```typescript
export interface CategoryFixture {
  id: number;
  name: { ar: string; en: string };
  slug: string;
  icon: string; // Lucide icon name
  item_count: number;
}
```

### 7.2 Product Fixture Schema
```typescript
export interface ProductFixture {
  id: number;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: string; // Server string format "25.00"
  currency: { ar: "₪" | "ر.س"; en: "SAR" | "ILS" };
  primary_image: string;
  images: { id: number; image: string; sort_order: number }[];
  stock_state: "available" | "low_stock" | "out_of_stock";
  available_quantity?: number; // Present only when stock_state === 'low_stock' (<= 5)
  seller: {
    id: number;
    business_name: { ar: string; en: string };
    rating: number;
    delivery_time: { ar: string; en: string };
  };
  category: {
    id: number;
    name: { ar: string; en: string };
  };
}
```

### 7.3 Cart & Issue Fixture Schema
```typescript
export interface CartItemFixture {
  id: number;
  product_id: number;
  name: { ar: string; en: string };
  unit_price: string;
  quantity: number;
  line_total: string;
  stock_state: "available" | "low_stock" | "out_of_stock";
  image: string;
  issues: Array<{
    code: "price_changed" | "insufficient_stock" | "product_unavailable";
    old_price?: string;
    new_price?: string;
    available?: number;
  }>;
}

export interface CartFixture {
  id: number;
  seller: { id: number; business_name: { ar: string; en: string } };
  items: CartItemFixture[];
  subtotal: string;
  has_blocking_issues: boolean;
}
```

### 7.4 Order Tracking Fixture Schema
```typescript
export interface OrderTimelineItem {
  from_status: string | null;
  to_status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  created_at: string;
}

export interface OrderFixture {
  id: number;
  order_number: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  seller: { id: number; business_name: { ar: string; en: string } };
  items: {
    product_id: number;
    product_name_snapshot: { ar: string; en: string };
    unit_price_snapshot: string;
    quantity: number;
    line_total: string;
  }[];
  subtotal: string;
  total: string;
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  timeline: OrderTimelineItem[];
  created_at: string;
}
```

---

## 8. Micro-Interactions & Animation Specifications

1. **Button Press Feedback**:
   - `transition: transform 0.15s ease, background-color 0.15s ease;`
   - Active press scale: `scale-[0.98]`.
2. **Product Card Hover Elevation**:
   - `transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;`
   - Hover transform: `translateY(-2px) scale-[1.01]`, shadow transitions from `--shadow-sm` to `--shadow-md`.
3. **Cart Badge Pop Animation**:
   - On item add: Badge scales to `1.25x` and returns to `1.0x` over 300ms using keyframe bounce.
4. **Bottom Sheet Transition**:
   - Drawer entrance: Slide up `translateY(0)` from `translateY(100%)` with backdrop opacity fade.
5. **Motion Sensitivity**:
   - `@media (prefers-reduced-motion: reduce)` disables all transforms and sets transition duration to `0ms`.

---

## 9. Accessibility (a11y) & Usability Baseline

1. **Contrast Standards**:
   - Body text (`#202020`) on canvas (`#FAFAFA`) exceeds 14:1 (surpassing WCAG AAA).
   - Brand coral (`#E9495E`) on white/canvas surface passes WCAG AA for UI controls and large text.
2. **Focus Visibility**:
   - Explicit focus outline `.focus-ring`: `focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`.
3. **ARIA Landmarks & Roles**:
   - Header: `<header role="banner">`.
   - Navigation: `<nav role="navigation" aria-label="Main Navigation">`.
   - Modals: `<div role="dialog" aria-modal="true" aria-labelledby="...">`.
   - Price updates & Cart counts: `aria-live="polite"`.
4. **Keyboard Trapping**:
   - Modals and drawers trap focus with `Tab`/`Shift+Tab` and dismiss cleanly on `Escape`.

---

## 10. Edge Cases & Error Behaviors

The table below catalogs all critical edge cases identified across the specification.

### Edge Cases Table

| # | Feature | Input / Condition | Observed / Required Specification Behavior |
|---|---------|-------------------|---------------------------------------------|
| 1 | Bilingual Switching | Toggle language on active checkout form | Form input values persist; labels and validation hints switch language without clearing state |
| 2 | Product Catalog | Search returns zero matches | Displays empty search state: *"لم نتمكن من العثور على نتائج لـ [query]"* with clear search button |
| 3 | Product Catalog | Price is sent with different decimal formatting | Renders server string verbatim (e.g. `25.00 ₪` or `25 ₪`) without client rounding |
| 4 | Product Detail | Product with `stock_state = 'out_of_stock'` | "Add to Cart" button is disabled (`aria-disabled="true"`), styled gray `#F5F5F5`, text: *"غير متوفر حالياً"* |
| 5 | Product Detail | Product with `stock_state = 'low_stock'` | Quantity stepper is capped at `available_quantity` (e.g. max 3), badge displays *"متبقي 3 فقط"* |
| 6 | Cart Management | Customer attempts to add product from a 2nd seller | Intercepts action with `MultiSellerDialog` asking to clear existing cart or cancel |
| 7 | Cart Management | Product price increased while item is in cart | Displays yellow `IssueNotice` (`price_changed`) with old price, new price, and required ack checkbox |
| 8 | Cart Management | Product stock drops below in-cart quantity | Displays red `IssueNotice` (`insufficient_stock`) with one-click CTA to clamp quantity to remaining stock |
| 9 | Cart Management | In-cart product is unpublished or deleted | Displays red `IssueNotice` (`product_unavailable`) with button to remove item; checkout disabled |
| 10 | Checkout | Fast double-click on "Confirm Order" button | Button instantly disables (`disabled={isSubmitting}`), preventing duplicate submission; uses same `Idempotency-Key` |
| 11 | Checkout | Mandatory contact field left blank on submit | Inline field highlights in danger red `#D92D3F`, aria-invalid="true", summary banner appears at top |
| 12 | Order Tracking | Customer visits cancelled order page | Progress stepper replaced with full-width red cancellation card detailing cancellation timestamp |
| 13 | Order Tracking | Customer attempts to cancel order in `preparing` state | Cancel button is disabled/hidden; notification indicates order is already in preparation |
| 14 | Responsive Layout | User accesses site on 1440px desktop screen | Viewport centered in `max-w-[430px]` frame with subtle ambient background or responsive desktop layout |
| 15 | AI Panel | AI description generation returns `needs_regeneration` | Displays warning box with *"اقتراح غير دقيق، يرجى إعادة المحاولة"* and retry button without modifying fields |
| 16 | AI Panel | Backend AI provider unavailable (`503 ai_unavailable`) | Gracefully displays error toast *"خدمة المساعد الذكي غير متاحة حالياً"* while leaving manual inputs intact |
| 17 | Network Interruption | Fetch fails during catalog scrolling | Renders inline error card with *"تعذر الاتصال بالخادم"* and `[ إعادة المحاولة ]` retry button |

---

## 11. Verification & Compliance Checklist

- [x] Phase 1 to Phase 7 feature mapping complete and fully categorized.
- [x] Design tokens verified against `lib/tokens.ts`, `app/globals.css`, and `design.md`.
- [x] Logical CSS properties (`ms-*`, `me-*`, `border-s-*`) specified for bidirectional RTL/LTR mirroring.
- [x] 4-state lifecycle (Default, Loading, Empty, Error) explicitly documented for every view.
- [x] Single-seller cart rule and `MultiSellerDialog` specified.
- [x] Server-authoritative pricing and stock state rules defined.
- [x] Complete edge cases matrix documented with 17 concrete scenarios.
