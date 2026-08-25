# Bug Report — Souqi repo review

Reviewed: `api/` scaffold, `docker-compose.yml`, `.env.example`, and the four spec docs.
`confirmed` = reproduced by running it. `inspected` = read, not executed.

**Status after the fix pass:** verified with `docker compose run --rm api python manage.py migrate`
(clean, `accounts.0001_initial` applied), `python -m pytest` (6 passed on real Postgres), and a live
container on :8020 — `/api/health/` 200, `/admin/login/` 200 under `DEBUG=False`, unknown route
returns the §1.2 envelope.

---

## A. Breaks right now

### A1 — `/admin/` 500s: manifest storage with no `collectstatic` — **confirmed → FIXED**
`souqi/settings.py` uses `CompressedManifestStaticFilesStorage`, but the Dockerfile never ran `collectstatic`:

```
ValueError: Missing staticfiles manifest entry for 'admin/css/base.css'
```

Fixed by `api/entrypoint.sh` (`migrate` → `collectstatic --noinput` → `exec gunicorn`), wired as the
Dockerfile `ENTRYPOINT`. It runs at boot rather than build time because compose mounts `./api` over
`/app`, which would discard anything staged into the image. `/admin/login/` now returns 200.

### A2 — Fresh clone can't start: `env_file: .env` is mandatory — **inspected → FIXED**
`.env` is gitignored, so compose failed for anyone but the author. Now `env_file: {path: .env,
required: false}`, and `README.md` carries the two-line setup (`cp .env.example .env` + key generation).

---

## B. Landmine — nothing stopped it firing

### B1 — `AUTH_USER_MODEL` was unset — **confirmed → FIXED**
`PLAN.md` non-negotiable #1: *"P03 before every other model."* Nothing prevented `migrate` from baking
`auth.User` into the DB, and the A1/D4 entrypoint fix would have made that self-firing on the next
`compose up`.

Shipped P03 to close it: `accounts/User` (`AbstractUser`, `USERNAME_FIELD='email'`, no `username`,
email-keyed manager, `UniqueConstraint(Lower('email'))` = DR-01), its migration, and
`AUTH_USER_MODEL = 'accounts.User'`. **Scope note:** this is one phase of implementation, not a
patch — it was the only real fix available, since the setting can't point at an app that doesn't exist.
P04/P05 (SellerProfile, registration, JWT views) were left alone.

### B2 — Known `SECRET_KEY` with `DEBUG=False` — **confirmed → FIXED**
`'dev-insecure-change-me'` was the fallback and `.env.example` shipped that same value, so a production
boot was silent. Now: no usable default — `ImproperlyConfigured` when `SECRET_KEY` is empty and
`DEBUG=False`; a dev-only key applies solely under `DEBUG=True`. `.env.example` ships an empty
`SECRET_KEY` with the generator command; your local `.env` got a freshly generated 64-byte key.

> Consequence: host-side `python3 manage.py …` now needs the env loaded. Use
> `docker compose run --rm api …`, or export `SECRET_KEY` first.

### B3 — `EXCEPTION_HANDLER` pointed at a module that didn't exist — **confirmed → FIXED**
`ModuleNotFoundError: No module named 'common.exceptions'`; `manage.py check` passed because DRF
resolves the handler lazily. `common/errors.py` (API.md §1.4 code constants + `APIError`) and
`common/exceptions.py` (envelope wrapper) now exist. One branch needed care: `Http404` and Django's
`PermissionDenied` arrive already translated by DRF but carry no DRF attributes, so the code is read
off the response rather than `exc.default_code`. Covered by `tests/test_error_envelope.py`.

---

## C. Spec contradictions in the docs

### C1 — `POST /ai/suggestions/<id>/accept/` was unreachable for every suggestion type — **inspected → FIXED (design decision)**
`/suggest-description/` and `/suggest-tags/` carry no product id, so `target_id` was always null for the
two acceptable types and always set for the one type that can't be accepted (`moderate`). Every accept
call would 400 with "no product target".

**Decision: bind the target at accept time.** `accept/` takes `product_id`, required when `target_id` is
null and written onto it in the same transaction; optional and must-match when already bound. Suggest-time
binding was rejected because it can't express R-05's "suggestion precedes the product", which is the whole
reason `target_id` is a nullable soft reference. Applied to `API.md` §9 and `PLAN.md` P37.

### C2 — `sort_order` collided on the second image when the caller omitted it — **inspected → FIXED**
`default 0` under `UNIQUE(product, sort_order)` meant a second upload with no `sort_order` 400'd on a field
the caller never sent. `API.md` §7 and `PLAN.md` P09/P29 now specify append semantics (`max + 1`), with the
model default kept as a model-level default only.

### C3 — `details.available` clamp stated in §4, not §5 — **inspected → FIXED**
The checkout `409` row in `API.md` §5 now carries the same clamp caveat as §4.

### C4 — `API.md` §1.6 omitted the public-catalog throttle exemption — **inspected → FIXED**
NFR-07's exemption for `/products/`, `/categories/`, `/health/` (and the AD-05 single-origin-IP reason
behind it) is now in the rate-limit table, not only in SRS/PLAN.

### C5 — DB_DESIGN contradicted its own normalization claim — **inspected → FIXED**
2NF text said "no table has a natural composite key" while §2.1 named two candidate keys. Reworded to
separate *primary* key from *candidate* key. The §3.3 `db_index=False` rule also applies to
`ProductImage.product` (DR-06) and `CartItem.cart` (DR-07); `PLAN.md` P09/P14 now say so.

---

## D. Latent / drift

| # | Finding | Status |
|---|---|---|
| D1 | `django-filter` installed but not in `INSTALLED_APPS` | **fixed** — `django_filters` added |
| D2 | No `SIMPLE_JWT` block: defaults 5m/1d vs spec 15m/7d | **fixed** — `SIMPLE_JWT` set to 15m/7d |
| D3 | PLAN said DRF 3.15, requirements pin `3.16.*` | **fixed** — PLAN now says 3.16 |
| D4 | No `migrate` in the container entrypoint | **fixed** — in `entrypoint.sh` (see A1) |
| D5 | `pytest`/`pytest-django` in the production image | **won't fix** — P39 runs pytest *inside* this image against compose Postgres; splitting requirements would break that |
| D6 | `pytest.ini` in the PLAN layout, absent from repo | **fixed** — added, `testpaths = tests` |
| D7 | `check --deploy`: no HSTS / SSL redirect / secure cookies | **fixed, opt-in** — gated behind `HTTPS_ONLY=true`. Not enabled by default: compose serves plain `:8000` with no TLS terminator, so unconditional `SECURE_SSL_REDIRECT` would break the only deployment that exists. Flip it when a real proxy lands |
| D8 | `GET /api/orders/` example omitted `next`/`previous` | **fixed** |
| D9 | Rejected AI output always reported `reason: "low_confidence"` | **fixed** — `low_confidence` vs `schema_invalid` (retry-worthy vs provider bug) |
| D10 | Compose runs gunicorn without `--reload` despite mounting source | **fixed** — `--reload` in the compose `command:` override, not in the image CMD |

---

## Not a repo bug, but it will bite

Host port `8000` is already taken by another project (`noor_alhuda`), so `docker compose up` fails to bind
and `curl localhost:8000` silently hits that other app. Smoke tests above ran on `:8020`. Either stop the
other stack or change the published port here.
