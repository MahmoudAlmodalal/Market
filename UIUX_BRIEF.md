# UI/UX Agent Brief — Souqi Platform (all views)

## Role

You are designing **every screen** of Souqi, a multi-vendor e-commerce MVP (Next.js 15 App Router + Tailwind, Django/DRF API). The design system already exists. Your job is screen-level composition, not system invention.

## Inputs — read in this order

1. `DESIGN.md` — **binding**. §2 tokens (color, type, spacing, radius, shadow, breakpoints), §3 components, §4 page layouts, §6 status vocabulary, §7 error map, §8 AI panels, §9 a11y baseline. These are decided, not suggestions.
2. `API.md` — the only data that exists. Field names, payload shapes, error codes.
3. `SRS.md` §3.11 (FR-70..FR-78) and §2.2 (actors/permissions).

**Hard rule (from DESIGN.md): no screen invents data.** If a field is not in an `API.md` response, it does not appear in a design.

## What you may and may not change

- **May change:** the hex values in `DESIGN.md` §2.1 — they are explicitly flagged as an unverified reconstruction of the reference aesthetic. If you improve them, change them in that one table only.
- **May not change:** typography scale, spacing scale, radii, the single shadow, breakpoints, component contracts, status labels/colors, error message map.

## Constraints

- **No unbacked UI.** No payments, shipping, tax rows, promo codes, coupons, maps, couriers, ETA, live order tracking, ratings, reviews, wishlist, or chat. None has an endpoint (SRS §1.2, OD09/OD10).
- **English, LTR only** (`dir="ltr"`, DESIGN.md §2.4). Do not design Arabic or RTL.
- **Money is a server string** — render as given, never recomputed or re-formatted.
- **Single-seller cart** — a cart never shows mixed sellers.
- **Exact stock is never shown to the public** — only `stock_state` (`available` / `low_stock` "Only N left" / `out_of_stock` "Currently unavailable"). Sellers and admins do see `stock_quantity`.
- Accessibility baseline in DESIGN.md §9 is mandatory: visible `--focus` ring, 4.5:1 text contrast, keyboard-reachable dialogs, no color-only status.

## View inventory — design all of these

**Customer / public**
1. `/` — catalog: sticky header (logo · search · cart count · account), category pill chips + ordering select, grid 1/2/3/4, pagination (20/page)
2. `/products/[id]` — gallery + detail, quantity stepper, `AddToCartButton`, seller block
3. `/cart` — lines + sticky order summary, `IssueNotice`, checkout disabled while blocking issues
4. `/checkout` — delivery form (`contact_name`, `contact_phone`, `delivery_address`) + read-only server summary, `SubmitButton`. No payment UI.
5. `/orders` — order card list + `?status=` chip filter
6. `/orders/[id]` — `OrderProgress` (6 statuses) → timeline → snapshot items → delivery snapshot → Cancel (only `pending`/`confirmed`)
7. `/login`
8. `/register` — email, name, password (≥8, live counter), role radio Customer/Seller only

**Seller** (sidebar shell: Dashboard · Products · Orders)
9. Dashboard — stat tiles (`product_count`, `out_of_stock_count`, `low_stock_count`) + orders-by-status row, all six keys shown even at zero
10. Products table — `stock_quantity` visible, row actions Edit / Publish / Archive, moderation status + `moderation_note`
11. **Product create/edit form** — fields, image upload + reorder + delete, publish action (blocked without ≥1 image), and the AI panels from DESIGN.md §8 (`suggest-description`, `suggest-tags`: idle / loading / result-with-confidence / `needs_regeneration` / `ai_unavailable`, accept & reject)
12. Seller orders table + order detail with the transition control (options rendered from `details.allowed`, never hardcoded)

**Admin** (same shell)
13. Metrics tiles
14. Product moderation — reject requires a non-empty `moderation_note`; submit stays disabled until it has one
15. Orders — status / seller / date filters
16. Users — suspend toggle
17. AI suggestions queue

**Non-route surfaces**
18. `404` / not-found (a forbidden product reads as not-found, FR-15)
19. `MultiSellerDialog` (clear cart / cancel)
20. `IssueNotice` — `price_changed` acknowledgement flow (old → new price, checkbox)
21. Cancel-order confirm dialog
22. Suspended-account redirect state on `/login`

## Per-screen states — mandatory

FR-71: every list/data screen ships **four** comps minimum — **default · loading (skeleton) · empty · error (message + Retry)**. Plus screen-specific states where they apply:

- out-of-stock `AddToCartButton` (disabled, "Currently unavailable")
- low-stock badge ("Only N left")
- checkout button disabled with the blocking reason stated beneath it
- `SubmitButton` pending (disabled on click until response)
- form field errors sourced from `error.details`
- AI panel: loading / rejected / unavailable

**A screen without its states is not delivered.**

## Responsive

Mobile (375) **and** desktop (1280) comps required for `/` and `/products/[id]` (single column + bottom-sticky action bar below `lg`). Desktop-only is acceptable for seller/admin screens in MVP.

## Deliverable format

Per-screen annotated mockups. For each screen: the composition, every state above, and annotations naming the exact API fields and `error.code` values each element renders. Output an index listing all 22 items with their states so coverage is checkable.

> Swap this section if you want Figma frames or static HTML mocks instead.

## Acceptance criteria

- [ ] All 22 items present, each with its required states
- [ ] Every rendered value traces to a field in `API.md`
- [ ] Zero tokens outside DESIGN.md §2 (no stray hex, no off-scale spacing)
- [ ] Status labels/colors match DESIGN.md §6; user-facing errors match §7 — no raw `error.code` on screen
- [ ] No payment, shipping, tax, promo, or tracking UI anywhere
- [ ] Focus states and keyboard paths shown for dialogs and forms
