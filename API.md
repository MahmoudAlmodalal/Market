# API Documentation — Souqi Platform

**Version:** v1.0 (MVP) · **Base URL:** `/api/`
**Source of truth:** SRS v1.0 §5 · DB_DESIGN v1.0
**Auth:** JWT Bearer (`simplejwt`) — access 15m, refresh 7d

---

## 1. Conventions

### 1.1 Request

| Item | Value |
|---|---|
| Content type | `application/json` (except image upload → `multipart/form-data`) |
| Auth header | `Authorization: Bearer <access_token>` |
| Checkout header | `Idempotency-Key: <uuid4>` (mandatory on `POST /checkout/` only) |
| Default permission | `IsAuthenticated`. Public endpoints opt out explicitly (SEC-01) |

### 1.2 Error Envelope

Every non-2xx response uses one shape:

```json
{
  "error": {
    "code": "insufficient_stock",
    "message": "Only 3 units available.",
    "details": { "available": 3 }
  }
}
```

### 1.3 Status Contract (SRS §5.8)

| Code | Meaning |
|---|---|
| `200` | OK (also: duplicate idempotent checkout) |
| `201` | Created |
| `204` | Deleted, no body |
| `400` | Validation error or user-fixable business rule |
| `401` | Missing / expired token |
| `403` | Authenticated but wrong role (never used for ownership) |
| `404` | Not found **or** not owned by caller (no existence leak) |
| `409` | State conflict (multi-seller cart, cart issues, stock changed) |
| `429` | Rate limit exceeded |
| `503` | AI provider unavailable |

### 1.4 Error Code Index

| Code | HTTP | Where |
|---|:-:|---|
| `validation_error` | 400 | any |
| `invalid_credentials` | 401 | `/auth/login/` |
| `account_suspended` | 401 | login + every authenticated request (SEC-10) |
| `invalid_quantity` | 400 | cart |
| `insufficient_stock` | 400 cart · 409 checkout | `400` on cart add/update (client-fixable input). `409` on checkout, where stock dropped under lock (state conflict). Same code, two layers — never both in one call. |
| `product_not_purchasable` | 400 | cart |
| `multi_seller_cart` | 409 | cart |
| `empty_cart` | 400 | checkout |
| `cart_has_issues` | 409 | checkout |
| `missing_idempotency_key` | 400 | checkout |
| `invalid_transition` | 400 | orders |
| `already_cancelled` | 400 | order cancel |
| `ai_unavailable` | 503 | AI |
| `needs_regeneration` | 200 | AI (body flag, not an error) |
| `rate_limited` | 429 | any |

### 1.5 Pagination

All list endpoints:

```
?page=1&page_size=20        # page_size default 20, max 100
```

```json
{ "count": 137, "next": "...?page=2", "previous": null, "results": [ ... ] }
```

### 1.6 Rate Limits

| Scope | Limit |
|---|---|
| Authenticated user | 100 req/min |
| Anonymous IP | 30 req/min — **`/products/`, `/categories/`, `/health/` are exempt** |
| AI endpoints | 10 req/hour **per user** (seller or admin) |

The public catalog opts out of the anonymous throttle on purpose (NFR-07): AD-05 makes catalog pages a server-side Next.js `fetch`, so every public request reaches Django from one origin IP and a 30/min per-IP limit would cap the whole site's browsing traffic. Per-client limits on those routes come from a trusted forwarded header or the edge, never from the raw peer IP.

### 1.7 Computed Fields

`stock_state` is **server-computed, never client-supplied**:

| Value | Condition |
|---|---|
| `out_of_stock` | `stock_quantity == 0` |
| `low_stock` | `1 <= stock_quantity <= LOW_STOCK_THRESHOLD` (default 5) |
| `available` | otherwise |

`price`, `subtotal`, `total`, `line_total` are **read-only everywhere**. Sending them in a request body is ignored, not rejected (SEC-03).

---

## 2. Auth

### `POST /api/auth/register/` — Guest

```json
{ "email": "sara@example.com", "password": "hunter2secure", "name": "Sara", "role": "seller" }
```

`role` ∈ `customer` | `seller`. Choosing `seller` auto-creates an active `SellerProfile`.

**201**
```json
{
  "user": { "id": 7, "name": "Sara", "email": "sara@example.com", "role": "seller" },
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci..."
}
```

**Errors:** `400 validation_error` (email taken — case-insensitive; password < 8 chars; bad role).

---

### `POST /api/auth/login/` — Guest

```json
{ "email": "sara@example.com", "password": "hunter2secure" }
```

**200** → same shape as register.
**Errors:** `401 invalid_credentials` · `401 account_suspended`.

---

### `POST /api/auth/refresh/` — Guest

```json
{ "refresh": "eyJhbGci..." }
```

**200** `{ "access": "eyJhbGci..." }` · **Errors:** `401`.

---

### `GET /api/auth/me/` — Auth

**200** `{ "id": 7, "name": "Sara", "email": "sara@example.com", "role": "seller" }`

---

## 3. Catalog (Public)

### `GET /api/products/`

Published products only. No auth.

| Query | Example | Notes |
|---|---|---|
| `search` | `?search=soap` | `ILIKE` on `name` + `description` |
| `category` | `?category=3` | category id |
| `seller` | `?seller=2` | seller profile id |
| `ordering` | `?ordering=-created_at` | `price`, `-price`, `created_at`, `-created_at` |
| `page`, `page_size` | `?page=2&page_size=40` | max 100 |

**200**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 41,
      "name": "Natural Lavender Soap",
      "price": "25.00",
      "primary_image": "/media/products/soap-1.webp",
      "stock_state": "available",
      "seller_name": "Sara Handmade",
      "category": { "id": 3, "name": "Bath & Body" }
    }
  ]
}
```

`draft`, `rejected`, `archived` products and products of suspended sellers never appear here.

---

### `GET /api/products/<id>/`

**200**
```json
{
  "id": 41,
  "name": "Natural Lavender Soap",
  "description": "Cold-pressed...",
  "price": "25.00",
  "stock_state": "low_stock",
  "available_quantity": 3,
  "category": { "id": 3, "name": "Bath & Body" },
  "seller": { "id": 2, "business_name": "Sara Handmade", "description": "..." },
  "images": [
    { "id": 90, "image": "/media/products/soap-1.webp", "sort_order": 0 },
    { "id": 91, "image": "/media/products/soap-2.webp", "sort_order": 1 }
  ],
  "created_at": "2026-03-01T09:12:00Z"
}
```

`available_quantity` is present **only** when `stock_quantity <= LOW_STOCK_THRESHOLD`; otherwise the field is omitted and only `stock_state` is exposed.

**Errors:** `404` for any non-published product requested by a non-owner / non-admin.

---

### `GET /api/categories/`

**200** `[{ "id": 3, "name": "Bath & Body", "slug": "bath-body" }]` — `status=active` only.

---

## 4. Cart — Customer only

One cart per customer, created on first add. No guest cart. **Single-seller cart:** all items must belong to one seller.

### `GET /api/cart/`

Re-validates every line on read (existence, published status, stock, price drift).

**200**
```json
{
  "id": 5,
  "seller": { "id": 2, "business_name": "Sara Handmade" },
  "items": [
    {
      "id": 18,
      "product_id": 41,
      "name": "Natural Lavender Soap",
      "unit_price": "25.00",
      "quantity": 2,
      "line_total": "50.00",
      "stock_state": "available",
      "issues": []
    },
    {
      "id": 19,
      "product_id": 44,
      "name": "Shea Balm",
      "unit_price": "30.00",
      "quantity": 2,
      "line_total": "60.00",
      "stock_state": "low_stock",
      "issues": [
        { "code": "price_changed", "old_price": "20.00", "new_price": "30.00" },
        { "code": "insufficient_stock", "available": 1 }
      ]
    }
  ],
  "subtotal": "110.00",
  "has_blocking_issues": true
}
```

**Issue codes:** `product_unavailable` · `insufficient_stock` · `price_changed`.
Any issue blocks checkout until acknowledged (`price_changed`) or resolved (the others).

---

### `POST /api/cart/items/`

```json
{ "product_id": 41, "quantity": 2 }
```

**Replace semantics** — if the product is already in the cart, `quantity` is *set*, not added (enforced structurally by `UNIQUE(cart_id, product_id)`).

**201** → full cart body (same as `GET /api/cart/`).

**Errors**

| Code | HTTP | When |
|---|:-:|---|
| `invalid_quantity` | 400 | `quantity < 1` |
| `insufficient_stock` | 400 | `quantity > stock_quantity`; `details.available` — see clamp below |
| `product_not_purchasable` | 400 | product not `published` |
| `multi_seller_cart` | 409 | product's seller ≠ cart's seller; `details.current_seller` |

> **`details.available` is clamped.** It is returned only when `stock_quantity <= LOW_STOCK_THRESHOLD`; above the threshold the key is omitted and the message reads "Not enough stock." Otherwise any caller could request `quantity: 99999` and read back the exact inventory that §3 deliberately hides (FR-16). The same clamp applies to the `insufficient_stock` issue in `GET /api/cart/` and to the checkout `409`.

Resolve `multi_seller_cart` by calling `DELETE /api/cart/` then re-adding.

---

### `PATCH /api/cart/items/<id>/`

```json
{ "quantity": 3 }
```
**200** → full cart. Same error set as POST, plus `404` if the item is not in the caller's cart.

### `DELETE /api/cart/items/<id>/` → **204** · `404` if not the caller's item.

### `DELETE /api/cart/` → **204**. Clears all lines.

---

## 5. Checkout & Orders — Customer

### `POST /api/checkout/`

**Headers:** `Authorization: Bearer <access>` · `Idempotency-Key: <uuid4>` *(mandatory)*

```json
{
  "contact_name": "Omar Nasser",
  "contact_phone": "+970591234567",
  "delivery_address": "12 Al-Bahr St, Gaza",
  "acknowledged_issues": [
    { "code": "price_changed", "product_id": 44, "new_price": "30.00" }
  ]
}
```

An acknowledgement binds to a **specific product at a specific price** — the price the customer actually saw. At checkout each ack is matched against the locked product row; if the price moved again in between, the ack no longer matches and the request fails with `409 cart_has_issues` carrying the new price. A bare code (`["price_changed"]`) is **not** accepted — it would let an order commit at a price the customer never saw (FR-26, OD05).

Only `price_changed` is acknowledgeable. `product_unavailable` and `insufficient_stock` must be resolved, never acknowledged.

Any `price`, `total`, or `line_total` in the body is **never read**. Totals come from the DB under row locks.

**Runs in a single transaction:** verify idempotency → lock product rows (ordered by id) → verify published → verify stock → compute totals → create `Order` + `OrderItem`s → deduct stock → log status history → clear cart → commit. Any failure rolls the whole thing back — no partial order, no stock movement.

**201 Created**
```json
{
  "order_number": "SQ-2026-1001",
  "status": "pending",
  "items": [
    {
      "product_name_snapshot": "Natural Lavender Soap",
      "unit_price_snapshot": "25.00",
      "quantity": 2,
      "line_total": "50.00"
    }
  ],
  "subtotal": "50.00",
  "total": "50.00",
  "created_at": "2026-03-01T10:00:00Z"
}
```

**200 OK** — same body, when the `Idempotency-Key` matches an order this customer already created. No second order, no second stock deduction.

**Errors**

| Code | HTTP | When |
|---|:-:|---|
| `missing_idempotency_key` | 400 | header absent or not a uuid4 |
| `empty_cart` | 400 | cart has no items |
| `validation_error` | 400 | missing contact/delivery fields |
| `cart_has_issues` | 409 | unacknowledged issues; `details.issues[]` |
| `insufficient_stock` | 409 | stock dropped between cart read and lock; `details.product_id`, plus `details.available` **under the same clamp as §4** (present only when `stock_quantity <= LOW_STOCK_THRESHOLD`) |

> Client rule: disable the confirm button on click and reuse the **same** `Idempotency-Key` for every retry of the same attempt.

---

### `GET /api/orders/`

Caller's orders only, newest first. Filter: `?status=pending`.

**200**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 88,
      "order_number": "SQ-2026-1001",
      "status": "pending",
      "total": "50.00",
      "item_count": 1,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/orders/<id>/`

**200**
```json
{
  "id": 88,
  "order_number": "SQ-2026-1001",
  "status": "preparing",
  "seller": { "id": 2, "business_name": "Sara Handmade" },
  "items": [
    {
      "product_id": 41,
      "product_name_snapshot": "Natural Lavender Soap",
      "unit_price_snapshot": "25.00",
      "quantity": 2,
      "line_total": "50.00"
    }
  ],
  "subtotal": "50.00",
  "total": "50.00",
  "contact_name": "Omar Nasser",
  "contact_phone": "+970591234567",
  "delivery_address": "12 Al-Bahr St, Gaza",
  "timeline": [
    { "from_status": null, "to_status": "pending", "created_at": "2026-03-01T10:00:00Z" },
    { "from_status": "pending", "to_status": "confirmed", "created_at": "2026-03-01T10:20:00Z" },
    { "from_status": "confirmed", "to_status": "preparing", "created_at": "2026-03-01T10:35:00Z" }
  ],
  "created_at": "2026-03-01T10:00:00Z"
}
```

**Errors:** `404` for another customer's order (never `403`).

---

### `POST /api/orders/<id>/cancel/`

Allowed from `pending` or `confirmed` only. Restores stock inside the same transaction, exactly once (guarded by `stock_restored`).

**200** `{ "order_number": "SQ-2026-1001", "status": "cancelled" }`

**Errors:** `400 invalid_transition` (order is `preparing`/`ready`/`completed`) · `400 already_cancelled` · `404`.

---

## 6. Order State Machine

```
pending → confirmed → preparing → ready → completed
   ↓          ↓           ↓          ↓
        ──── cancelled ────
```

| From → To | Customer | Seller (owner) | Admin |
|---|:-:|:-:|:-:|
| `pending → confirmed` | ❌ | ✅ | ✅ |
| `pending → cancelled` | ✅ | ✅ | ✅ |
| `confirmed → preparing` | ❌ | ✅ | ✅ |
| `confirmed → cancelled` | ✅ | ✅ | ✅ |
| `preparing → ready` | ❌ | ✅ | ✅ |
| `preparing → cancelled` | ❌ | ✅ | ✅ |
| `ready → completed` | ❌ | ✅ | ✅ |
| `ready → cancelled` | ❌ | ✅ | ✅ |
| from `completed` / `cancelled` | ❌ | ❌ | ❌ |

`completed` and `cancelled` are terminal. Any transition to `cancelled` from a non-terminal state restores stock. Any disallowed pair → `400 invalid_transition`.

---

## 7. Seller — role `seller` only

All seller endpoints are ownership-scoped at the queryset level: another seller's resource returns `404`, never `403`.

> **Admin does not use these endpoints.** They are scoped to `request.user.sellerprofile`, which an admin account does not have (`SellerProfile` exists only for `role=seller` — FR-04), and `POST /seller/products/` has no seller to assign. Admin reads and edits any product through `/api/admin/products/<id>/` (§8).

### `GET /api/seller/products/`

Filters: `?status=draft|published|rejected|archived` · `?search=` · pagination.

**200** — list of:
```json
{
  "id": 41,
  "name": "Natural Lavender Soap",
  "price": "25.00",
  "stock_quantity": 3,
  "stock_state": "low_stock",
  "status": "published",
  "category": { "id": 3, "name": "Bath & Body" },
  "image_count": 2,
  "created_at": "2026-03-01T09:12:00Z"
}
```

Sellers see `stock_quantity` in full; the public catalog never does.

---

### `POST /api/seller/products/`

```json
{
  "name": "Natural Lavender Soap",
  "description": "Cold-pressed with...",
  "price": "25.00",
  "stock_quantity": 5,
  "category_id": 3
}
```

Always created with `status: "draft"`. Publishing is a separate explicit call.

**201** → product object. **Errors:** `400 validation_error` (price < 0, stock < 0, description > 5000 chars, unknown category).

---

### `GET /api/seller/products/<id>/` → **200** full product incl. `moderation_note`. `404` if not owned.

### `PATCH /api/seller/products/<id>/`

```json
{ "price": "27.00", "stock_quantity": 10 }
```

Editable: `name`, `description`, `price`, `stock_quantity` (≥ 0), `category_id`.
Not editable here: `status` (use `/publish/`), `seller`, `moderation_note`.

**200** → product. **Errors:** `400 validation_error` · `404`.

> Editing `name` or `price` does not alter any existing order — order items hold snapshots.

---

### `DELETE /api/seller/products/<id>/`

Soft delete → `status = "archived"`. Row is never removed; products referenced by orders are DB-protected.

**204** · `404` if not owned.

---

### `POST /api/seller/products/<id>/publish/`

**200** `{ "id": 41, "status": "published" }`
**Errors:** `400 validation_error` (no images, or product is `rejected`/`archived`) · `404`.

---

### `POST /api/seller/products/<id>/images/`

`multipart/form-data`: `image` (file), optional `sort_order` (int).

**Omitting `sort_order` appends** — the server assigns `max(sort_order) + 1` for that product (`0` for the first image). It must not default to `0`, or the second image of every product would collide with the first under DR-06's `UNIQUE(product, sort_order)` and fail a request that supplied nothing.

Limits: max 5 images per product · ≤ 2 MB each · `image/jpeg`, `image/png`, `image/webp` (real MIME checked, not just extension).

**201** `{ "id": 92, "image": "/media/products/soap-3.webp", "sort_order": 2 }`
**Errors:** `400 validation_error` (too large, wrong type, limit reached, `sort_order` taken) · `404`.

### `DELETE /api/seller/products/<id>/images/<image_id>/` → **204** · `404`.

---

### `GET /api/seller/orders/`

Orders for this seller's products only. Filters: `?status=` · pagination.

**200** — list of:
```json
{
  "id": 88,
  "order_number": "SQ-2026-1001",
  "status": "pending",
  "total": "50.00",
  "item_count": 1,
  "contact_name": "Omar Nasser",
  "created_at": "2026-03-01T10:00:00Z"
}
```

Customer identity is **not** exposed — only the delivery snapshot fields.

---

### `GET /api/seller/orders/<id>/`

**200** — order detail with `items[]`, `timeline[]`, `contact_name`, `contact_phone`, `delivery_address`. No customer email, id, or account data.

---

### `POST /api/seller/orders/<id>/transition/`

```json
{ "to_status": "confirmed" }
```

**200**
```json
{ "order_number": "SQ-2026-1001", "from_status": "pending", "status": "confirmed" }
```

**Errors:** `400 invalid_transition` (`details.allowed: ["confirmed", "cancelled"]`) · `404`.
Transitioning to `cancelled` restores stock in the same transaction.

---

### `GET /api/seller/dashboard/`

**200**
```json
{
  "product_count": 12,
  "out_of_stock_count": 1,
  "low_stock_count": 3,
  "orders_by_status": {
    "pending": 2, "confirmed": 1, "preparing": 0,
    "ready": 0, "completed": 7, "cancelled": 1
  }
}
```

---

## 8. Admin — role `admin`

### `GET /api/admin/metrics/`

**200**
```json
{
  "total_orders": 143,
  "total_sales": "8420.00",
  "published_product_count": 96,
  "active_seller_count": 11,
  "orders_by_status": { "pending": 4, "confirmed": 6, "preparing": 3, "ready": 2, "completed": 121, "cancelled": 7 }
}
```

### `GET /api/admin/products/<id>/` — any product, any status.

### `PATCH /api/admin/products/<id>/`

```json
{ "status": "rejected", "moderation_note": "Misleading health claims in description." }
```

`moderation_note` is **required** when setting `status = "rejected"`.
**200** → product. **Errors:** `400 validation_error`.

### `GET /api/admin/orders/`

All orders. Filters: `?status=` · `?seller=<id>` · `?date_from=YYYY-MM-DD` · `?date_to=YYYY-MM-DD` · pagination.

### `GET /api/admin/users/<id>/` → user detail incl. `role`, `status`.

### `PATCH /api/admin/users/<id>/`

```json
{ "status": "suspended" }
```

Suspending blocks login, rejects the user's existing tokens on the next request, and hides their products from the catalog.

When the target has `role = "seller"`, the same call also mirrors `status` onto their `SellerProfile` in the same transaction — that field has no endpoint of its own and would otherwise never be written.

### `GET /api/admin/ai-suggestions/`

Filters: `?review_status=pending|accepted|rejected` · `?suggestion_type=` · pagination.

---

## 9. AI — Seller / Admin only

Every AI response is stored as an `AIContentSuggestion` with `review_status: "pending"` and is **never** auto-applied. AI is never involved in pricing, stock, totals, permissions, or state transitions.

**Shared errors:** `403` (customer/guest) · `429 rate_limited` (10/hour per user — admins have no seller profile to key on) · `503 ai_unavailable` (provider error or > 10s timeout — no side effects).

### `POST /api/ai/suggest-description/`

```json
{
  "name": "Lavender soap",
  "category_id": 3,
  "attributes": { "weight": "100g", "scent": "lavender" },
  "notes": "handmade, cold-pressed"
}
```

**200 — accepted output**
```json
{
  "suggestion_id": 55,
  "status": "pending",
  "output": {
    "title": "Natural Lavender Soap",
    "short_description": "Cold-pressed handmade soap...",
    "description": "Made in small batches...",
    "highlights": ["100% natural", "Cold-pressed"],
    "suggested_tags": ["lavender", "handmade"],
    "confidence": 0.87
  }
}
```

**200 — rejected output**
```json
{ "suggestion_id": 56, "status": "needs_regeneration", "reason": "low_confidence" }
```

`reason` ∈ `low_confidence` (confidence < 0.5) · `schema_invalid` (anything in the table below failed). Two distinct causes need two distinct reasons — a regenerate is worth retrying on `low_confidence` and is a provider bug on `schema_invalid`.

Rejection triggers (`review_status` stored as `rejected`, no `output` returned):

| Rule | Constraint |
|---|---|
| Schema | must be valid JSON matching the schema above |
| `title` | 3–160 chars |
| `short_description` | ≤ 300 chars |
| `description` | 20–5000 chars |
| `highlights` | 1–6 items, each ≤ 120 chars |
| `suggested_tags` | 0–10 items, each `^[\w\s-]{2,30}$` |
| `confidence` | 0.0–1.0; **< 0.5 → `needs_regeneration`** |

All returned text is HTML-escaped — AI output is treated as untrusted input.

---

### `POST /api/ai/suggest-tags/`

```json
{ "title": "Natural Lavender Soap", "description": "Cold-pressed..." }
```

**200**
```json
{
  "suggestion_id": 57,
  "status": "pending",
  "output": { "category": "Bath & Body", "tags": ["lavender", "handmade"], "confidence": 0.79 }
}
```

`category` is dropped unless it matches an existing `Category.name` exactly — the API never invents a category.

---

### `POST /api/ai/moderate/`

```json
{ "product_id": 41 }
```

**200**
```json
{
  "suggestion_id": 58,
  "status": "pending",
  "output": {
    "notes": [
      { "type": "missing_info", "message": "No weight or dimensions given." },
      { "type": "suspicious_claims", "message": "Claims to cure skin conditions." }
    ],
    "confidence": 0.72
  }
}
```

Note types: `missing_info` · `suspicious_claims` · `inappropriate_terms`. Advisory only — no product field changes.

---

### `POST /api/ai/suggestions/<id>/accept/`

```json
{ "product_id": 41 }
```

Explicit human action. Writes the suggested values onto the product and records the reviewer. The product **stays `draft`** — publishing remains a separate call (§7).

**The target is bound at accept time, not at suggest time.** `/suggest-description/` and `/suggest-tags/` carry no product id — a suggestion may legitimately precede the product it ends up on (DB_DESIGN R-05), which is exactly why `target_id` is a nullable soft reference. So `product_id` is **required in the accept body when the suggestion's `target_id` is null**, and is written onto `target_id` in the same transaction; when `target_id` is already set (e.g. a `/moderate/` suggestion) the body field is optional and must match it. `product_id` must name a product the caller owns (admin: any) ⇒ otherwise `404`.

What "writes the values" means depends on `suggestion_type`:

| `suggestion_type` | Accept writes |
|---|---|
| `description` | `output.title` → `Product.name`, `output.description` → `Product.description`. `short_description`, `highlights`, `suggested_tags` are **not** stored — no field holds them in MVP (no `Tag` entity, DB_DESIGN §2.1). |
| `tags` | `output.category` → `Product.category`, and only when it matches an existing `Category.name` exactly (AI-07). `output.tags` are **not** stored — same reason. |
| `moderation` | **Not acceptable.** Moderation output is advisory and maps to no product field ⇒ `400 validation_error`. Use `/reject/` to close it out. |

**200**
```json
{ "suggestion_id": 55, "review_status": "accepted", "product_id": 41, "product_status": "draft" }
```

**Errors:** `400 validation_error` (already reviewed, `suggestion_type = "moderation"`, `product_id` missing while `target_id` is null, or `product_id` conflicts with an already-bound `target_id`) · `404` (unknown or not-owned product).

### `POST /api/ai/suggestions/<id>/reject/`

**200** `{ "suggestion_id": 55, "review_status": "rejected" }` · **Errors:** `400` · `404`.

---

## 10. Health

### `GET /api/health/` — public

**200** `{ "status": "ok", "database": "ok" }` · **503** `{ "status": "error", "database": "unreachable" }`

---

## 11. Quick Reference

| Method | Path | Role |
|---|---|---|
| POST | `/api/auth/register/` | Guest |
| POST | `/api/auth/login/` | Guest |
| POST | `/api/auth/refresh/` | Guest |
| GET | `/api/auth/me/` | Auth |
| GET | `/api/products/` | Any |
| GET | `/api/products/<id>/` | Any |
| GET | `/api/categories/` | Any |
| GET | `/api/cart/` | Customer |
| POST | `/api/cart/items/` | Customer |
| PATCH · DELETE | `/api/cart/items/<id>/` | Customer |
| DELETE | `/api/cart/` | Customer |
| POST | `/api/checkout/` | Customer |
| GET | `/api/orders/` · `/api/orders/<id>/` | Customer |
| POST | `/api/orders/<id>/cancel/` | Customer |
| GET · POST | `/api/seller/products/` | Seller |
| GET · PATCH · DELETE | `/api/seller/products/<id>/` | Seller |
| POST | `/api/seller/products/<id>/publish/` | Seller |
| POST | `/api/seller/products/<id>/images/` | Seller |
| DELETE | `/api/seller/products/<id>/images/<image_id>/` | Seller |
| GET | `/api/seller/orders/` · `/api/seller/orders/<id>/` | Seller |
| POST | `/api/seller/orders/<id>/transition/` | Seller |
| GET | `/api/seller/dashboard/` | Seller |
| GET | `/api/admin/metrics/` | Admin |
| GET · PATCH | `/api/admin/products/<id>/` | Admin |
| GET | `/api/admin/orders/` | Admin |
| GET · PATCH | `/api/admin/users/<id>/` | Admin |
| GET | `/api/admin/ai-suggestions/` | Admin |
| POST | `/api/ai/suggest-description/` | Seller/Admin |
| POST | `/api/ai/suggest-tags/` | Seller/Admin |
| POST | `/api/ai/moderate/` | Seller/Admin |
| POST | `/api/ai/suggestions/<id>/accept/` · `/reject/` | Seller/Admin |
| GET | `/api/health/` | Any |

---

## 12. Traceability

| Section | SRS |
|---|---|
| §1 Conventions | §5, §5.8, FR-09, FR-12, NFR-07/08, SEC-03 |
| §2 Auth | FR-01..06, SEC-05/10 |
| §3 Catalog | FR-07..16, DR-04 |
| §4 Cart | FR-17..26, DR-07/08 |
| §5 Checkout & Orders | FR-27..38, FR-47/48, DR-09..13 |
| §6 State Machine | FR-42, FR-44..46, BR-01..03 |
| §7 Seller | FR-43, FR-49..55, BR-07/08 |
| §8 Admin | FR-56..59 |
| §9 AI | FR-61..69, AI-01..08 |
| §10 Health | NFR-06 |
