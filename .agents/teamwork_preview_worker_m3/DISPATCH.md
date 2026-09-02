## 2026-08-31T10:24:50Z

You are the specialized implementer worker for Milestone M3: Product Detail View (PDP).

Your working directory is: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3
Your project root is: /home/mahmoud/Desktop/p3

Read the following files before starting:
- /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
- /home/mahmoud/Desktop/p3/PROJECT.md
- /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md

Write Boundaries & Files you own exclusively:
- `lib/mock/sellers.ts` (and any PDP mock fixtures such as reviews, product variants)
- `components/pdp/*` (e.g. `ProductGallery.tsx`, `ProductInfo.tsx`, `VariantSelector.tsx`, `SellerTrustCard.tsx`, `StickyActionBar.tsx`, `ReviewList.tsx`, `index.ts`)
- `app/[locale]/products/[id]/page.tsx`

Tasks & Requirements:
1. Complete / refine all PDP components in `components/pdp/*`:
   - Interactive swipeable/clickable image gallery (`ProductGallery`) with bullet pagination, thumbnail row, and full-resolution view.
   - Rich product metadata (`ProductInfo`) with title clamp, price with tabular numbers (Inter), rating stars, bilingual description toggle (Arabic/English), category and stock badges.
   - Variant selector (`VariantSelector`) for colors/sizes/packaging with out-of-stock disable states.
   - Seller trust card (`SellerTrustCard`) with merchant verified badge, location/store info, rating, delivery promise, and contact shortcut.
   - Sticky bottom mobile action drawer (`StickyActionBar`) pinned with quantity stepper and "Add to Cart" button (wired with CartContext).
   - Customer review list (`ReviewList`) with rating breakdown, verified buyer tags, and helpfulness indicators.
2. Complete `app/[locale]/products/[id]/page.tsx`:
   - Support dynamic product ID fetching from mock catalog (`lib/mock/products.ts` and `lib/mock/sellers.ts`).
   - Implement the 4-state lifecycle: Default view, Loading skeleton state, Empty / Not Found state, and Error + Retry state.
   - Ensure full RTL/LTR bilingual support with smooth layout and Cairo/Inter typography.
   - Ensure sticky action bar has proper bottom padding so it never occludes content.
3. Test & verify your changes by running `npm run build` or checking for zero TypeScript errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, write your handoff report to `/home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3/handoff.md` and send a message back to parent orchestrator.
