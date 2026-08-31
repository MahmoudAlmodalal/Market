# Incremental Implementation Plan: Souqi Marketplace (Mobile-First UI/UX)

---

## Phase 1: Foundation, Design Tokens & Bilingual Root Shell

### Batch 1.1: Design Token & Tailwind Architecture
* **Objective & Scope**: Establish all core design tokens, color scales, font pipelines, and layout grids as defined in the Stitch design system.
* **Architecture & Artifacts**:
  * Root token definitions (CSS variables for surface, canvas, neutral, brand coral `#E9495E`, semantic status colors).
  * Font integration (Next.js font optimization for `Cairo` Arabic/headings and `Inter` English/numbers).
  * Radius scale configurations (`rounded-sm: 4px`, `rounded-md: 12px`, `rounded-card: 20px`, `rounded-pill: 9999px`).
  * Elevation presets (Custom soft shadow `0 8px 24px rgba(0,0,0,0.08)` and hover elevation).
* **RTL/LTR & Accessibility**:
  * Logical properties architecture (`ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s`, `border-e`).
  * Contrast check for primary coral against white/canvas surfaces (WCAG AA).
* **Acceptance & Verification**:
  * All design system color utilities compile without runtime overhead.
  * Correct font rendering verified for both Arabic text and English numeric data.

---

### Batch 1.2: App Router Layout & Localization Framework
* **Objective & Scope**: Set up the dynamic locale segmenting (`[locale]`), root layout wrapper, and viewport containment for mobile.
* **Architecture & Artifacts**:
  * Next.js App Router dynamic locale wrapper (`/app/[locale]/layout.tsx`).
  * Mobile shell container (max-width mobile constraint on wider viewports with centering).
  * Direction provider dynamically switching `dir="rtl"` (Arabic default) and `dir="ltr"` (English).
  * Metadata & Viewport configuration (prevent layout shifts and pinch zoom breaks on form inputs).
* **RTL/LTR & Accessibility**:
  * Semantic `<html lang="ar" dir="rtl">` dynamic synchronization.
  * Screen reader live region setup for language switching notifications.
* **Acceptance & Verification**:
  * Route changes smoothly flip document direction and typography without flash of unstyled content (FOUC).

---

## Phase 2: Navigation Shell & Core Atomic Components

### Batch 2.1: App Navigation Shell (Header & Bottom Bar)
* **Objective & Scope**: Build the mobile layout chrome that surrounds all views.
* **Architecture & Artifacts**:
  * **Top Header Bar**: App logo, location/branch selector chip, notification bell trigger, language toggle switch.
  * **Bottom Navigation Bar**: Fixed bottom bar with blurred background (`backdrop-blur-md`), active coral indicators, icons for Home, Categories, Cart (with count badge), and Profile.
* **RTL/LTR & Accessibility**:
  * Navigation icon alignment automatically mirrors under RTL.
  * Focus states on interactive buttons with appropriate ARIA landmarks (`role="navigation"`, `aria-label`).
* **Acceptance & Verification**:
  * Bottom bar stays firmly docked above safe-area inset (iOS/Android) without overlapping page content.
  * Active route indicator matches current path.

---

### Batch 2.2: Atomic & Form Components
* **Objective & Scope**: Construct primitive UI building blocks matching the 12px/9999px radius rules.
* **Architecture & Artifacts**:
  * **Buttons**: Primary (Coral filled), Secondary/Soft (`#FFF1F3`), Ghost, and Icon-only buttons.
  * **Search Bar**: Full pill (9999px) container with search icon at start edge and clear action.
  * **Badges & Status Chips**: Soft-tinted semantic chips (Success, Warning, Danger) with 10% opacity fills.
  * **Form Inputs & Steppers**: Quantity counter buttons (`+` / `-`), text inputs with `#EAEAEA` borders.
* **RTL/LTR & Accessibility**:
  * Input icons (search, chevron) position correctly at inline-start / inline-end across locales.
  * Form inputs have explicit labels and `aria-invalid` states for validation.
* **Acceptance & Verification**:
  * All atomic primitives exhibit correct press, active, hover, and disabled visual states.

---

## Phase 3: Marketplace Catalog, Category Discovery & Feed

### Batch 3.1: Category Pills & Hero Promotion Carousel
* **Objective & Scope**: Build the top section of the marketplace feed.
* **Architecture & Artifacts**:
  * **Category Filter Strip**: Horizontal scrolling pill bar with active selection state (coral border + soft background).
  * **Promotional Banner**: Mobile aspect-ratio promotional carousel with rounded corners and slide dots.
  * **Search & Filter Drawer**: Modal sheet with multi-attribute filtering (Price range, Vendor, Availability).
* **RTL/LTR & Accessibility**:
  * Scroll container momentum and scroll snapping behaves naturally in RTL.
  * Carousel navigation supports keyboard arrow navigation and swipe gestures.
* **Acceptance & Verification**:
  * Selecting category pills instantly updates filter state without layout jitter.

---

### Batch 3.2: Product Cards & Grid Ecosystem
* **Objective & Scope**: Implement product cards and the 4-column / 2-column mobile marketplace feed.
* **Architecture & Artifacts**:
  * **ProductCard Component**: 20px radius, `#FFFFFF` container, 1:1 aspect ratio image, 2-line title clamp in Cairo, numeric price in Inter, stock badge, quick-add CTA.
  * **Catalog Grid Layout**: 16px side margin, 16px gutter fluid grid.
  * **Empty & Loading States**: Skeleton cards matching exact proportions and dimensions.
* **RTL/LTR & Accessibility**:
  * Currency symbol positioning respects locale grammar (e.g., `ر.س` vs `SAR`).
  * Cards include descriptive `aria-label` summarizing item title, price, and availability.
* **Acceptance & Verification**:
  * Zero layout shifts (CLS) during skeleton-to-card transitions.
  * Card hover / touch feedback triggers subtle scale (1.02x) and shadow depth.

---

## Phase 4: Product Detail View & Merchant Context

### Batch 4.1: Product Detail Screen (PDP)
* **Objective & Scope**: Detailed product presentation, image gallery, merchant info, and sticky bottom CTA.
* **Architecture & Artifacts**:
  * **Image Gallery Viewer**: Swipeable high-res carousel with pagination indicators.
  * **Product Metadata Block**: Title, bilingual description toggle, price calculation, tags.
  * **Merchant Card**: Neighborhood store badge, vendor rating, delivery time estimate.
  * **Sticky Action Bar**: Pinned bottom drawer with quantity selector and "Add to Cart" button.
* **RTL/LTR & Accessibility**:
  * Close/Back button arrow direction mirrors according to navigation history.
  * Bottom action bar does not cover PDP content (utilizes bottom safe padding).
* **Acceptance & Verification**:
  * Smooth vertical scroll with sticky bottom action bar appearing over content.

---

## Phase 5: Cart, Checkout Flow & Payment Modals

### Batch 5.1: Cart Management & Order Summary
* **Objective & Scope**: Full cart drawer/page with grouped merchant items and bill breakdown.
* **Architecture & Artifacts**:
  * **Cart Item Row**: Thumbnail, title, selected variant, price, swipe-to-delete action.
  * **Order Pricing Breakdown**: Subtotal, delivery fee, taxes, discount voucher input field.
  * **Checkout Trigger Button**: Coral full-width button showing total item count and final price.
* **RTL/LTR & Accessibility**:
  * Swipe actions on mobile match directional expectations (swipe right-to-left in LTR, left-to-right in RTL).
  * Total price announcement via screen reader live region on change.
* **Acceptance & Verification**:
  * Quantity increment/decrement recalculates pricing breakdown seamlessly.

---

### Batch 5.2: Checkout & Delivery Address Flow
* **Objective & Scope**: Multi-step or streamlined one-page mobile checkout.
* **Architecture & Artifacts**:
  * **Address Selector**: Saved addresses card list with radio selection and "Add New" trigger.
  * **Delivery Time Slot Picker**: Horizontal time pill selection.
  * **Payment Method Selector**: Cash on Delivery, Apple Pay, Credit Card cards with selection rings.
* **RTL/LTR & Accessibility**:
  * Form fields group related inputs with `<fieldset>` and `<legend>` tags.
  * Error banners utilize danger color `#D92D3F` with clear icon indicators.
* **Acceptance & Verification**:
  * Validation rules prevent proceeding without required delivery options selected.

---

## Phase 6: Order Tracking, User Profile & System Statuses

### Batch 6.1: Real-time Order Tracking (Stepper & Status)
* **Objective & Scope**: Build the post-checkout order lifecycle tracking screen.
* **Architecture & Artifacts**:
  * **OrderProgress Stepper**: Horizontal/vertical state progress (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`).
  * **Order Details Card**: Order ID, receipt summary, driver/merchant contact shortcut.
  * **Terminal States**: Cancelled / Refunded full-width alert states.
* **RTL/LTR & Accessibility**:
  * Horizontal timeline connecting lines flow correctly from start to end in both directions.
  * Visual status colors match semantic tokens (Green for completed, Coral for active, Danger for cancelled).
* **Acceptance & Verification**:
  * State changes transition active step highlights smoothly.

---

### Batch 6.2: Account Profile & Order History
* **Objective & Scope**: Customer profile, past order lists, and user preferences.
* **Architecture & Artifacts**:
  * **Profile Header**: User avatar, name, phone number, quick language switch.
  * **Order History List**: Expandable cards of previous orders with "Reorder" action.
  * **Settings Links**: Addresses, notifications, terms, logout modal confirmation.
* **RTL/LTR & Accessibility**:
  * Modal overlays incorporate `backdrop-blur-sm` and lock body scrolling.
  * Confirm modals trap keyboard focus and support escape key dismissal.
* **Acceptance & Verification**:
  * Modal interactions open and close with standard mobile spring animations.

---

## Phase 7: Micro-Interactions, Performance & Final Audit

### Batch 7.1: Micro-Animations & Polish
* **Objective & Scope**: Enhance tactile feel across touch gestures and component interactions.
* **Architecture & Artifacts**:
  * Bottom sheet opening/closing drag transitions.
  * Cart badge bounce animation on item addition.
  * Button active press state (subtle scale-down).
* **RTL/LTR & Accessibility**:
  * Respect `prefers-reduced-motion` media query across all transitions.
* **Acceptance & Verification**:
  * Consistent 60fps animations on mobile devices.

---

### Batch 7.2: Responsive, Cross-Browser & a11y Audit
* **Objective & Scope**: Final verification against design fidelity and accessibility guidelines.
* **Architecture & Artifacts**:
  * Automated Lighthouse & axe-core accessibility audit.
  * Visual regression check against Stitch designs (Mobile screens 390px - 430px).
  * Safe-area inset testing on iOS Safari and Android Chrome.
* **Acceptance & Verification**:
  * 0 critical accessibility violations.
  * Lighthouse Performance & Accessibility score > 95 on mobile profile.
