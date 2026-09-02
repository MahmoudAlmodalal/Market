# BRIEFING — 2026-08-31T12:24:00+03:00

## Mission
Implement Milestone M5: Orders, Profile & Seller Dashboard for Souqi Marketplace covering all 20 required files across mock data, AuthContext, orders components, profile components, order tracking, profile management, seller inventory/dashboard with AI assistant, and auth pages (login/register).

## 🔒 My Identity
- Archetype: Worker
- Roles: implementer, qa, specialist
- Working directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m5_orders_1
- Original parent: 566893cf-08dc-4f5d-b112-55d3bc21f25a
- Milestone: M5 (Orders, Profile & Seller Dashboard)

## 🔒 Key Constraints
- Mobile-first constraint (max-w-[430px] centered).
- Strict RTL (Arabic default) and LTR (English) compliance.
- 4-state lifecycle (Default, Loading, Empty, Error) across pages/components.
- Real state management, genuine logic, no dummy/facade implementations.
- Verify implementation using `npx tsc --noEmit` and ensure 0 compilation errors.
- Exclusively owned files (20 files).

## Current Parent
- Conversation ID: 566893cf-08dc-4f5d-b112-55d3bc21f25a
- Updated: 2026-08-31T12:24:00+03:00

## Task Summary
- **What to build**:
  1. `lib/mock/orders.ts`: Mock orders dataset covering 6 statuses, timeline, item snapshots, addresses, cancellation.
  2. `lib/mock/user.ts`: Mock user accounts (Customer, Seller, loyalty, addresses, notifications).
  3. `lib/context/AuthContext.tsx`: Full React Context provider for auth & profile state with localStorage persistence.
  4. `components/orders/OrderProgressStepper.tsx`: 5-step visual stepper with RTL/LTR horizontal connecting lines, Coral active, Emerald completed, cancelled banner.
  5. `components/orders/OrderDetailCard.tsx`: Order summary, item snapshot list with thumbnails, address card, contact actions.
  6. `components/orders/CancelOrderModal.tsx`: Cancellation modal with reason selection for pending/confirmed only.
  7. `components/orders/OrderHistoryCard.tsx`: Expandable past order card with thumbnails, reorder CTA.
  8. `components/orders/index.ts`: Barrel export.
  9. `components/profile/ProfileHeader.tsx`: Avatar, name, phone, role badge, loyalty tier, language switcher.
  10. `components/profile/SettingsList.tsx`: Settings menu items, modals, logout confirmation.
  11. `components/profile/SellerStatsTiles.tsx`: 4 KPI tiles (Total Products, Out of Stock, Low Stock, Active Orders).
  12. `components/profile/ProductManagementTable.tsx`: Inventory table with real stock_quantity, status badges, inline update, edit/archive.
  13. `components/profile/AIAssistantPanel.tsx`: AI description/SEO tag generator with realistic loading, confidence score, diff preview, accept/reject.
  14. `components/profile/index.ts`: Barrel export.
  15. `app/[locale]/orders/page.tsx`: Order history list screen with filter tabs, search, 4-state lifecycle.
  16. `app/[locale]/orders/[id]/page.tsx`: Real-time order tracking details screen.
  17. `app/[locale]/profile/page.tsx`: Account profile screen with role switcher, settings, order shortcut.
  18. `app/[locale]/seller/dashboard/page.tsx`: Seller management dashboard.
  19. `app/[locale]/login/page.tsx`: Login screen with demo user quick-select.
  20. `app/[locale]/register/page.tsx`: Registration screen with role selection.
- **Success criteria**: All 20 files properly implemented with genuine logic, strict RTL/LTR support, mobile-first design, 0 tsc errors.
- **Interface contracts**: `/home/mahmoud/Desktop/p3/PROJECT.md` & `/home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md`

## Key Decisions Made
- Initialize investigation of existing codebase to understand existing types, components, styling, i18n setup, and mock data patterns.

## Artifact Index
- `.agents/teamwork_preview_worker_m5_orders_1/DISPATCH.md` — Assignment dispatch
- `.agents/teamwork_preview_worker_m5_orders_1/BRIEFING.md` — Agent briefing & memory
- `.agents/teamwork_preview_worker_m5_orders_1/progress.md` — Heartbeat & progress tracker
- `.agents/teamwork_preview_worker_m5_orders_1/handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Not run yet
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- None explicitly assigned
