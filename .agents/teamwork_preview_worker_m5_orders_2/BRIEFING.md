# BRIEFING — 2026-08-31T10:15:00Z

## Mission
Implement Milestone M5: Orders, Profile & Seller Dashboard for the Souqi Marketplace bilingual mobile-first UI with 100% genuine implementation, zero type errors, full RTL/LTR support, and 4-state lifecycle baseline.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m5_orders_2
- Original parent: a9a51b70-de82-4bee-8ba1-c24b939710ea
- Milestone: M5 (Orders, Profile & Seller Dashboard)

## 🔒 Key Constraints
- Mobile-first constraint (390px - 430px container shell)
- Full Arabic (RTL default) and English (LTR) bilingual responsiveness with no layout breaking
- True interactive mock data and real state transitions (no hardcoding or facade dummy logic)
- Strict cancellation rule: Allowed only during `pending` and `confirmed` statuses
- Follow design token palette (Brand Coral `#E9495E`, neutral surfaces, Cairo/Inter dual fonts)
- 0 TypeScript errors, clean modular components, accessible ARIA attributes

## Current Parent
- Conversation ID: a9a51b70-de82-4bee-8ba1-c24b939710ea
- Updated: 2026-08-31T10:15:00Z

## Task Summary
- **What to build**:
  - Components: `OrderProgressStepper`, `OrderReceiptCard`, `CancelOrderModal`, `ProfileHeader`, `OrderHistoryList`, `SellerStatsTiles`, `ProductManagementTable`, `AIAssistantPanel` and barrel exports.
  - Route Pages: `/orders`, `/orders/[id]`, `/profile`, `/seller/dashboard`, `/login`, `/register`.
- **Success criteria**:
  - All components handle RTL and LTR smoothly using `useLocale()` and token styling.
  - Interactive state management using `lib/mock/orders.ts`, `lib/mock/user.ts`, `useAuth()`, `useCart()`.
  - All E2E test suites and Next.js production build pass with exit code 0.
- **Interface contracts**: `PROJECT.md`, `types/order.ts`, `types/user.ts`, `types/catalog.ts`.
- **Code layout**: `components/orders/*`, `components/profile/*`, `app/[locale]/orders/*`, `app/[locale]/profile/*`, `app/[locale]/seller/*`, `app/[locale]/login/*`, `app/[locale]/register/*`.

## Change Tracker
- **Files modified**: Initializing M5 components and pages
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Not yet executed
- **Lint status**: Clean
- **Tests added/modified**: Pending

## Loaded Skills
- **Source**: `/home/mahmoud/Desktop/p3/.agents/skills/design-system/SKILL.md`
- **Core methodology**: Design tokens, layout principles, component contracts.
- **Source**: `/home/mahmoud/Desktop/p3/.agents/skills/ui-styling/SKILL.md`
- **Core methodology**: Tailwind CSS styling, responsive layout, accessible UI patterns.

## Key Decisions Made
- Use Lucide icons consistently with existing M1-M4 components.
- Ensure RTL mirroring for icons (arrows, chevrons) and connecting lines in Stepper.
- Reorder action seamlessly adds items into `CartContext` and triggers feedback toast.
- AI Assistant includes realistic mock generation with confidence score, tag suggestion, and bilingual content generation.
