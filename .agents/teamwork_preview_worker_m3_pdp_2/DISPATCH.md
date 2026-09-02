## 2026-08-31T09:44:19Z

You are the replacement Worker (gen2) assigned to Milestone M3: Product Detail View (PDP) for Souqi Marketplace.

Working Directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3_pdp_2
Project Root: /home/mahmoud/Desktop/p3
Original Request: /home/mahmoud/Desktop/p3/ORIGINAL_REQUEST.md
Specification: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md (Phase 4.1)
Context: /home/mahmoud/Desktop/p3/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Status & Context:
The predecessor already implemented:
- `lib/mock/sellers.ts`
- `components/pdp/ImageGalleryViewer.tsx`
- `components/pdp/ProductMetadata.tsx`
- `components/pdp/MerchantCard.tsx`

Your Scope & Exclusively Owned Files:
1. Review and refine existing `components/pdp/*` and `lib/mock/sellers.ts`.
2. `components/pdp/StickyActionBar.tsx`: Fixed bottom action drawer above safe-area inset (`pb-safe`) with interactive QuantityStepper, real-time line total calculation, and full-width "Add to Cart" conversion button with cart bounce / confirmation toast feedback.
3. `components/pdp/ReviewList.tsx`: Customer reviews list with star rating breakdown, verified buyer badges, and review date.
4. `components/pdp/index.ts`: Clean barrel export of all PDP components.
5. `app/[locale]/products/[id]/page.tsx`: Full dynamic product detail screen fetching mock product by ID from `lib/mock/products.ts`, displaying 4-state lifecycle (Default, Skeleton, Not Found / Empty, Error + Retry), navigation back button with RTL/LTR mirroring, breadcrumbs, and sticky bottom action bar.

Requirements:
- Mobile-first constraint (`max-w-[430px]` centered).
- Strict RTL (Arabic default) and LTR (English) compliance using logical Tailwind properties.
- Ensure sticky bottom action bar does not obstruct scrollable PDP content (add padding to bottom of page container).
- Integrate "Add to Cart" with `CartContext`.
- Verify implementation using `npx tsc --noEmit` and ensure 0 compilation errors.
- Write your progress to `progress.md` and complete handoff report to `handoff.md` in your working directory.
- Use `send_message` to report back upon completion.
