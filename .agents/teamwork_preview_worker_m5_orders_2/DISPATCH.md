## 2026-08-31T10:06:09Z

You are the Implementer Worker for Milestone M5: Orders, Profile & Seller Dashboard of Souqi Marketplace bilingual mobile-first UI.

Your working directory is: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m5_orders_2
Your project root is: /home/mahmoud/Desktop/p3

Read the following requirement files before starting:
- /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
- /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md
- /home/mahmoud/Desktop/p3/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope Boundaries (Files you own exclusively):
- `components/orders/OrderProgressStepper.tsx`
- `components/orders/OrderReceiptCard.tsx`
- `components/orders/CancelOrderModal.tsx`
- `components/orders/index.ts`
- `components/profile/ProfileHeader.tsx`
- `components/profile/OrderHistoryList.tsx`
- `components/profile/SellerStatsTiles.tsx`
- `components/profile/ProductManagementTable.tsx`
- `components/profile/AIAssistantPanel.tsx`
- `components/profile/index.ts`
- `app/[locale]/orders/page.tsx`
- `app/[locale]/orders/[id]/page.tsx`
- `app/[locale]/profile/page.tsx`
- `app/[locale]/seller/dashboard/page.tsx`
- `app/[locale]/login/page.tsx`
- `app/[locale]/register/page.tsx`

Requirements to Implement:
1. `components/orders/*`:
   - `OrderProgressStepper.tsx`: Visual 5-state progress stepper (`Pending` -> `Confirmed` -> `Preparing` -> `Ready` -> `Completed`) with timestamped milestones, active step coral glow, and mirrored RTL/LTR connector lines.
   - `OrderReceiptCard.tsx`: Order ID, item snapshots with thumbnails, pricing breakdown, delivery address, driver & merchant contact shortcut buttons.
   - `CancelOrderModal.tsx`: Confirmation dialog allowing order cancellation only during `Pending` or `Confirmed` status, with reason selection and warning.
   - `components/orders/index.ts`: Barrel exports.
2. `components/profile/*`:
   - `ProfileHeader.tsx`: User avatar, name, phone number, loyalty tier badge, quick language switch toggle, role indicator (Customer / Seller).
   - `OrderHistoryList.tsx`: Chronological past order cards with status badges, thumbnail row, total price, and "Reorder" quick CTA that adds items back to cart.
   - `SellerStatsTiles.tsx`: 4 KPI summary tiles (`product_count`, `out_of_stock_count`, `low_stock_count`, `orders_by_status`) with percentage trend indicators.
   - `ProductManagementTable.tsx`: Inventory table with product thumbnail, name, price, stock quantity counter, active/archived status toggle, and edit action.
   - `AIAssistantPanel.tsx`: AI description & tag suggestion panel with loading animation, generated Arabic/English descriptions, confidence score (e.g. 96%), and Accept/Reject action buttons.
   - `components/profile/index.ts`: Barrel exports.
3. Route Pages:
   - `app/[locale]/orders/page.tsx`: Customer orders list page with filter tabs (All, Active, Past), order cards with status badges, and 4-state lifecycle.
   - `app/[locale]/orders/[id]/page.tsx`: Real-time order tracking page with `OrderProgressStepper`, `OrderReceiptCard`, and `CancelOrderModal`.
   - `app/[locale]/profile/page.tsx`: User profile hub with `ProfileHeader`, `OrderHistoryList`, settings links (Addresses, Notifications, Privacy, Terms), and Logout confirmation modal.
   - `app/[locale]/seller/dashboard/page.tsx`: Seller Merchant Portal with `SellerStatsTiles`, `ProductManagementTable`, `AIAssistantPanel`, and Add Product modal.
   - `app/[locale]/login/page.tsx` & `app/[locale]/register/page.tsx`: Bilingual authentication pages with phone/email inputs, validation states, password toggle, and switch links.
