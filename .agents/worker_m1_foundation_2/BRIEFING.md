# BRIEFING — 2026-08-31T08:47:00Z

## Mission
Implement the complete Foundation, Bilingual Core, Navigation Shell, and Atomic UI Primitives for Souqi Marketplace (Milestone M1).

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /home/mahmoud/Desktop/p3/.agents/worker_m1_foundation_2
- Original parent: 316deaf5-6d66-4ca8-b654-ca4a5b65be03
- Milestone: M1 (Foundation & Bilingual Core)

## 🔒 Key Constraints
- Owned files: `lib/utils.ts`, `types/*`, `lib/i18n/*`, `lib/context/LocaleContext.tsx`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `components/layout/*`, `components/ui/*`.
- Strictly follow CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s-*`, `border-e-*`, `start-*`, `end-*`, `text-start`, `text-end`).
- Max-width 430px centered mobile container shell with responsive container styling, shadow, and safe-area support.
- Direction sync: `dir="rtl"` (Arabic) and `dir="ltr"` (English).
- Design system adherence: Brand Coral `#E9495E`, neutral grayscale, 20px card radius, 12px button/input radius, Cairo font for Arabic/headings, Inter for English/numeric tabular data.
- 0 type errors on `npx tsc --noEmit` and clean build with `npm run build`.
- Integrity Mandate: genuine implementation, no dummy facades, no hardcoded cheating.

## Current Parent
- Conversation ID: 316deaf5-6d66-4ca8-b654-ca4a5b65be03
- Updated: not yet

## Task Summary
- **What to build**: Complete M1 scope:
  1. `lib/utils.ts` (cn helper clsx + tailwind-merge)
  2. `types/index.ts`, `types/i18n.ts`, `types/catalog.ts`, `types/cart.ts`, `types/order.ts`, `types/user.ts`
  3. `lib/i18n/dictionaries.ts`, `lib/i18n/ar.json`, `lib/i18n/en.json`
  4. `lib/context/LocaleContext.tsx`
  5. `app/layout.tsx`
  6. `app/[locale]/layout.tsx`
  7. `components/layout/MobileContainer.tsx`
  8. `components/layout/AppHeader.tsx`
  9. `components/layout/BottomNav.tsx`
  10. `components/layout/LanguageToggle.tsx`
  11. `components/ui/Button.tsx`
  12. `components/ui/Input.tsx`
  13. `components/ui/Badge.tsx`
  14. `components/ui/Card.tsx`
  15. `components/ui/Modal.tsx`
  16. `components/ui/Drawer.tsx`
  17. `components/ui/Tabs.tsx`
  18. `components/ui/QuantityStepper.tsx`
  19. `components/ui/Skeleton.tsx`
  20. `components/ui/Toast.tsx`
- **Success criteria**: All components and core foundation implemented cleanly with 100% type safety and design alignment.
- **Interface contracts**: `/home/mahmoud/Desktop/p3/PROJECT.md`
- **Code layout**: `/home/mahmoud/Desktop/p3/PROJECT.md`

## Key Decisions Made
- Use standard React 19 / Next.js 15 App router patterns with client component directives (`"use client"`) where state and DOM APIs are used.
- Ensure strict logical properties in all atomic UI primitives and layouts.

## Artifact Index
- `.agents/worker_m1_foundation_2/DISPATCH.md` — Assignment instructions
- `.agents/worker_m1_foundation_2/BRIEFING.md` — Agent state and memory
- `.agents/worker_m1_foundation_2/progress.md` — Step-by-step progress tracking
- `.agents/worker_m1_foundation_2/handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: Initial setup
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Not yet run
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- **Source**: `/home/mahmoud/Desktop/p3/.agents/skills/ui-styling/SKILL.md`
  - **Local copy**: `.agents/worker_m1_foundation_2/skills/ui-styling.md`
  - **Core methodology**: Tailwind CSS + Accessible UI components + design tokens
