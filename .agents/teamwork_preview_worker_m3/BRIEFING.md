# BRIEFING — 2026-08-31T10:35:00Z

## Mission
Complete Milestone M3: Product Detail View (PDP) with high fidelity, rich components, 4-state lifecycle, full RTL/LTR bilingual support, and CartContext integration.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3
- Original parent: 329cff10-b92f-4469-8003-ca39d0857e13
- Milestone: M3 (Product Detail View)

## 🔒 Key Constraints
- Own exclusively: `lib/mock/sellers.ts`, `components/pdp/*`, `app/[locale]/products/[id]/page.tsx`
- Do not modify files owned by other milestones.
- Ensure 4-state lifecycle (Default, Loading Skeleton, Empty/Not Found, Error+Retry).
- Ensure zero TypeScript errors and successful Next.js build (`npm run build`).
- Full RTL/LTR bilingual support and mobile-first container layout (max-w-[430px]).

## Current Parent
- Conversation ID: 329cff10-b92f-4469-8003-ca39d0857e13
- Updated: 2026-08-31T10:35:00Z

## Task Summary
- **What to build**:
  1. `components/pdp/ProductGallery.tsx` / `ImageGalleryViewer.tsx`
  2. `components/pdp/ProductInfo.tsx` / `ProductMetadata.tsx`
  3. `components/pdp/VariantSelector.tsx`
  4. `components/pdp/SellerTrustCard.tsx` / `MerchantCard.tsx`
  5. `components/pdp/StickyActionBar.tsx`
  6. `components/pdp/ReviewList.tsx`
  7. `components/pdp/index.ts`
  8. `lib/mock/sellers.ts` (extended fixtures for PDP, variants, reviews, ratings)
  9. `app/[locale]/products/[id]/page.tsx` (dynamic route, 4-state lifecycle, responsive layout)
- **Success criteria**:
  - All PDP components functional and properly styled
  - Full RTL/LTR and Cairo/Inter typography compliance
  - Zero TypeScript/build errors on `npm run build`
  - E2E tests for PDP passing

## Change Tracker
- **Files modified**: TBD
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: 0 violations
- **Tests added/modified**: PDP unit and E2E checks
