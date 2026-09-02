# Master Execution Plan: Souqi Marketplace UI

## Objectives
Deliver a complete mobile-first bilingual (Arabic RTL default, English LTR) UI for Souqi Marketplace adhering to SOUQI_UI_IMPLEMENTATION_PLAN.md with clean build, interactive mocks, and 100% verified E2E and component functionality.

## Execution Tracks & Milestones

### Track 0: Survey & Specification Analysis (Phase 0)
- Parallel discovery using Spec Miner and Explorers to inspect existing repo assets, packages, SOUQI_UI_IMPLEMENTATION_PLAN.md, and compile full Feature Inventory in PROJECT.md.

### Track 1: Foundation & Bilingual Architecture (Milestone M1)
- Design tokens (`tailwind.config`, CSS variables, Cairo & Inter font configs, Coral `#E9495E` palette, shadows, elevations).
- Next.js dynamic routing & bilingual shell (`app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, locale switcher, RTL/LTR direction context, safe-area insets).
- Common Atomic UI primitives (Button, Input, Badge, Card, Modal, Sheet/Drawer, Tabs, Skeleton, Toast, Icon).

### Track 2: E2E & Component Test Infrastructure (Testing Track)
- Independent E2E test harness and test suites across Tiers 1-4.
- Automated validation of bilingual rendering, responsive container limits (390px-430px centered), and component interactivity.

### Track 3: Feature Domain Modules (Milestones M2 - M5 in parallel)
- M2: Feed & Discovery (Stories bar, Live Commerce banner, Promo carousel, Category pills, Flash sales, AI recommendations, Search modal with voice/image search mockup, Filter bottom sheet).
- M3: Product Detail Page - PDP (Image gallery with pinch/zoom & video badge, Sticky Add-to-Cart with quantity selector, Variant selector, Buyer Protection badge, AR Preview trigger, Reviews breakdown with photo cards, Dynamic Cross-sell / Frequently Bought Together).
- M4: Cart & Checkout (Swipeable cart items, Coupon input & gamified free shipping threshold bar, Express Checkout pill, 3-step accordion checkout, Multi-tier shipping selector, Order confirmation with Confetti trigger).
- M5: Orders & Profile (Order timeline / tracking with visual status steps, Return/Refund request modal, Saved Addresses with interactive map pin picker mockup, Payment Methods, Gamified Loyalty Tier card, Help Center / FAQ accordion).

### Track 4: Polish, Micro-interactions & Accessibility (Milestone M6)
- Framer Motion / CSS animations (60fps bottom bar micro-interactions, pull-to-refresh, skeleton pulse, haptic/tap feedback).
- Full ARIA attributes, keyboard navigation, high contrast legibility.
- Zero type errors (`npm run build` with exit code 0).

### Track 5: Final Milestone & Adversarial Hardening (Milestone M7)
- 100% E2E test pass across all tiers.
- Adversarial coverage audit & integrity verification.
