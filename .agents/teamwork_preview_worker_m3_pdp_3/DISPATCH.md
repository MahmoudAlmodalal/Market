## 2026-08-31T10:06:09Z

You are the Implementer Worker for Milestone M3: Product Detail View (PDP) of Souqi Marketplace bilingual mobile-first UI.

Your working directory is: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3_pdp_3
Your project root is: /home/mahmoud/Desktop/p3

Read the following requirement files before starting:
- /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
- /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md
- /home/mahmoud/Desktop/p3/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope Boundaries (Files you own exclusively):
- `components/pdp/ImageGalleryViewer.tsx`
- `components/pdp/ProductMetadata.tsx`
- `components/pdp/MerchantCard.tsx`
- `components/pdp/StickyActionBar.tsx`
- `components/pdp/ReviewList.tsx`
- `components/pdp/index.ts`
- `app/[locale]/products/[id]/page.tsx`

Requirements to Implement:
1. `ImageGalleryViewer.tsx`:
   - High-resolution swipeable image gallery with pagination bullet indicators and thumbnail strip.
   - Smooth touch swipe support, zoom/active preview.
2. `ProductMetadata.tsx`:
   - Cairo font for Arabic titles, bilingual description toggle (Arabic / English translation), tabular numeric pricing with Inter font (`ر.س` for Arabic, `SAR` for English).
   - Stock status badge (In Stock, Low Stock, Out of Stock), category tags, variant selection chips (Size, Color, Weight).
3. `MerchantCard.tsx`:
   - Neighborhood merchant badge, vendor rating stars, estimated delivery time (e.g., 20-30 min), chat/contact shortcut, verified vendor chip.
4. `StickyActionBar.tsx`:
   - Pinned mobile bottom drawer with `pb-safe`, quantity stepper (`+` / `-`), dynamic total price calculation.
   - "Add to Cart" conversion button integrated with `useCart()` context, showing success feedback (toast/badge animation) and triggering `MultiSellerDialog` if a seller conflict exists.
5. `ReviewList.tsx`:
   - Star rating summary, rating distribution bars (5-star to 1-star), verified buyer badges, customer review comments with date and helpful button.
6. `app/[locale]/products/[id]/page.tsx`:
   - Complete PDP screen integrating all PDP components with realistic mock product data from `lib/mock/products.ts` and `lib/mock/sellers.ts`.
   - Mirrored back navigation arrow for RTL/LTR.
   - Full 4-state lifecycle: Default view, Loading skeleton state, Empty state (product not found with back to catalog CTA), and Error state with retry.
