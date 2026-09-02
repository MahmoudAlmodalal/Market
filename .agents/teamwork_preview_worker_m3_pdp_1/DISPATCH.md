## 2026-08-31T09:23:53Z
You are the Worker assigned to Milestone M3: Product Detail View (PDP) for Souqi Marketplace.

Working Directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m3_pdp_1
Project Root: /home/mahmoud/Desktop/p3
Original Request: /home/mahmoud/Desktop/p3/ORIGINAL_REQUEST.md
Specification: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md (Phase 4.1)
Context: /home/mahmoud/Desktop/p3/PROJECT.md

Scope & Exclusively Owned Files:
1. `lib/mock/sellers.ts`: Rich mock seller fixtures (neighborhood stores, ratings, delivery times, verification badges, contact info, owner details).
2. `components/pdp/ImageGalleryViewer.tsx`: High-resolution swipeable image carousel with pagination dots, thumbnail strip, zoom/lightbox modal preview, and swipe gestures.
3. `components/pdp/ProductMetadata.tsx`: Product title, price with tabular numbers and currency formatting, stock state badge (available, low_stock with exact remaining count, out_of_stock), bilingual description toggle, tags, and AI suggestion badge if applicable.
4. `components/pdp/MerchantCard.tsx`: Neighborhood vendor card with store logo/avatar, business name, verification badge, star rating with review count, neighborhood/city location, and delivery time estimate.
5. `components/pdp/StickyActionBar.tsx`: Fixed bottom action drawer above safe-area inset with interactive QuantityStepper, real-time line total calculation, and full-width "Add to Cart" conversion button with cart bounce / confirmation feedback.
6. `components/pdp/ReviewList.tsx`: Customer reviews list with star rating breakdown, verified buyer chips, and review date.
7. `components/pdp/index.ts`: Barrel export.
8. `app/[locale]/products/[id]/page.tsx`: Full dynamic product detail screen fetching mock product by ID, displaying 4-state lifecycle (Default, Skeleton, Not Found / Empty, Error + Retry), navigation back button mirroring in RTL/LTR, breadcrumbs, and sticky bottom action bar.

Requirements:
- Mobile-first layout constraint (`max-w-[430px]` centered).
- Strict RTL (Arabic default) and LTR (English) compliance using logical Tailwind properties.
- Ensure sticky bottom action bar has appropriate safe-area padding (`pb-safe`) and does not obstruct scrollable PDP content (add bottom padding to page container).
- Integrate "Add to Cart" seamlessly with `CartContext` and show visual toast/feedback upon addition.
- Verify implementation using `npx tsc --noEmit` and ensure 0 compilation errors.
- Write your progress to `progress.md` and complete handoff report to `handoff.md` in your working directory.
- Use `send_message` to report back upon completion.
