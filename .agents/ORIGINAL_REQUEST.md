# Original User Request

## Initial Request — 2026-08-31T08:22:54Z

You are the Project Orchestrator for Souqi Marketplace bilingual mobile-first UI implementation.

Working directory: /home/mahmoud/Desktop/p3/.agents/orchestrator_1
Workspace root: /home/mahmoud/Desktop/p3
Original Request path: /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
Specification file: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md

Task:
Implement the complete mobile-first bilingual (Arabic RTL default / English LTR) UI for Souqi Marketplace across all planned phases in parallel execution tracks based on the specification in SOUQI_UI_IMPLEMENTATION_PLAN.md.

Requirements:
- R1. Foundation & Bilingual Core (Phase 1 & Phase 2): Design token architecture (Cairo font for Arabic/headings, Inter for English, #E9495E brand coral), Next.js App Router dynamic locale wrapper (/app/[locale]/...), responsive navigation shell (top header, bottom bar), atomic UI primitives.
- R2. Parallel Feature Domain Modules (Phase 3, 4, 5, 6): Feed & Discovery, Product Detail (PDP), Cart & Checkout, Orders & Profile screens and components with interactive mock data.
- R3. Polish, Micro-interactions & Accessibility (Phase 7): Smooth 60fps micro-interactions, full keyboard/screen-reader ARIA accessibility, mobile safe-area insets.

Acceptance Criteria:
- Next.js app builds with 0 type errors or bundle compilation failures (`npm run build`).
- All views render with correct Arabic (RTL) layout as default and English (LTR) when toggled without layout shifts.
- All component screens (Catalog, PDP, Cart, Checkout, Order Tracking, Profile) are fully interactive with realistic mock data fixtures.
- Mobile viewport constraints (390px - 430px) are adhered to with centered layout on larger screens.

Coordinate your team of subagents, maintain `plan.md` and `progress.md` in your working directory, verify all acceptance criteria thoroughly, and report back when finished.
