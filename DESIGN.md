# Design System & Frontend Spec — Souqi Platform

**Version:** v1.0 (MVP) · **Stack:** Next.js 15 App Router · Tailwind CSS
**Sources of truth:** `SRS.md` (behaviour, FR-70..78, NFR-11/12) · `API.md` (payload shapes, error codes) · `DB_DESIGN.md` (schema)
**Scope:** the frontend half `PLAN.md` left out. Every component here renders a field that already exists in `API.md` — no screen invents data.

---

## 1. Reference Aesthetic

Visual reference: [MakanGes — Food Delivery App](https://dribbble.com/shots/20451765-MakanGes-Food-Delivery-App) by Dhira Danuarta.

> ⚠️ **Assumption, not verified.** Dribbble blocks automated fetching, so the token values in §2 are reconstructed from the shot's genre (warm-accent food/commerce app), not read off the source. They are deliberately confined to one table — correct the hex values there and the rest of this document still holds.

**What is adopted:** warm single-accent palette on near-white surfaces · large soft-radius cards · photography as the primary visual · pill buttons and pill filter chips · generous whitespace · one bold weight for prices and headings.

**What is *not* adopted:** MakanGes is a single-restaurant delivery app; Souqi is a multi-vendor catalog with no shipping, no payments, no couriers (SRS §1.2, OD09/OD10). Skip its map, courier-tracking, ETA, tip, and promo-code patterns — none has a backing endpoint.

---

## 2. Design Tokens

Declare once as CSS variables in `app/globals.css`, consume via Tailwind theme. One source, no per-component hex.

### 2.1 Color

| Token | Value | Use |
|---|---|---|
| `--accent` | `#FF7A2F` | Primary buttons, active chip, price emphasis, progress fill |
| `--accent-hover` | `#E8641A` | Hover/active state of the above |
| `--accent-soft` | `#FFF1E8` | Accent-tinted backgrounds, selected chip fill |
| `--fg` | `#1A1614` | Body text, headings |
| `--fg-muted` | `#7A716B` | Secondary text, labels, placeholders |
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#FAF7F5` | Cards, panels, input fills |
| `--border` | `#EDE7E3` | Hairlines, card outlines, dividers |
| `--success` | `#2E9E5B` | `available`, `completed` |
| `--warning` | `#D98A00` | `low_stock`, `price_changed` |
| `--danger` | `#D64545` | `out_of_stock`, errors, `cancelled` |
| `--focus` | `#2F6FED` | Focus ring only — never an accent substitute |

**Semantic mapping** (the only place a status becomes a color):

| Domain value | Token | Label |
|---|---|---|
| `stock_state: available` | `--success` | "In stock" |
| `stock_state: low_stock` | `--warning` | "Only N left" (FR-73) |
| `stock_state: out_of_stock` | `--danger` | "Currently unavailable" (FR-72) |
| `status: pending / confirmed / preparing / ready` | `--fg-muted` / `--accent` | see §6 |
| `status: completed` | `--success` | — |
| `status: cancelled` | `--danger` | — |

### 2.2 Typography

One family, four steps. `Inter` (variable, self-hosted via `next/font`) — no second font.

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `text-display` | 32 / 40 | 700 | Page titles |
| `text-title` | 20 / 28 | 600 | Section headings, product name on detail |
| `text-body` | 15 / 24 | 400 | Everything else |
| `text-label` | 13 / 18 | 500 | Badges, chips, table headers, meta |
| `text-price` | 18 / 24 | 700 | Any money value |

Money is **always** rendered from the server string (`"25.00"`) — never re-formatted with floats (SEC-03 spirit: the client does not compute money).

### 2.3 Spacing, Radius, Elevation

- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48. Nothing else.
- **Radius:** `--r-card: 16px` · `--r-input: 12px` · `--r-pill: 999px` · `--r-image: 12px`.
- **Shadow:** `--shadow-card: 0 1px 2px rgba(26,22,20,.04), 0 8px 24px rgba(26,22,20,.06)`. One shadow. Hover raises it, nothing else uses it.
- **Container:** `max-w-[1200px]`, page gutter 16px mobile / 32px desktop.
- **Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`. Catalog grid: 1 / 2 / 3 / 4 columns.

### 2.4 Direction & Language

`<html lang="en" dir="ltr">` set at `app/layout.tsx`. All UI copy in English; all API `error.code` values stay English identifiers, never displayed raw (NFR-11, NFR-12).

---

## 3. Core Components

Each maps to fields that exist in `API.md`. No component reads a field the API does not send.

### 3.1 `ProductCard` — FR-08

Fields, exactly the list endpoint's shape: `primary_image` (4:3, `object-cover`, `--r-image`) · `name` (2-line clamp) · `seller_name` + `category.name` (`text-label`, muted) · `price` (`text-price`) · `StockBadge`.
`stock_quantity` is **never** present in public payloads — the card cannot show a raw count except via `available_quantity` on the detail page.

### 3.2 `StockBadge` — FR-09, FR-72, FR-73

Pill, `text-label`, driven solely by server `stock_state`:

| `stock_state` | Rendering |
|---|---|
| `available` | "In stock" · `--success` on tinted fill |
| `low_stock` | "Only N left" using `available_quantity`; "Low stock" when the field is absent |
| `out_of_stock` | "Currently unavailable" · `--danger` |

`available_quantity` is present only when `stock_quantity <= LOW_STOCK_THRESHOLD` (API §3) — always guard on the key, never assume it.

### 3.3 `AddToCartButton` — FR-72

Full-width pill, `--accent`. `disabled` with label **"Currently unavailable"** when `stock_state === "out_of_stock"`. Disabled styling: `--surface` fill, `--fg-muted` text, `cursor-not-allowed`, `aria-disabled="true"` — and it stays focusable so a screen reader can reach the explanation.

### 3.4 `StateBlock` — FR-71 (mandatory on every list/data page)

Three explicit states, one component, no page rolls its own:

| State | Rendering |
|---|---|
| **Loading** | Skeleton matching the real layout's shape and count — never a spinner over blank space |
| **Empty** | Icon + one sentence + the obvious next action ("Browse products", "Add your first product") |
| **Error** | Message from the §7 code map + **Retry** button that re-runs the same request |

### 3.5 `CartLine` — FR-24, API §4

Thumbnail · name · `unit_price` (always the **current** server price, OD05) · quantity stepper · `line_total` · `StockBadge` · `issues[]` rendered underneath as `IssueNotice`.

### 3.6 `IssueNotice` — FR-25, FR-26, EC03, EC07

One notice per entry in the line's `issues[]`. Exactly three codes exist:

| `code` | Copy | Severity | Resolution |
|---|---|---|---|
| `price_changed` | "Price changed from `old_price` to `new_price`." | `--warning` | Checkbox **"I accept the new price"** — collected into `acknowledged_issues: [{code:"price_changed", product_id, new_price}]` on checkout |
| `insufficient_stock` | "Only `available` left — reduce the quantity." when `details.available` is present, else "Not enough stock — reduce the quantity." | `--danger` | Inline "Set to `available`" button → `PATCH /cart/items/<id>/`, shown only when the key is present |
| `product_unavailable` | "This product is no longer available." | `--danger` | "Remove" button → `DELETE /cart/items/<id>/` |

Only `price_changed` is acknowledgeable. Stock and availability issues must be *resolved* — no checkbox, and the checkout button stays disabled while `has_blocking_issues` is true.

The ack carries the **product and the price the customer actually saw**, not a bare code: if the price moves again before checkout, the server's ack no longer matches the locked row and checkout re-raises `409` with the new figure (FR-26). So re-render the checkbox unchecked whenever `new_price` changes, and never persist a tick across a cart refetch.

`available` is omitted above the low-stock threshold (API §1.4) — the copy and the "Set to" shortcut both have to survive its absence.

### 3.7 `MultiSellerDialog` — FR-22, OD04

Triggered by `409 multi_seller_cart`. Body: "Your cart already has items from **`details.current_seller`**. Souqi orders hold one seller at a time."
Actions: **Clear cart and add this item** (`DELETE /api/cart/` then re-POST the original item) · **Keep my cart** (dismiss). No silent auto-clear (API §4).

### 3.8 `OrderProgress` — FR-76

All six statuses always rendered, in order: `pending → confirmed → preparing → ready → completed`, with `cancelled` as a terminal off-track state.
Passed steps `--success`, current step `--accent` + bold, future steps `--border`. `cancelled` replaces the whole bar with a single `--danger` banner ("Order cancelled") — a cancelled order has no path forward (BR-03). Progress is derived from `status`; the dated `timeline[]` renders separately below (FR-48).

### 3.9 `SubmitButton` — FR-75

Disabled from the moment of click until the response lands, spinner + "Placing order…". The **same** `Idempotency-Key` (one `crypto.randomUUID()` per checkout attempt, held in a ref) is reused on every retry of that attempt — a new key is minted only after a `201`/`200`, or when the user leaves and returns to `/checkout`.

---

## 4. Page Layouts — FR-70

Rendering strategy is already decided: catalog pages are Server Components with `fetch` + `revalidate` (AD-05); anything user-specific is a Client Component with an authenticated fetch and no cache (AD-06).

| Route | Render | Layout |
|---|---|---|
| `/` | Server (AD-05) | Sticky header (logo · search · cart count · account). Filter row of category pill chips + `ordering` select. Responsive product grid 1/2/3/4. Pagination footer (20/page). Loading = 8 card skeletons. |
| `/products/[id]` | Server (AD-05) | Two columns ≥`lg`: gallery left (main image + `images[]` thumbnails by `sort_order`), detail right (name, price, `StockBadge`, quantity stepper, `AddToCartButton`, seller block, description). Single column below `lg`, action bar sticks to the bottom. `404` → not-found page, never "forbidden" (FR-15). |
| `/cart` | Client (AD-06) | Lines left, sticky `OrderSummary` right (subtotal, `total = subtotal` — no shipping/tax rows, OD09). Seller name in the header bar (single-seller cart). "Proceed to checkout" disabled while `has_blocking_issues`, with the reason stated beneath it. Empty state → "Browse products". |
| `/checkout` | Client | Delivery form left: `contact_name`, `contact_phone`, `delivery_address` (all required, FR-35). Read-only summary right — items, quantities, unit prices, `subtotal`, `total`, **all from the server response** (FR-74). Unacknowledged `price_changed` renders its checkbox here too. `SubmitButton` at the end. No payment UI whatsoever (OD10). |
| `/orders` | Client | Card list, newest first: `order_number`, status pill, `total`, `item_count`, `created_at`. `?status=` chip filter. Empty → "No orders yet". |
| `/orders/[id]` | Client | `OrderProgress` at the top → `timeline[]` (`from_status → to_status`, timestamp) → items (snapshot names and prices, i.e. what was bought, not what the catalog says today) → delivery snapshot. **Cancel order** button visible only for `pending`/`confirmed`, behind a confirm dialog. No live updates — manual refresh (Appendix B). |
| `/seller/*` | Client | Sidebar shell: Dashboard · Products · Orders. Dashboard = four stat tiles (`product_count`, `out_of_stock_count`, `low_stock_count`) + orders-by-status row, all six keys shown even at zero. Products = table with `stock_quantity` visible (sellers see it, the public never does), row actions Edit / Publish / Archive. Orders = table + transition control whose options come from `details.allowed`. |
| `/admin/*` | Client | Same shell. Metrics tiles · products moderation (rejecting requires a non-empty `moderation_note` — the submit button stays disabled until it has one) · orders with status/seller/date filters · users with a suspend toggle · AI suggestions queue. |
| `/login`, `/register` | Client | Centered card, `max-w-[420px]`. Register: email, name, password (≥8 chars, live counter), role radio **Customer / Seller** — `admin` is not offered. Field errors read from `error.details`. |

**Middleware** guards `/seller/*`, `/admin/*`, `/cart`, `/checkout`, `/orders` by redirecting to `/login?next=…`. This is **UX only** — real enforcement lives in the API (FR-77, FR-03, FR-50). The UI never treats a hidden route as a security boundary.

---

## 5. Auth & Token Handling — AD-03

Access token in memory only; refresh token in an `httpOnly` cookie. On `401` with code `account_suspended`, clear client state and redirect to `/login` showing "This account has been suspended." On a plain `401`, attempt one silent refresh, then fall back to the login redirect. Tokens are never written to `localStorage` and never logged.

---

## 6. Status Vocabulary

One map, used by `OrderProgress`, order lists, and seller/admin tables — no per-screen copies (mirrors BR-01's single-source rule on the backend).

| `status` | Label | Color |
|---|---|---|
| `pending` | Pending | `--fg-muted` |
| `confirmed` | Confirmed | `--accent` |
| `preparing` | Preparing | `--accent` |
| `ready` | Ready | `--accent` |
| `completed` | Completed | `--success` |
| `cancelled` | Cancelled | `--danger` |

Transition controls never hardcode targets — they render `error.details.allowed` from the API, or the server's current status (API §6). The state machine lives on the server; the UI only displays it.

---

## 7. Error Message Map — FR-78

Single module, `lib/errors.ts`: `code → message`. Any unmapped code falls back to "Something went wrong. Please try again." A raw `error.code` is never shown to a user.

| `error.code` | HTTP | Message |
|---|:-:|---|
| `validation_error` | 400 | "Please check the highlighted fields." *(field detail from `error.details`)* |
| `invalid_credentials` | 401 | "Incorrect email or password." |
| `account_suspended` | 401 | "This account has been suspended. Contact support." |
| `invalid_quantity` | 400 | "Quantity must be at least 1." |
| `insufficient_stock` | 400 cart / 409 checkout | "Only `details.available` left in stock." — falls back to "Not enough stock." when `available` is absent (omitted above the low-stock threshold) |
| `product_not_purchasable` | 400 | "This product isn't available for purchase." |
| `multi_seller_cart` | 409 | *(handled by `MultiSellerDialog`, §3.7)* |
| `empty_cart` | 400 | "Your cart is empty." |
| `cart_has_issues` | 409 | "Some items need your attention before checkout." *(routes back to `/cart`)* |
| `missing_idempotency_key` | 400 | "Something went wrong. Please try again." *(client bug — never a user's fault)* |
| `invalid_transition` | 400 | "That status change isn't allowed from here." |
| `already_cancelled` | 400 | "This order is already cancelled." |
| `ai_unavailable` | 503 | "The AI assistant is unavailable right now. You can continue without it." |
| `rate_limited` | 429 | "Too many requests. Please wait a moment." |
| *(unmapped)* | any | "Something went wrong. Please try again." |

**AI degradation (NFR-09):** every AI panel is an optional side panel. A `503` collapses it to an inline notice with a Retry link — it never blocks the form it sits next to, and never blocks publishing.

---

## 8. AI Panels — FR-64, FR-66, AI-08

AI output is a **suggestion**, never applied automatically, and the UI must show that.

- Rendered in a bordered `--surface` panel labeled **"AI suggestion — not applied"**, visually distinct from the form fields it proposes to fill.
- Two explicit actions: **Apply to product** (`POST /ai/suggestions/<id>/accept/`) and **Discard** (`/reject/`). No auto-fill on arrival.
- **Except the moderation panel**, which is advisory and maps to no product field: it renders its `notes[]` as a read-only checklist with a single **Dismiss** action (`/reject/`). No Apply button — `accept` on a `moderation` suggestion is a `400` by contract (API §9), so offering one would build a button that always fails.
- `{"status": "needs_regeneration"}` renders "The suggestion didn't meet quality checks." + a **Regenerate** button. The `output` key is absent in that case — never render it optimistically.
- After accepting, show "Applied. Product is still a draft — publish it when you're ready." (AI-08 made visible.)
- All suggestion text arrives HTML-escaped from the server; render it as text, never via `dangerouslySetInnerHTML` (AI-06, SEC-09).

---

## 9. Accessibility Baseline

Not optional, not deferred.

- Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI borders. `--accent` on white passes for large text and fills — **not** for body copy; body text on an accent fill uses white.
- Visible focus ring (`--focus`, 2px, 2px offset) on every interactive element. Focus is never removed without a replacement.
- Status and stock are never communicated by color alone — every badge carries a text label.
- All images have `alt` (product name); decorative images `alt=""`.
- Forms use real `<label>` elements; errors are tied via `aria-describedby` and announced with `role="alert"`.
- Dialogs (`MultiSellerDialog`, cancel confirm) trap focus, close on `Esc`, and restore focus to the trigger.
- Quantity steppers are `<input type="number" min="1">` with real buttons — native control, keyboard-operable for free.

---

## 10. Traceability

| Section | SRS / API |
|---|---|
| §2 Tokens | NFR-11/12, FR-09 |
| §3.1–3.3 Product components | FR-08/09/16/72/73, API §3 |
| §3.4 States | FR-71 |
| §3.5–3.7 Cart | FR-22/24/25/26, OD04/OD05, EC03/EC07, API §4 |
| §3.8 Progress | FR-76, FR-48, BR-03, API §6 |
| §3.9 Submit | FR-75, FR-32, EC05 |
| §4 Pages | FR-70/74/77, AD-05/AD-06, OD09/OD10 |
| §5 Auth | AD-02/AD-03, SEC-10 |
| §6 Status vocabulary | FR-44/45, BR-01, API §6 |
| §7 Error map | FR-78, NFR-09, API §1.4 |
| §8 AI panels | FR-64/65/66, AI-06/AI-08, SEC-09 |
| §9 Accessibility | — *(baseline, not simplified away)* |

## 11. Out of Scope

SRS Appendix B, restated for the frontend: no guest cart or guest checkout UI · no multi-seller order splitting · no notifications · no reviews or favorites · no realtime order updates (manual refresh only) · no payment or shipping screens · no dark theme in MVP (tokens are already variables — adding one is a stylesheet, not a refactor).
