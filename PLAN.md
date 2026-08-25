# Souqi MVP — Backend Implementation Plan

**Scope:** Django 5 + DRF backend only. Frontend (SRS FR-70..78) is out of scope for this plan.
**Sources of truth:** `SRS.md` (requirements) · `API.md` (endpoint contracts) · `DB_DESIGN.md` (schema, constraints, indexes).
**Rule:** where the three documents overlap, `API.md` wins on request/response shape, `DB_DESIGN.md` wins on schema, `SRS.md` wins on behaviour.

---

## Context

The repo holds only specifications — no code. All three documents are approved and closed (SRS Appendix A settles OD01..OD10; DB_DESIGN is documentation of a fixed schema, not a proposal). What is missing is an execution order.

This plan splits the backend into **38 small phases**. Each phase is one sitting, touches few files, ends in something runnable, and names the exact `FR-`/`DR-`/`SEC-`/`T-` IDs it discharges. Order is dependency-driven: constraints ship with their model, shared helpers ship before their callers, and nothing is retrofitted.

**Per-phase docs:** when a phase starts, write `docs/plans/phase-NN-<slug>.md` — self-contained (goal, files, contract excerpt from `API.md`, DoD, trace IDs) so it can be executed without re-reading all three specs.

---

## Stack & Layout

Django 5.2 · DRF 3.15 · `djangorestframework-simplejwt` · PostgreSQL 16 · gunicorn · WhiteNoise · pytest-django.
Host already has Python 3.10.12, Django 5.2.15, Docker Compose v2.38.2. The `api` image pins its own Python — host version does not bind.

```
api/
  manage.py  Dockerfile  requirements.txt  pytest.ini
  souqi/            settings.py  urls.py  wsgi.py
  common/           errors.py  exceptions.py  pagination.py  permissions.py  logging.py  views.py
  accounts/         models.py  serializers.py  views.py  authentication.py  urls.py
  catalog/          models.py  services.py  serializers.py  views.py  filters.py  urls.py
  orders/           models.py  state.py  services.py  serializers.py  views.py  urls.py
  ai/               models.py  provider.py  validation.py  serializers.py  views.py  urls.py
  tests/            test_unit.py  test_cart.py  test_checkout.py  test_security.py  test_ai.py  test_concurrency.py  test_e2e.py
docker-compose.yml  .env.example  docs/plans/
```

**App boundaries:** `Cart`/`CartItem` live in `orders` (SRS §4.6 names them `orders.Cart`), not a separate app. `catalog` owns products/categories/images. `common` holds anything with more than one caller.

---

# Part A — Foundation (P01–P06)

### P01 — Project skeleton, settings, compose
**Files:** `api/souqi/settings.py`, `api/souqi/urls.py`, `api/requirements.txt`, `api/Dockerfile`, `docker-compose.yml`, `.env.example`

- Env-driven config only: `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ORIGINS`, `AI_PROVIDER_KEY`, `LOW_STOCK_THRESHOLD` (default 5).
- `REST_FRAMEWORK`: `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` (public views opt out explicitly — SEC-01), `DEFAULT_AUTHENTICATION_CLASSES` = simplejwt, custom `EXCEPTION_HANDLER` (P02), `DEFAULT_PAGINATION_CLASS` = `common.pagination.StandardPagination` (`page_size=20`, `page_size_query_param='page_size'`, `max_page_size=100`).
- CORS limited to `CORS_ORIGINS`; `CSRF_TRUSTED_ORIGINS` set. `DEBUG=False` unless env says otherwise.
- Compose services `db` (postgres:16 + named volume + healthcheck) and `api`; `web` added in P38.
- **DoD:** `docker compose run --rm api python manage.py check` exits 0.
- **Trace:** DEP-01/02, SEC-01/06/08, FR-12, NFR-07 (config only).

### P02 — Error envelope, codes, health
**Files:** `api/common/errors.py`, `api/common/exceptions.py`, `api/common/views.py`

- `errors.py`: one constant per code in API.md §1.4 — `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `ACCOUNT_SUSPENDED`, `INVALID_QUANTITY`, `INSUFFICIENT_STOCK`, `PRODUCT_NOT_PURCHASABLE`, `MULTI_SELLER_CART`, `EMPTY_CART`, `CART_HAS_ISSUES`, `MISSING_IDEMPOTENCY_KEY`, `INVALID_TRANSITION`, `ALREADY_CANCELLED`, `AI_UNAVAILABLE`, `RATE_LIMITED` — plus one `APIError(APIException)` base carrying `code`, `message`, `details`, `status_code`.
- `exceptions.py`: DRF `exception_handler` wrapper turning **every** non-2xx into `{"error": {"code", "message", "details"}}` — including DRF's own `ValidationError` (→ `validation_error`, field errors into `details`), `NotAuthenticated`/`AuthenticationFailed` (401), `PermissionDenied` (403), `Throttled` (429 `rate_limited`), `Http404` (404).
- `GET /api/health/` — `AllowAny`, runs `SELECT 1`; `200 {"status":"ok","database":"ok"}` or `503 {"status":"error","database":"unreachable"}`.
- **DoD:** hitting any 404 route returns the envelope, not DRF's default. Health returns 200 with db up.
- **Trace:** API.md §1.2/§1.3/§1.4/§10, NFR-06.

### P03 — `accounts.User`
**Files:** `api/accounts/models.py`, migration

- `AbstractUser` subclass, `USERNAME_FIELD='email'`, `REQUIRED_FIELDS=['name']`, no `username` field. `name CharField(120)`, `role` ∈ `customer|seller|admin`, `status` ∈ `active|suspended` default `active`.
- Manager with `create_user` / `create_superuser` keyed on email (superuser gets `role='admin'`).
- `UniqueConstraint(Lower('email'), name='uniq_email_ci')` — DR-01. Keep `unique=True` on the field too; the two are complementary (exact + case-folded).
- Set `AUTH_USER_MODEL = 'accounts.User'` **before any other model exists**.
- **DoD:** migration applies clean; `createsuperuser` works with email.
- **Trace:** FR-06, DR-01, SRS §4.1.

### P04 — `SellerProfile` + registration
**Files:** `api/accounts/models.py`, `serializers.py`, `views.py`, `urls.py`

- `SellerProfile`: `user OneToOne(CASCADE)`, `business_name CharField(120)`, `description TextField(blank)`, `status` ∈ `active|suspended`.
- `POST /api/auth/register/` — `AllowAny`. Body `{email, password, name, role}`, `role` ∈ `customer|seller` only (`admin` rejected). Password ≥ 8 chars + Django validators. `role='seller'` ⇒ create `SellerProfile(status='active')` inside the same transaction, `business_name` defaults to `name`.
- **201** `{user:{id,name,email,role}, access, refresh}`. Password write-only, never echoed.
- **Errors:** `400 validation_error` — email taken (case-insensitive), weak password, bad role.
- **Trace:** FR-01/04/05, SEC-05, API.md §2.

### P05 — JWT login / refresh / me
**Files:** `api/accounts/views.py`, `urls.py`, settings block

- simplejwt: access 15m, refresh 7d. `POST /auth/login/` returns the **same body shape as register** (`user` + `access` + `refresh`), not simplejwt's default — wrap `TokenObtainPairSerializer`.
- `POST /auth/refresh/` → `{access}`. `GET /auth/me/` → `{id,name,email,role}`.
- **Errors:** `401 invalid_credentials`; `401 account_suspended` when `status='suspended'` (distinct code, checked before password result is returned).
- **Trace:** FR-02/03, AD-02, API.md §2.

### P06 — Suspended guard + throttling
**Files:** `api/accounts/authentication.py`, settings

- `SuspendedAwareJWTAuthentication(JWTAuthentication)`: after resolving the user, raise `AuthenticationFailed(code=account_suspended)` when `user.status == 'suspended'` — so an already-issued token dies on the next request, no logout needed (SEC-10). Set as the default auth class.
- Throttles: `UserRateThrottle` 100/min, `AnonRateThrottle` 30/min, plus a named scope `ai` at `10/hour` reserved for P33.
- **DoD:** T-24 — a suspended user gets 401 on every authenticated endpoint.
- **Trace:** SEC-10, FR-59 (login/token half), NFR-07/08, API.md §1.6. Tests: T-24.

---

# Part B — Catalog (P07–P13)

### P07 — `Category` model + public list
**Files:** `api/catalog/models.py`, `serializers.py`, `views.py`, `urls.py`

- `name CharField(80) unique`, `slug SlugField unique` (auto-slugified on first save, immutable after — it is a permalink per DB_DESIGN §2.1), `status` ∈ `active|hidden`.
- `GET /api/categories/` — `AllowAny`, `status='active'` only, returns `[{id,name,slug}]`, unpaginated (bounded set).
- **Trace:** SRS §4.3, API.md §3.

### P08 — `Product` model
**Files:** `api/catalog/models.py`, migration

- Fields per SRS §4.4: `seller FK(SellerProfile, PROTECT, related_name='products', db_index=False)`, `category FK(Category, PROTECT, null=True)`, `name CharField(160)`, `description TextField` (max 5000 enforced in serializer), `price Decimal(10,2)`, `stock_quantity PositiveIntegerField default 0`, `status` ∈ `draft|published|rejected|archived` default `draft`, `moderation_note TextField(blank)`, `created_at`/`updated_at`.
- Constraints: **DR-02** `price >= 0`, **DR-03** `stock_quantity >= 0`.
- Indexes: **DR-04** `(status, -created_at)`, **IX-03** `(seller, status)` — `db_index=False` on the `seller` FK because IX-03's prefix already covers it (DB_DESIGN §3.3).
- **Trace:** SRS §4.4, DR-02/03/04/05, IX-03.

### P09 — `ProductImage` model
**Files:** `api/catalog/models.py`, migration

- `product FK(CASCADE, related_name='images')`, `image ImageField(upload_to='products/')`, `sort_order PositiveSmallIntegerField default 0`.
- **DR-06** `UniqueConstraint(product, sort_order)` — doubles as the `ORDER BY sort_order` index (FR-14).
- `Meta.ordering = ['sort_order']`.
- **Trace:** SRS §4.5, DR-06.

### P10 — `stock_state` helper
**Files:** `api/catalog/services.py`

- One function: `stock_state(stock_quantity) -> 'out_of_stock' | 'low_stock' | 'available'`, threshold from `settings.LOW_STOCK_THRESHOLD`. Takes the integer, not the model, so cart/order paths can call it on a locked row value.
- The **only** place this logic exists — four callers follow (catalog list, product detail, cart lines, seller dashboard).
- **DoD:** T-04 at 0 / 3 / 50.
- **Trace:** FR-09, API.md §1.7. Tests: T-04.

### P11 — Public catalog list
**Files:** `api/catalog/views.py`, `serializers.py`

- `GET /api/products/` — `AllowAny`, paginated. Base queryset: `status='published'` **and** seller not suspended **and** seller's user not suspended (FR-59's second half), `select_related('seller','category')`, `prefetch_related` images for `primary_image` (lowest `sort_order`).
- Item shape (API.md §3): `{id, name, price, primary_image, stock_state, seller_name, category:{id,name}}`. `stock_quantity` is never exposed publicly.
- **DoD:** no N+1 — assert query count is constant across page sizes.
- **Trace:** FR-07/08/13, FR-59, NFR-01/04, DR-04.

### P12 — Search, filter, ordering
**Files:** `api/catalog/filters.py`, `views.py`

- `?search=` → `Q(name__icontains) | Q(description__icontains)` (ILIKE on Postgres). `?category=<id>`, `?seller=<id>` (seller *profile* id). `?ordering=` whitelist `price|-price|created_at|-created_at`, default `-created_at`.
- `# ponytail: ILIKE scan; add pg_trgm GIN index past ~10k products`
- **Trace:** FR-10/11, API.md §3.

### P13 — Product detail
**Files:** `api/catalog/views.py`, `serializers.py`

- `GET /api/products/<id>/` — `AllowAny`. Visible when `published`; also visible to its owning seller and to admin at any status. Anything else ⇒ **404** (never 403 — no existence leak).
- Body per API.md §3: full fields + `images[]` ordered by `sort_order` + `seller:{id,business_name,description}` + `category`.
- `available_quantity` present **only** when `stock_quantity <= LOW_STOCK_THRESHOLD`; otherwise the key is omitted entirely.
- **Trace:** FR-14/15/16, SEC-02. Tests: T-23.

---

# Part C — Cart (P14–P18)

### P14 — `Cart` / `CartItem` models
**Files:** `api/orders/models.py`, migration

- `Cart.customer OneToOne(User, CASCADE)`. `CartItem.cart FK(CASCADE, related_name='items')`, `product FK(Product, CASCADE)`, `quantity PositiveIntegerField`, `created_at` (needed for stable line ordering).
- **DR-07** `UniqueConstraint(cart, product)` — makes replace-semantics structural. **DR-08** `quantity >= 1`.
- **Trace:** SRS §4.6, DR-07/08, OD02.

### P15 — `IsCustomer` permission + cart bootstrap
**Files:** `api/common/permissions.py`, `api/orders/views.py`

- `IsCustomer` / `IsSeller` / `IsAdmin` permission classes returning **403** on role mismatch (403 is for role, 404 for ownership — API.md §1.3). Seller and admin do **not** buy in MVP (SRS §2.2).
- `get_or_create` cart on first write; `GET /api/cart/` on a customer with no cart returns an empty cart body, not 404.
- **Trace:** SEC-01, FR-17, OD01/OD02. Tests: T-21.

### P16 — Add / update / remove lines
**Files:** `api/orders/views.py`, `serializers.py`

- `POST /api/cart/items/` `{product_id, quantity}` → **replace** semantics via `update_or_create` (FR-18: quantity is *set*, not summed). `PATCH /api/cart/items/<id>/` `{quantity}`. `DELETE /api/cart/items/<id>/` → 204. `DELETE /api/cart/` → 204 (clears lines, keeps the cart row).
- Item lookup is always scoped `cart__customer=request.user` — foreign item ⇒ 404.
- Both POST and PATCH return the **full cart body** (same shape as `GET /api/cart/`), POST with 201.
- **Errors:** `400 invalid_quantity` (< 1) · `400 insufficient_stock` + `details.available` · `400 product_not_purchasable` (status ≠ published).
- **Trace:** FR-18..21, FR-23, SEC-04. Tests: T-05, T-06, T-10 (cart half).

### P17 — Single-seller cart
**Files:** `api/orders/services.py`, `views.py`

- Adding a product whose seller ≠ the cart's current seller ⇒ **409 `multi_seller_cart`** with `details.current_seller`. Resolution path is `DELETE /api/cart/` then re-add — no auto-clear.
- Cart's seller = seller of any existing line (invariant, since all lines share one).
- **Trace:** FR-22, OD04, API.md §4. Tests: T-07.

### P18 — Revalidation + `GET /api/cart/`
**Files:** `api/orders/services.py`, `serializers.py`

- `revalidate(cart) -> (lines, issues_by_line, has_blocking_issues)`. Per line, in this order: product still exists → `status == published` (else `product_unavailable`) → `quantity <= stock_quantity` (else `insufficient_stock` + `available`) → price drift vs. the price when the line was last written (else `price_changed` + `old_price`/`new_price`).
- Issue codes are exactly API.md §4's three: `product_unavailable`, `insufficient_stock`, `price_changed`.
- Price drift needs a stored reference: add `unit_price_at_add Decimal(10,2)` to `CartItem` (migration in this phase), written on every add/update. It exists solely to detect drift — it is never a source of truth for money.
- Response per API.md §4: `{id, seller, items[{id,product_id,name,unit_price,quantity,line_total,stock_state,issues[]}], subtotal, has_blocking_issues}`. `unit_price` is always the **current** product price (OD05); `subtotal` is server-computed.
- **Trace:** FR-24/25/26, OD05, EC03, EC07. Tests: T-11, T-14 (cart half).

---

# Part D — Orders & Checkout (P19–P25)

### P19 — Order models
**Files:** `api/orders/models.py`, migration

- `Order`: `order_number CharField(20) unique`, `customer FK(User, PROTECT, db_index=False)`, `seller FK(SellerProfile, PROTECT, db_index=False)`, `status` default `pending`, `subtotal`/`total Decimal(12,2)`, `contact_name CharField`, `contact_phone CharField`, `delivery_address TextField`, `idempotency_key UUIDField`, `stock_restored Boolean default False`, `created_at`.
- `OrderItem`: `order FK(CASCADE, related_name='items')`, `product FK(Product, PROTECT)`, `product_name_snapshot CharField(160)`, `unit_price_snapshot Decimal(10,2)`, `quantity`, `line_total Decimal(12,2)`.
- `OrderStatusHistory`: `order FK(CASCADE, db_index=False)`, `from_status CharField(16, null=True)`, `to_status CharField(16)`, `changed_by FK(User, SET_NULL, null=True)`, `created_at`.
- Constraints: **DR-09** `unique(customer, idempotency_key)` · **DR-10** `subtotal >= 0 AND total >= 0` · **DR-11** `quantity >= 1` · **DR-12** `line_total = unit_price_snapshot * quantity` · **DR-13** `PROTECT` on `OrderItem.product`.
- Indexes: **IX-01** `(customer, -created_at)` · **IX-02** `(seller, status)` · **IX-04** `(order, created_at)` — with `db_index=False` on the three FKs those prefixes cover.
- **DoD:** try to violate DR-12 from `manage.py shell` — Postgres must reject it.
- **Trace:** SRS §4.7–4.9, DR-09..13, IX-01/02/04, N-01..N-08.

### P20 — `order_number` generator
**Files:** `api/orders/services.py`

- Format `SQ-{YYYY}-{seq}` starting at 1001 per year. Implementation: a Postgres sequence per year is overkill — take `MAX(seq)` for the current year under the checkout transaction's existing lock, or a dedicated `SELECT ... FOR UPDATE` counter row. Uniqueness is backstopped by `unique=True` on the column.
- `# ponytail: max+1 under the checkout lock; swap to a real sequence if orders ever go multi-writer`
- **Trace:** SRS §4.7, API.md §5.

### P21 — State machine
**Files:** `api/orders/state.py`

- One dict: `ALLOWED_TRANSITIONS = {(from, to): {roles}}` covering exactly API.md §6 — including `preparing → cancelled` and `ready → cancelled` for seller/admin only, which SRS §6.1's wildcard row states less explicitly.
- `assert_transition(from_status, to_status, role)` raises `APIError(INVALID_TRANSITION, details={'allowed': [...]})` (400). `allowed_targets(from_status, role)` powers the `details.allowed` list.
- `completed` and `cancelled` are terminal — no key exits them (BR-03).
- Three callers and no copies: seller transition (P26), customer cancel (P25), admin.
- **Trace:** BR-01/03, FR-44/45, API.md §6. Tests: T-02, T-03.

### P22 — Checkout transaction
**Files:** `api/orders/views.py`, `services.py`

Exact sequence inside one `transaction.atomic()` (FR-28):
1. `Idempotency-Key` header present and a valid uuid4, else `400 missing_idempotency_key`.
2. Existing `Order(customer, idempotency_key)` ⇒ return it with **200**, no side effects.
3. Cart empty ⇒ `400 empty_cart`. Contact/delivery fields missing ⇒ `400 validation_error`.
4. `Product.objects.select_for_update().filter(id__in=[...]).order_by('id')` — **ordered locking, deadlock-free** (BR-04).
5. Re-run `revalidate()` **against the locked rows**; unacknowledged issues ⇒ `409 cart_has_issues` + `details.issues[]`. `acknowledged_issues: ["price_changed"]` in the body clears only that code; stock and availability issues are never acknowledgeable.
6. Stock shortfall discovered under lock ⇒ `409 insufficient_stock` + `details.product_id`, `details.available`.
7. Totals computed from locked `Product.price` only. Any `price`/`total`/`line_total` in the request body is **not read** — the serializer has no such input fields (SEC-03).
8. Create `Order`, `bulk_create` `OrderItem` snapshots, deduct stock via `F('stock_quantity') - qty`, write history row `from_status=None → pending`, delete cart lines, commit.
- `IntegrityError` on DR-09 (two concurrent requests, same key) ⇒ catch, re-read, return the original order with 200 (BR-06).
- **201** body per API.md §5: `{order_number, status, items[], subtotal, total, created_at}`.
- **Trace:** FR-27..38, BR-04/05/06, SEC-03, OD06/OD09/OD10. Tests: T-08, T-09, T-12, T-13, T-15, T-20, T-22.

### P23 — Customer order read
**Files:** `api/orders/views.py`, `serializers.py`

- `GET /api/orders/` — caller's orders only, newest first (IX-01), `?status=` filter, list shape `{id, order_number, status, total, item_count, created_at}`.
- `GET /api/orders/<id>/` — detail with `seller`, `items[]` (snapshots + `product_id`), totals, contact/delivery snapshot, `timeline[]` from history ordered by `created_at` (IX-04). Another customer's order ⇒ **404**, never 403.
- **Trace:** FR-47/48, SEC-02. Tests: T-19.

### P24 — Stock restoration service
**Files:** `api/orders/services.py`

- `restore_stock(order)` — inside the caller's transaction: re-read `order` with `select_for_update()`, no-op if `stock_restored`, else `F('stock_quantity') + qty` per item and set the flag. Idempotent by construction (N-08).
- Shared by customer cancel (P25) and any seller/admin transition to `cancelled` (P26) — BR-02, one implementation.
- **Trace:** FR-42, BR-02. Tests: T-16, T-17.

### P25 — Customer cancel
**Files:** `api/orders/views.py`

- `POST /api/orders/<id>/cancel/` — allowed from `pending`/`confirmed` only, via `assert_transition(..., role='customer')`. Calls `restore_stock`, writes a history row, returns `200 {order_number, status:"cancelled"}`.
- **Errors:** `400 invalid_transition` (preparing/ready/completed) · `400 already_cancelled` · `404`.
- **Trace:** FR-42/45, API.md §5. Tests: T-16, T-17.

---

# Part E — Seller (P26–P31)

### P26 — Seller product list/create
**Files:** `api/catalog/views.py` (seller viewset), `serializers.py`, `urls.py`

- `IsSeller`; `get_queryset()` = `Product.objects.filter(seller=self.request.user.sellerprofile)` — **ownership is a fetch condition, never a post-fetch check** (BR-07/08). Admin gets the same endpoints unscoped.
- `GET` filters `?status=`, `?search=`, paginated. Item shape per API.md §7 includes `stock_quantity` (full value — sellers see it, the public never does), `stock_state`, `image_count`.
- `POST` always creates `status='draft'` regardless of any `status` in the body; accepts `name, description, price, stock_quantity, category_id`.
- **Errors:** `400 validation_error` — price < 0, stock < 0, description > 5000, unknown category.
- **Trace:** FR-49/50, BR-07/08, SEC-04. Tests: T-18, T-21.

### P27 — Seller product detail / edit / soft delete
**Files:** same viewset

- `GET <id>/` full product incl. `moderation_note`. `PATCH` editable set: `name, description, price, stock_quantity (≥0), category_id`. Not editable here: `status`, `seller`, `moderation_note`.
- `DELETE` ⇒ `status='archived'`, returns 204; the row is never removed (DR-13 protects sold products anyway).
- Not-owned ⇒ 404 on every verb.
- **Trace:** FR-43/50/51, N-01/N-02 (edits must not touch historical orders — verified by snapshot tests).

### P28 — Publish
**Files:** same viewset

- `POST /api/seller/products/<id>/publish/` → `200 {id, status:"published"}`.
- **Errors:** `400 validation_error` when the product has **no images**, or its status is `rejected`/`archived` (API.md §7). Only `draft` (and already-`published`, idempotent) may publish.
- **Trace:** FR-49, OD07, AI-08 (publishing is always a separate human action).

### P29 — Image upload / delete
**Files:** `api/catalog/views.py`, `serializers.py`

- `POST /api/seller/products/<id>/images/` — `multipart/form-data`: `image`, optional `sort_order`. Limits: ≤5 per product · ≤2 MB · real MIME sniff (read the file header, not the extension — SEC-07) restricted to `image/jpeg|png|webp`. Media stored under `MEDIA_ROOT`, outside any executable path.
- `DELETE /api/seller/products/<id>/images/<image_id>/` → 204.
- **Errors:** `400 validation_error` — too large, wrong type, 5-image limit, `sort_order` already taken (DR-06 also enforces this at the DB).
- **Trace:** FR-55, SEC-07, DR-06.

### P30 — Seller orders + transition
**Files:** `api/orders/views.py` (seller viewset)

- `GET /api/seller/orders/` — `filter(seller=request.user.sellerprofile)` (IX-02), `?status=`, paginated. Shape exposes `contact_name` and, on detail, `contact_phone`/`delivery_address` — **no customer email, id, or account data** (FR-52, §16).
- `POST /api/seller/orders/<id>/transition/` `{to_status}` → `200 {order_number, from_status, status}`. Delegates to `orders/state.py`; `to_status='cancelled'` calls `restore_stock` in the same transaction (BR-02). Every success writes a history row with `changed_by`.
- **Errors:** `400 invalid_transition` + `details.allowed` · `404`.
- **Trace:** FR-46/52/53, BR-01/02. Tests: T-02, T-03, T-18.

### P31 — Seller dashboard
**Files:** `api/orders/views.py` or `catalog/views.py`

- `GET /api/seller/dashboard/` → `{product_count, out_of_stock_count, low_stock_count, orders_by_status{six keys}}`. Product counters use the same threshold constant as `stock_state`; order counters are one `values('status').annotate(Count)` served by IX-02, with all six statuses present even at zero.
- **Trace:** FR-54, API.md §7.

---

# Part F — Admin (P32–P33)

### P32 — Admin metrics, products, orders, users
**Files:** `api/accounts/views.py`, `catalog/views.py`, `orders/views.py` (admin viewsets), `urls.py`

- `IsAdmin` on all. `GET /api/admin/metrics/` → `{total_orders, total_sales, published_product_count, active_seller_count, orders_by_status}`; `total_sales` sums `total` over non-cancelled orders. `# ponytail: live COUNT/SUM; materialized view past ~100k orders`
- `GET/PATCH /api/admin/products/<id>/` — any product, any status. `moderation_note` **required** when setting `status='rejected'` (400 otherwise).
- `GET /api/admin/orders/` — all orders, `?status=`, `?seller=`, `?date_from=`, `?date_to=`, paginated.
- `GET/PATCH /api/admin/users/<id>/` — `{status: "suspended"}` suspends: login fails (P05), existing tokens die on next request (P06), products vanish from the catalog (P11). All three already exist; this phase only flips the flag.
- **Trace:** FR-56..59, API.md §8.

### P33 — Django Admin registration
**Files:** `api/*/admin.py`

- Register all models read-mostly as a **backup** interface only. Explicitly not a substitute for FR-56..59 (FR-60).
- **Trace:** FR-60.

---

# Part G — AI (P34–P37)

### P34 — Provider adapter
**Files:** `api/ai/provider.py`

- `AIProvider` protocol with a single method; one real implementation reading `AI_PROVIDER_KEY`; one deterministic `FakeProvider` for tests. Selected by settings — swapping providers touches no business logic (AD-07, OD08).
- 10s timeout; any provider error or timeout ⇒ `APIError(AI_UNAVAILABLE, 503)` and **zero side effects** (no suggestion row written).
- **Trace:** AD-07, OD08, FR-69, NFR-09. Tests: T-28.

### P35 — `AIContentSuggestion` + validation
**Files:** `api/ai/models.py`, `validation.py`, migration

- Model per SRS §4.10: `target_type`, `target_id BigInteger(null)` (soft ref, no FK — R-05), `suggestion_type` ∈ `description|tags|moderation`, `input_payload JSONField`, `structured_output JSONField`, `confidence Decimal(3,2)`, `review_status` ∈ `pending|accepted|rejected`, `requested_by FK(PROTECT)`, `reviewed_by FK(SET_NULL, null)`. **DR-14** `confidence BETWEEN 0 AND 1`.
- `validation.py` implements AI-01..06 against the §7.1 schema: valid JSON · `title` 3–160 · `short_description` ≤300 · `description` 20–5000 · `highlights` 1–6 each ≤120 · `suggested_tags` 0–10 each `^[\w\s-]{2,30}$` · `0 ≤ confidence ≤ 1`.
- Any failure **or** `confidence < 0.5` ⇒ row stored with `review_status='rejected'`, response `200 {suggestion_id, status:"needs_regeneration", reason:"low_confidence"}` with **no `output`** — a rejected suggestion is never shown as valid.
- All text HTML-escaped before storage *and* before return — AI output is untrusted input (AI-06, SEC-09).
- **Trace:** FR-64/65, AI-01..06, DR-14. Tests: T-25, T-26.

### P36 — AI endpoints
**Files:** `api/ai/views.py`, `serializers.py`, `urls.py`

- `POST /ai/suggest-description/` `{name, category_id, attributes, notes}` · `POST /ai/suggest-tags/` `{title, description}` · `POST /ai/moderate/` `{product_id}` (note types `missing_info|suspicious_claims|inappropriate_terms`, advisory only — no product field changes).
- Seller/Admin only ⇒ 403 for customer/guest. Throttle scope `ai` at 10/hour per seller ⇒ `429 rate_limited`.
- `suggest-tags`: **AI-07** — `category` is dropped unless it matches an existing `Category.name` exactly. The API never invents a category.
- Every response is persisted as a suggestion with `review_status='pending'` and is never auto-applied.
- **Trace:** FR-61..63/68, AI-07, NFR-08, API.md §9.

### P37 — Accept / reject + admin listing
**Files:** `api/ai/views.py`, admin viewset

- `POST /ai/suggestions/<id>/accept/` — explicit human action: writes suggested values onto the target product, sets `review_status='accepted'` + `reviewed_by`. The product **stays `draft`** (AI-08). Returns `{suggestion_id, review_status, product_id, product_status}`.
- `POST /ai/suggestions/<id>/reject/` → `{suggestion_id, review_status:"rejected"}`.
- **Errors:** `400 validation_error` (already reviewed, or no product target) · `404`.
- `GET /api/admin/ai-suggestions/` — `?review_status=`, `?suggestion_type=`, paginated.
- **FR-67 audit:** grep the checkout, stock, permission and transition paths — no AI import may appear in any of them.
- **Trace:** FR-66/67, AI-08. Tests: T-27.

---

# Part H — Delivery (P38–P41)

### P38 — `seed_demo`
**Files:** `api/catalog/management/commands/seed_demo.py`

- Idempotent (safe to re-run): 4 categories, 3 sellers, 12 published products with varied stock **including one at exactly 5 and one at 0**, 2 customers, 1 admin. Known passwords printed at the end for the demo.
- **Trace:** FR-79, DEP-03.

### P39 — Test matrix T-01..T-30
**Files:** `api/tests/*`, `pytest.ini`

- Fill every gap. Runs on **real PostgreSQL** — `select_for_update` and `CheckConstraint` are no-ops or absent on SQLite, so SQLite would silently pass the tests that matter most (SRS §10.2).
- **T-30 concurrency:** two threads, stock = 1, real connections (`TransactionTestCase` / `pytest.mark.django_db(transaction=True)`) — exactly one 201, one 409, final stock 0, never −1.
- **T-13:** inject a failure after validation and before commit; assert no order row and unchanged stock.
- T-09..T-14, T-18..T-24 and T-30 may never be skipped or xfailed.
- **Trace:** SRS §10, FR-80.

### P40 — Structured logging
**Files:** `api/common/logging.py`, settings

- JSON formatter; one log call at each of: checkout failure, unauthorized access, stock validation failure, invalid transition, AI failure — fields `event, user_id, resource_id, reason`. Passwords and tokens never logged (SEC-05).
- **Trace:** NFR-05, SEC-05.

### P41 — Compose, first boot, smoke
**Files:** `docker-compose.yml`, `api/Dockerfile`, entrypoint

- `db` + `api` (gunicorn) — `web` slot reserved for the frontend (FR-81). Entrypoint: `migrate` then `seed_demo` on first boot (DEP-03). WhiteNoise serves static/media. `# ponytail: WhiteNoise; move to S3/CDN when media volume grows`
- **T-29 E2E** — automate SRS §11's nine steps against the running API: publish → view → add qty 2 → checkout with key → stock 3 → `pending→confirmed→preparing` → timeline → buy 4 fails 409 → `preparing→ready→completed`, then any further transition 400.
- DEP-05 smoke: health ✓ login ✓ catalog ✓ checkout ✓ transition ✓.
- **Trace:** FR-81, DEP-01/03/04/05, T-29.

---

## Ordering constraints (non-negotiable)

1. **P03 before every other model.** Changing `AUTH_USER_MODEL` after migrations exist means rebuilding the database.
2. **Constraints ship in the same migration as their model.** DR-09 and DR-12 are the correctness story; retrofitting them means backfilling dirty data.
3. **P10 before P11/P18/P31** — one `stock_state`, four callers.
4. **P21 before P22/P25/P30** — one transitions dict, three callers.
5. **P18 before P22** — checkout re-runs `revalidate()` under lock; it must be the same function, not a parallel copy.
6. **P24 before P25/P30** — one `restore_stock`, two callers, one `stock_restored` guard.
7. **P34 before P35/P36** — validation and endpoints both need the provider seam and its fake.

## Verification

- **Per phase:** its named `T-xx` green + `manage.py check` clean + the phase's endpoints exercised against the contract in `API.md`.
- **Cumulative:** `docker compose up` → `pytest` on Postgres → T-01..T-30 all green (P39).
- **Manual:** `seed_demo`, then walk SRS §11's nine steps (P41).
- **The two that decide the design:** T-30 (concurrency — stock never goes negative) and T-12 (idempotency — one key, one order). If either is red, the checkout is wrong regardless of what else passes.

## Out of scope for this plan

Frontend entirely (FR-70..78 — Next.js pages, middleware, error-message map). Plus SRS Appendix B: guest cart/checkout, multi-seller order splitting, background workers, notifications, reviews/favorites, realtime order updates, payment gateway, shipping/tax.
