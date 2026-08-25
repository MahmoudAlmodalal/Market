# Souqi Backend — Task Tickets

Derived from `PLAN.md`. One ticket per phase, each broken into checkable subtasks.
Ship in order — the dependency notes are the ones `PLAN.md` calls non-negotiable.

Legend: **Needs** = must be merged first · **DoD** = done when · **Trace** = spec IDs discharged.

---

## Part A — Foundation

### TK-01 — Project skeleton, settings, compose
**Needs:** — · **Files:** `api/souqi/settings.py`, `urls.py`, `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env.example`
- [x] Django 5.2 + DRF + simplejwt + psycopg project laid out per `PLAN.md` §Stack
- [x] Env-only config: `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ORIGINS`, `AI_PROVIDER_KEY`, `LOW_STOCK_THRESHOLD=5`
- [x] `REST_FRAMEWORK`: default perm `IsAuthenticated`, simplejwt auth, custom exception handler hook, `StandardPagination` (20/`page_size`/max 100)
- [x] CORS + `CSRF_TRUSTED_ORIGINS` from env; `DEBUG=False` default
- [x] Compose `db` (postgres:16, named volume, healthcheck) + `api`
- **DoD:** `docker compose run --rm api python manage.py check` exits 0
- **Trace:** DEP-01/02, SEC-01/06/08, FR-12, NFR-07

### TK-02 — Error envelope, codes, health
**Needs:** TK-01 · **Files:** `common/errors.py`, `common/exceptions.py`, `common/views.py`
- [ ] One constant per API.md §1.4 code + `APIError(APIException)` base (`code`, `message`, `details`, `status_code`)
- [ ] Exception handler wraps **every** non-2xx into `{"error":{code,message,details}}` — incl. DRF `ValidationError`, 401, 403, 429, `Http404`
- [ ] `GET /api/health/` (`AllowAny`, `SELECT 1`) → 200 ok / 503 unreachable
- **DoD:** an unknown route returns the envelope, not DRF's default
- **Trace:** API.md §1.2–1.4/§10, NFR-06

### TK-03 — `accounts.User`
**Needs:** TK-01 · **Files:** `accounts/models.py` + migration
- [ ] `AbstractUser` subclass, `USERNAME_FIELD='email'`, no `username`, `name(120)`, `role`, `status`
- [ ] Email-keyed manager (`create_user`/`create_superuser`, superuser ⇒ `role='admin'`)
- [ ] DR-01 `UniqueConstraint(Lower('email'))` **plus** field-level `unique=True`
- [ ] `AUTH_USER_MODEL` set before any other model exists
- **DoD:** migration applies clean; `createsuperuser` works with email
- **Trace:** FR-06, DR-01
- ⚠️ Blocks every other model. Do not start TK-07+ before this merges.

### TK-04 — SellerProfile + registration
**Needs:** TK-03 · **Files:** `accounts/{models,serializers,views,urls}.py`
- [ ] `SellerProfile`: `user OneToOne(CASCADE)`, `business_name(120)`, `description`, `status`
- [ ] `POST /api/auth/register/` `AllowAny`, role ∈ `customer|seller` (admin rejected), password ≥8 + Django validators
- [ ] `role='seller'` ⇒ profile created in the same transaction, `business_name` defaults to `name`
- [ ] 201 `{user{id,name,email,role}, access, refresh}`; password write-only
- [ ] 400 `validation_error` on taken email (CI), weak password, bad role
- **Trace:** FR-01/04/05, SEC-05

### TK-05 — JWT login / refresh / me
**Needs:** TK-04 · **Files:** `accounts/views.py`, `urls.py`, settings
- [ ] Access 15m / refresh 7d
- [ ] `POST /auth/login/` returns the **register body shape** (wrap `TokenObtainPairSerializer`)
- [ ] `POST /auth/refresh/` → `{access}`; `GET /auth/me/`
- [ ] 401 `invalid_credentials`; 401 `account_suspended` checked before password result
- **Trace:** FR-02/03, AD-02

### TK-06 — Suspended guard + throttling
**Needs:** TK-05 · **Files:** `accounts/authentication.py`, settings
- [ ] `SuspendedAwareJWTAuthentication` raises `account_suspended` post-resolve; set as default auth class
- [ ] Throttles: user 100/min, anon 30/min, named scope `ai` 10/hour **keyed on `user_id`** (admins have no seller profile) — consumed by TK-36
- [ ] `/api/products/`, `/api/categories/`, `/api/health/` **exempt from `AnonRateThrottle`** — AD-05 sends all public traffic from one Next.js server IP, so 30/min/IP would cap the whole site
- **DoD:** T-24 — suspended user gets 401 on every authenticated endpoint
- **Trace:** SEC-10, FR-59, NFR-07/08 · **Tests:** T-24

---

## Part B — Catalog

### TK-07 — Category model + public list
**Needs:** TK-03 · **Files:** `catalog/{models,serializers,views,urls}.py`
- [ ] `name(80) unique`, `slug unique` (auto on first save, immutable after), `status ∈ active|hidden`
- [ ] `GET /api/categories/` `AllowAny`, active only, unpaginated `[{id,name,slug}]`
- **Trace:** SRS §4.3

### TK-08 — Product model
**Needs:** TK-04, TK-07 · **Files:** `catalog/models.py` + migration
- [ ] Fields per SRS §4.4 (`seller PROTECT db_index=False`, `category PROTECT null`, price `Decimal(10,2)`, `status` default `draft`, `moderation_note`, timestamps)
- [ ] DR-02 `price >= 0`, DR-03 `stock_quantity >= 0` as `CheckConstraint`s in this migration
- [ ] DR-04 index `(status, -created_at)`, IX-03 `(seller, status)`
- **Trace:** SRS §4.4, DR-02/03/04/05, IX-03

### TK-09 — ProductImage model
**Needs:** TK-08 · **Files:** `catalog/models.py` + migration
- [ ] `product FK(CASCADE, related_name='images')`, `image ImageField(upload_to='products/')`, `sort_order`
- [ ] DR-06 `UniqueConstraint(product, sort_order)`; `Meta.ordering = ['sort_order']`
- **Trace:** SRS §4.5, DR-06

### TK-10 — `stock_state` helper
**Needs:** TK-01 · **Files:** `catalog/services.py`
- [ ] `stock_state(stock_quantity) -> out_of_stock|low_stock|available`, threshold from settings
- [ ] Takes an int, not a model (cart/order call it on a locked row value)
- **DoD:** T-04 at 0 / 3 / 50
- **Trace:** FR-09 · **Tests:** T-04
- ⚠️ Must precede TK-11 / TK-18 / TK-31 — one implementation, four callers.

### TK-11 — Public catalog list
**Needs:** TK-08, TK-09, TK-10 · **Files:** `catalog/views.py`, `serializers.py`
- [ ] `GET /api/products/` `AllowAny`, paginated; queryset = published ∧ `seller__status='active'` — one join, not two (TK-32 mirrors `User.status` onto the profile on suspend)
- [ ] `select_related('seller','category')` + prefetch for `primary_image` (lowest `sort_order`)
- [ ] Item shape per API.md §3; `stock_quantity` never exposed
- **DoD:** query count constant across page sizes (no N+1)
- **Trace:** FR-07/08/13, FR-59, NFR-01/04

### TK-12 — Search, filter, ordering
**Needs:** TK-11 · **Files:** `catalog/filters.py`, `views.py`
- [ ] `?search=` over name+description (ILIKE), `?category=`, `?seller=` (profile id)
- [ ] `?ordering=` whitelist `price|-price|created_at|-created_at`, default `-created_at`
- [ ] `# ponytail: ILIKE scan; add pg_trgm GIN past ~10k products`
- **Trace:** FR-10/11

### TK-13 — Product detail
**Needs:** TK-11 · **Files:** `catalog/views.py`, `serializers.py`
- [ ] `GET /api/products/<id>/` visible if published, or to owning seller / admin at any status; else **404**
- [ ] Body: full fields + ordered `images[]` + `seller{id,business_name,description}` + `category`
- [ ] `available_quantity` key present **only** when `stock_quantity <= threshold`
- **Trace:** FR-14/15/16, SEC-02 · **Tests:** T-23

---

## Part C — Cart

### TK-14 — Cart / CartItem models
**Needs:** TK-08 · **Files:** `orders/models.py` + migration
- [ ] `Cart.customer OneToOne(User, CASCADE)`; `CartItem(cart, product, quantity, unit_price_at_add Decimal(10,2), created_at)`
- [ ] `unit_price_at_add` ships **with the model** — FR-25/26 cannot detect price drift without it; never read for money (N-09)
- [ ] DR-07 `unique(cart, product)`, DR-08 `quantity >= 1`
- **Trace:** SRS §4.6, DR-07/08, OD02

### TK-15 — Role permissions + cart bootstrap
**Needs:** TK-14 · **Files:** `common/permissions.py`, `orders/views.py`
- [ ] `IsCustomer` / `IsSeller` / `IsAdmin` → **403** on role mismatch (403 role, 404 ownership)
- [ ] `get_or_create` cart on first write; `GET /api/cart/` with no cart ⇒ empty cart body, not 404
- **Trace:** SEC-01, FR-17, OD01/OD02 · **Tests:** T-21

### TK-16 — Add / update / remove lines
**Needs:** TK-15 · **Files:** `orders/views.py`, `serializers.py`
- [ ] `POST /api/cart/items/` replace semantics via `update_or_create` (quantity is set, not summed)
- [ ] `PATCH /api/cart/items/<id>/`, `DELETE /api/cart/items/<id>/` → 204, `DELETE /api/cart/` → 204 (keeps cart row)
- [ ] Every item lookup scoped `cart__customer=request.user`; foreign item ⇒ 404
- [ ] POST (201) and PATCH (200) both return the **full cart body**
- [ ] Errors: `invalid_quantity` · `insufficient_stock` · `product_not_purchasable`
- [ ] `details.available` **only** when `stock_quantity <= threshold` — unclamped it is a stock oracle (`quantity: 99999` reads exact inventory FR-16 hides). Same clamp in TK-18 and TK-22.
- **Trace:** FR-18..21/23, SEC-04 · **Tests:** T-05, T-06, T-10

### TK-17 — Single-seller cart
**Needs:** TK-16 · **Files:** `orders/services.py`, `views.py`
- [ ] Foreign-seller add ⇒ **409 `multi_seller_cart`** + `details.current_seller`; no auto-clear
- [ ] Cart seller derived from any existing line
- **Trace:** FR-22, OD04 · **Tests:** T-07

### TK-18 — Revalidation + `GET /api/cart/`
**Needs:** TK-17, TK-10 · **Files:** `orders/services.py`, `serializers.py`
- [ ] Write `CartItem.unit_price_at_add` (column from TK-14) on every add/update; compare against current `Product.price` for drift
- [ ] `revalidate(cart) -> (lines, issues_by_line, has_blocking_issues)` in order: exists → published → quantity ≤ stock → price drift
- [ ] Issue codes exactly: `product_unavailable`, `insufficient_stock`, `price_changed`
- [ ] Response per API.md §4; `unit_price` = **current** product price (OD05), `subtotal` server-computed
- **Trace:** FR-24/25/26, OD05, EC03/EC07 · **Tests:** T-11, T-14
- ⚠️ Must precede TK-22 — checkout re-runs *this* function, never a copy.

---

## Part D — Orders & Checkout

### TK-19 — Order models
**Needs:** TK-14 · **Files:** `orders/models.py` + migration
- [ ] `Order`, `OrderItem` (snapshots), `OrderStatusHistory` per SRS §4.7–4.9
- [ ] `OrderNumberCounter(year PK, last_seq default 1000)` — TK-20's lock target, same migration
- [ ] DR-09 `unique(customer, idempotency_key)` · DR-10 totals ≥ 0 · DR-11 qty ≥ 1 · DR-12 `line_total = unit_price_snapshot * quantity` · DR-13 `PROTECT` on `OrderItem.product`
- [ ] IX-01 `(customer,-created_at)`, IX-02 `(seller,status)`, IX-04 `(order,created_at)`; `db_index=False` on covered FKs
- **DoD:** a hand-written DR-12 violation from `manage.py shell` is rejected by Postgres
- **Trace:** DR-09..13, IX-01/02/04, N-01..N-08

### TK-20 — `order_number` generator
**Needs:** TK-19 · **Files:** `orders/services.py`
- [ ] `SQ-{YYYY}-{seq}` from 1001/year via `orders.OrderNumberCounter(year PK, last_seq default 1000)` — **`SELECT ... FOR UPDATE` the row at allocation**; `unique=True` backstops. Model ships in TK-19's migration.
- [ ] **Not `MAX(seq)+1`** — the checkout's only locks are on `Product` rows, so two checkouts on *different* products both read the same MAX and the loser hits the unique constraint as an uncaught 500 (TK-22 catches `IntegrityError` for DR-09 only)
- [ ] `# ponytail: one counter row locked per checkout; real Postgres sequence if that row goes hot`
- **Trace:** SRS §4.7

### TK-21 — State machine
**Needs:** TK-19 · **Files:** `orders/state.py`
- [ ] One `ALLOWED_TRANSITIONS = {(from,to): {roles}}` covering API.md §6 incl. `preparing→cancelled`, `ready→cancelled` (seller/admin)
- [ ] `assert_transition(from,to,role)` raises `APIError(INVALID_TRANSITION, details={'allowed':[...]})`; `allowed_targets()` feeds it
- [ ] `completed` / `cancelled` terminal (BR-03)
- **Trace:** BR-01/03, FR-44/45 · **Tests:** T-02, T-03
- ⚠️ Must precede TK-22 / TK-25 / TK-30.

### TK-22 — Checkout transaction
**Needs:** TK-18, TK-20, TK-21 · **Files:** `orders/views.py`, `services.py`
- [ ] Whole flow in one `transaction.atomic()`
- [ ] 1. `Idempotency-Key` present + valid uuid4, else `400 missing_idempotency_key`
- [ ] 2. Existing `(customer, key)` order ⇒ **200**, zero side effects
- [ ] 3. Empty cart ⇒ `400 empty_cart`; missing contact/delivery ⇒ `400 validation_error`
- [ ] 4. `select_for_update().filter(id__in=...).order_by('id')` — ordered, deadlock-free (BR-04)
- [ ] 5. `revalidate()` against locked rows ⇒ `409 cart_has_issues`; an ack is `{code:"price_changed", product_id, new_price}` and clears the issue **only when `new_price` matches the locked row** — a bare code would clear a second, unseen price move (FR-26)
- [ ] 6. Shortfall under lock ⇒ `409 insufficient_stock` + `product_id`; `available` only under the TK-16 clamp
- [ ] 7. Totals from locked `Product.price` only — no price/total input fields on the serializer (SEC-03)
- [ ] 8. Create order + `bulk_create` snapshots + `F()` stock deduct + history `None→pending` + clear cart lines
- [ ] `IntegrityError` on DR-09 ⇒ re-read and return the original with 200 (BR-06)
- **Trace:** FR-27..38, BR-04/05/06, SEC-03, OD06/09/10 · **Tests:** T-08/09/12/13/15/20/22

### TK-23 — Customer order read
**Needs:** TK-22 · **Files:** `orders/views.py`, `serializers.py`
- [ ] `GET /api/orders/` own orders, newest first, `?status=`, list shape per API.md §5
- [ ] `GET /api/orders/<id>/` detail + `timeline[]` from history; another customer's order ⇒ **404**
- **Trace:** FR-47/48, SEC-02 · **Tests:** T-19

### TK-24 — Stock restoration service
**Needs:** TK-19 · **Files:** `orders/services.py`
- [ ] `restore_stock(order)` — `select_for_update()` re-read, no-op if `stock_restored`, else `F()+qty` and set flag
- [ ] Runs inside the caller's transaction; idempotent by construction (N-08)
- **Trace:** FR-42, BR-02 · **Tests:** T-16, T-17
- ⚠️ Must precede TK-25 / TK-30 — one implementation, two callers.

### TK-25 — Customer cancel
**Needs:** TK-21, TK-24 · **Files:** `orders/views.py`
- [ ] `POST /api/orders/<id>/cancel/` from `pending`/`confirmed` only via `assert_transition(role='customer')`
- [ ] Calls `restore_stock`, writes history, returns `200 {order_number, status:"cancelled"}`
- [ ] Check `status == 'cancelled'` **before** `assert_transition` ⇒ `400 already_cancelled`; otherwise that code is unreachable (`(cancelled, cancelled)` isn't in the dict, so it would answer `invalid_transition`)
- [ ] Errors: `invalid_transition` · `already_cancelled` · 404
- **Trace:** FR-42/45 · **Tests:** T-16, T-17

---

## Part E — Seller

### TK-26 — Seller product list / create
**Needs:** TK-13, TK-15 · **Files:** `catalog/views.py`, `serializers.py`, `urls.py`
- [ ] `IsSeller`; `get_queryset()` filters by `request.user.sellerprofile` — ownership as a **fetch condition** (BR-07/08)
- [ ] **Sellers only.** `request.user.sellerprofile` raises for an admin (no profile, FR-04) and `POST` would have no seller to assign — admin uses `/api/admin/products/<id>/` (TK-32)
- [ ] `GET` `?status=`, `?search=`, paginated; item shape includes `stock_quantity`, `stock_state`, `image_count`
- [ ] `POST` always creates `status='draft'` regardless of body
- [ ] Errors: price < 0, stock < 0, description > 5000, unknown category
- **Trace:** FR-49/50, BR-07/08, SEC-04 · **Tests:** T-18, T-21

### TK-27 — Seller product detail / edit / soft delete
**Needs:** TK-26 · **Files:** same viewset
- [ ] `GET <id>/` incl. `moderation_note`; `PATCH` limited to `name, description, price, stock_quantity, category_id`
- [ ] `status`, `seller`, `moderation_note` not editable here
- [ ] `DELETE` ⇒ `status='archived'`, 204, row never removed
- [ ] Not-owned ⇒ 404 on every verb
- **Trace:** FR-43/50/51, N-01/N-02

### TK-28 — Publish
**Needs:** TK-27, TK-29 · **Files:** same viewset
- [ ] `POST /api/seller/products/<id>/publish/` → `200 {id, status:"published"}`
- [ ] 400 when no images, or status is `rejected`/`archived`; `draft` → published, already-published idempotent
- **Trace:** FR-49, OD07, AI-08

### TK-29 — Image upload / delete
**Needs:** TK-26, TK-09 · **Files:** `catalog/views.py`, `serializers.py`
- [ ] `POST .../images/` multipart `image` + optional `sort_order`
- [ ] Limits: ≤5 per product · ≤2 MB · **MIME sniffed from the file header**, not the extension (SEC-07), jpeg/png/webp only
- [ ] Media under `MEDIA_ROOT`, outside any executable path
- [ ] `DELETE .../images/<image_id>/` → 204; 400 on too large / wrong type / limit / taken `sort_order`
- **Trace:** FR-55, SEC-07, DR-06

### TK-30 — Seller orders + transition
**Needs:** TK-21, TK-24 · **Files:** `orders/views.py`
- [ ] `GET /api/seller/orders/` scoped to own profile (IX-02), `?status=`, paginated
- [ ] Exposes `contact_name` (+ phone/address on detail) — **never** customer email, id, or account data
- [ ] `POST .../<id>/transition/` `{to_status}` via `orders/state.py`; `cancelled` ⇒ `restore_stock` same transaction
- [ ] Every success writes a history row with `changed_by`
- **Trace:** FR-46/52/53, BR-01/02 · **Tests:** T-02, T-03, T-18

### TK-31 — Seller dashboard
**Needs:** TK-30, TK-10 · **Files:** `orders/views.py`
- [ ] `GET /api/seller/dashboard/` → counts + `orders_by_status` with all six keys present at zero
- [ ] Product counters reuse the `stock_state` threshold; order counters = one `values('status').annotate(Count)`
- **Trace:** FR-54

---

## Part F — Admin

### TK-32 — Admin metrics, products, orders, users
**Needs:** TK-30 · **Files:** `accounts/views.py`, `catalog/views.py`, `orders/views.py`, `urls.py`
- [ ] `IsAdmin` everywhere; `GET /api/admin/metrics/` (`total_sales` excludes cancelled) + `# ponytail: live COUNT/SUM; materialized view past ~100k orders`
- [ ] `GET/PATCH /api/admin/products/<id>/` — `moderation_note` **required** when setting `rejected`
- [ ] `GET /api/admin/orders/` with `?status=`, `?seller=`, `?date_from=`, `?date_to=`
- [ ] `GET/PATCH /api/admin/users/<id>/` — suspend flips the flag only; the three effects already exist
- [ ] When `role='seller'`, mirror `status` onto `SellerProfile.status` in the same transaction — nothing else writes that field, and TK-11's catalog filter reads it
- **Trace:** FR-56..59

### TK-33 — Django Admin registration
**Needs:** TK-32 · **Files:** `api/*/admin.py`
- [ ] Register all models read-mostly as a backup interface; not a substitute for FR-56..59
- **Trace:** FR-60

---

## Part G — AI

### TK-34 — Provider adapter
**Needs:** TK-01 · **Files:** `ai/provider.py`
- [ ] `AIProvider` protocol, one real impl (`AI_PROVIDER_KEY`), one deterministic `FakeProvider`, selected by settings
- [ ] 10s timeout; any error/timeout ⇒ `APIError(AI_UNAVAILABLE, 503)` with **zero side effects**
- **Trace:** AD-07, OD08, FR-69, NFR-09 · **Tests:** T-28
- ⚠️ Must precede TK-35 / TK-36.

### TK-35 — AIContentSuggestion + validation
**Needs:** TK-34 · **Files:** `ai/models.py`, `ai/validation.py` + migration
- [ ] Model per SRS §4.10, `target_id` soft ref (no FK, R-05), DR-14 `confidence BETWEEN 0 AND 1`
- [ ] `validation.py` implements AI-01..06 field bounds against the §7.1 schema
- [ ] Any failure **or** `confidence < 0.5` ⇒ stored `rejected`, response `200 {..., status:"needs_regeneration", reason:"low_confidence"}` with **no `output`**
- [ ] All text HTML-escaped before storage *and* before return (AI-06, SEC-09)
- **Trace:** FR-64/65, AI-01..06, DR-14 · **Tests:** T-25, T-26

### TK-36 — AI endpoints
**Needs:** TK-35 · **Files:** `ai/{views,serializers,urls}.py`
- [ ] `POST /ai/suggest-description/`, `/ai/suggest-tags/`, `/ai/moderate/` (advisory only, changes no product field)
- [ ] Seller/Admin only ⇒ 403 otherwise; throttle scope `ai` 10/hour **per `user_id`** (TK-06) ⇒ `429 rate_limited`
- [ ] AI-07: `category` dropped unless it exactly matches an existing `Category.name`
- [ ] Every response persisted `review_status='pending'`, never auto-applied
- **Trace:** FR-61..63/68, AI-07, NFR-08

### TK-37 — Accept / reject + admin listing
**Needs:** TK-36 · **Files:** `ai/views.py`, admin viewset
- [ ] `POST /ai/suggestions/<id>/accept/` writes values onto the product, sets `accepted` + `reviewed_by`; product **stays `draft`** (AI-08)
- [ ] Accept is per `suggestion_type`: `description` ⇒ `title→name`, `description→description`; `tags` ⇒ `category→Product.category` on exact `Category.name` match only; `moderation` ⇒ `400` (advisory, no field). `short_description`, `highlights`, `suggested_tags`, `tags` are dropped — no `Tag` entity in MVP
- [ ] `POST /ai/suggestions/<id>/reject/`; 400 when already reviewed, `moderation` accept, or no product target; 404 otherwise
- [ ] `GET /api/admin/ai-suggestions/` with `?review_status=`, `?suggestion_type=`
- [ ] **FR-67 audit:** no AI import anywhere in checkout, stock, permission or transition paths
- **Trace:** FR-66/67, AI-08 · **Tests:** T-27

---

## Part H — Delivery

### TK-38 — `seed_demo`
**Needs:** TK-32 · **Files:** `catalog/management/commands/seed_demo.py`
- [ ] Idempotent: 4 categories, 3 sellers, 12 published products (one at exactly 5, one at 0), 2 customers, 1 admin
- [ ] **At least one image per product** — TK-28 refuses to publish without one, so an image-less seed yields an empty catalog. Ship small placeholder files with the command.
- [ ] Prints known passwords at the end
- **Trace:** FR-79, DEP-03

### TK-39 — Test matrix T-01..T-30
**Needs:** TK-37 · **Files:** `api/tests/*`, `pytest.ini`
- [ ] Runs on **real PostgreSQL** — SQLite silently no-ops `select_for_update` and check constraints
- [ ] T-30: two threads, stock 1, real connections — exactly one 201, one 409, final stock 0, never −1
- [ ] T-13: inject failure after validation, before commit — no order row, stock unchanged
- [ ] T-09a (cart add ⇒ `400`) **and** T-09b (checkout under lock ⇒ `409`) — same EC01 shortfall at two layers, both required
- [ ] T-09..14, T-18..24, T-30 never skipped or xfailed
- **Trace:** SRS §10, FR-80

### TK-40 — Structured logging
**Needs:** TK-22 · **Files:** `common/logging.py`, settings
- [ ] JSON formatter; one call each at checkout failure, unauthorized access, stock validation failure, invalid transition, AI failure — `event, user_id, resource_id, reason`
- [ ] Passwords and tokens never logged
- **Trace:** NFR-05, SEC-05

### TK-41 — Compose, first boot, smoke
**Needs:** TK-38, TK-39 · **Files:** `docker-compose.yml`, `Dockerfile`, entrypoint
- [ ] `db` + `api` (gunicorn), `web` slot reserved; entrypoint `migrate` then `seed_demo` on first boot
- [ ] WhiteNoise for static/media + `# ponytail: WhiteNoise; move to S3/CDN when media volume grows`
- [ ] T-29 E2E automates SRS §11's nine steps against the running API
- [ ] DEP-05 smoke: health ✓ login ✓ catalog ✓ checkout ✓ transition ✓
- **Trace:** FR-81, DEP-01/03/04/05, T-29

---

## Hard ordering (from PLAN.md)

TK-03 → everything · TK-10 → TK-11/18/31 · TK-21 → TK-22/25/30 · TK-18 → TK-22 · TK-24 → TK-25/30 · TK-34 → TK-35/36.
Constraints ship in the same migration as their model — never retrofitted.

**Two tickets decide the design:** TK-22 (via T-30 concurrency and T-12 idempotency). Red there ⇒ checkout is wrong regardless of the rest.
