## 2026-08-31T09:23:53Z

You are the Worker assigned to Milestone M5: Orders, Profile & Seller Dashboard for Souqi Marketplace.

Working Directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m5_orders_1
Project Root: /home/mahmoud/Desktop/p3
Original Request: /home/mahmoud/Desktop/p3/ORIGINAL_REQUEST.md
Specification: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md (Phases 6.1 & 6.2)
Context: /home/mahmoud/Desktop/p3/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Exclusively Owned Files:
1. `lib/mock/orders.ts`: Mock orders dataset covering all 6 order statuses (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`), timeline history, seller details, item snapshots, addresses, and cancellation notes.
2. `lib/mock/user.ts`: Mock user accounts (Customer profile, Seller profile, Loyalty tier data, Saved addresses, Notification preferences).
3. `lib/context/AuthContext.tsx`: Full React Context provider for user authentication & profile state (mock login/logout, user switching between Customer and Seller roles, profile update, localStorage persistence).
4. `components/orders/OrderProgressStepper.tsx`: Visual 5-step progress stepper (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`) with horizontal connecting lines flowing correctly in RTL and LTR, active step highlight in Coral, completed steps in Emerald, cancelled terminal state alert banner.
5. `components/orders/OrderDetailCard.tsx`: Order receipt summary, item snapshot list with thumbnail and quantities, delivery address card, contact merchant / driver action buttons.
6. `components/orders/CancelOrderModal.tsx`: Confirmation modal allowing cancellation only during `pending` or `confirmed` status with reason selection, and preventing cancellation once `preparing`.
7. `components/orders/OrderHistoryCard.tsx`: Expandable past order card with order number, date, status chip, item thumbnails preview, total price, and "Reorder" quick CTA.
8. `components/orders/index.ts`: Barrel export.
9. `components/profile/ProfileHeader.tsx`: User avatar, name, phone number, role badge (Customer / Verified Seller), loyalty tier chip, and quick language switch.
10. `components/profile/SettingsList.tsx`: Profile menu items (Saved Addresses, Payment Methods, Notification Settings, Terms of Service, Privacy Policy, Help Center, Logout confirmation modal).
11. `components/profile/SellerStatsTiles.tsx`: Seller dashboard KPI cards (4 tiles: Total Products, Out of Stock, Low Stock Alert, Active Orders count) with soft-tinted status cards.
12. `components/profile/ProductManagementTable.tsx`: Seller product inventory management view with product rows, actual `stock_quantity`, status badges (Published, Draft, Archived), quick inline stock update, Edit, and Archive actions.
13. `components/profile/AIAssistantPanel.tsx`: AI description and SEO tag suggestion generator with realistic loading state, confidence score badge, suggestion diff preview, and Accept / Reject action buttons.
14. `components/profile/index.ts`: Barrel export.
15. `app/[locale]/orders/page.tsx`: Order history list screen with filter tabs (All, Active, Completed, Cancelled), 4-state lifecycle, and search.
16. `app/[locale]/orders/[id]/page.tsx`: Real-time order tracking details screen with OrderProgressStepper, OrderDetailCard, CancelOrderModal trigger, and timeline audit log.
17. `app/[locale]/profile/page.tsx`: Account profile screen with ProfileHeader, quick role switch toggle (Customer <-> Seller view), SettingsList, and order history shortcut.
18. `app/[locale]/seller/dashboard/page.tsx`: Comprehensive seller management dashboard with SellerStatsTiles, ProductManagementTable, quick add product modal trigger, and AIAssistantPanel.
19. `app/[locale]/login/page.tsx`: Login screen with email/password form, demo user quick-select buttons (Customer, Seller), validation, and redirect.
20. `app/[locale]/register/page.tsx`: Registration screen with role selection (Customer vs Seller), form validation, and onboarding.

Requirements:
- Mobile-first constraint (`max-w-[430px]` centered).
- Strict RTL (Arabic default) and LTR (English) compliance.
- 4-state lifecycle (Default, Loading, Empty, Error).
- Verify implementation using `npx tsc --noEmit` and ensure 0 compilation errors.
- Write your progress to `progress.md` and complete handoff report to `handoff.md` in your working directory.
- Use `send_message` to report back upon completion.
