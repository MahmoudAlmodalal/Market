# Bug Report — Souqi repo review

Reviewed: `api/` scaffold (P01 only), `docker-compose.yml`, `.env.example`, and the four spec docs.
`confirmed` = reproduced by running it. `inspected` = read, not executed.

---

## A. Breaks right now

### A1 — `/admin/` 500s: manifest storage with no `collectstatic` — **confirmed**
`souqi/settings.py:80` uses `CompressedManifestStaticFilesStorage`, but `api/Dockerfile` never runs `collectstatic`.

```
ValueError: Missing staticfiles manifest entry for 'admin/css/base.css'
```

Fires on any admin page with `DEBUG=False` (the default). Fix: add `RUN python manage.py collectstatic --noinput` to the Dockerfile, or move it into the P41 entrypoint alongside `migrate`.

Note the compose mount `./api:/app` shadows anything built into the image at `/app`, so a Dockerfile-time `collectstatic` is wiped in dev — the entrypoint is the fix that actually works for both.

### A2 — Fresh clone can't start: `env_file: .env` is mandatory — **inspected**
`docker-compose.yml:18` hard-requires `.env`, which `.gitignore:1` excludes. It exists on this machine, so it works locally and fails for everyone else. P01's own DoD (`docker compose run --rm api python manage.py check`) is unreachable on a clean checkout.

Fix: `env_file: {path: .env, required: false}`, or a README line `cp .env.example .env`. `README.md` is currently one word.

---

## B. Landmine — nothing stops it firing today

### B1 — `AUTH_USER_MODEL` is unset — **confirmed** (`manage.py migrate` runs clean today)
`PLAN.md:422` calls this non-negotiable #1: *"P03 before every other model. Changing `AUTH_USER_MODEL` after migrations exist means rebuilding the database."* Settings don't set it, and nothing prevents `manage.py migrate` from running now and baking `auth.User` into the DB.

This is the top-priority item despite nothing being broken: it's the only defect here that becomes **irreversible** the moment someone runs the obvious next command. Either ship `accounts.User` (P03) before anyone migrates, or add a guard.

### B2 — Known `SECRET_KEY` with `DEBUG=False` — **confirmed** via `check --deploy` (W009)
`settings.py:12` falls back to `'dev-insecure-change-me'`, and `.env.example:1` ships that exact value, so every copied env inherits it. `DEBUG` correctly defaults to `False`, which means a production boot is silent — no warning, working site, forgeable sessions/tokens. Fix: no default; raise if unset when `DEBUG` is false.

### B3 — `EXCEPTION_HANDLER` points at a module that doesn't exist — **confirmed**
`settings.py:94` → `common.exceptions.exception_handler`; `ModuleNotFoundError: No module named 'common.exceptions'`. `manage.py check` passes because DRF resolves the handler lazily. Latent until the first DRF view lands (P02), then every error response 500s instead of returning the envelope.

---

## C. Spec contradictions in the docs

### C1 — `POST /ai/suggestions/<id>/accept/` is unreachable for every suggestion type — **inspected**
`API.md:761-778` defines accept per type, and errors with `400 validation_error` when the suggestion has *no product target*. But:

- `/ai/suggest-description/` (`API.md:669`) takes `{name, category_id, attributes, notes}` — **no product id**
- `/ai/suggest-tags/` (`API.md:717`) takes `{title, description}` — **no product id**
- `/ai/moderate/` takes `product_id` but is explicitly **not acceptable** (`API.md:771`)

So `target_id` is always null for the two acceptable types, and always non-null for the one type that can't be accepted. Every accept call 400s. Either the two suggest endpoints need an optional `product_id`, or accept needs to take a target. `PLAN.md:375-378` inherits the same hole. This one blocks P37 and should be settled before P34 starts.

### C2 — `sort_order` collides on the second image when the caller omits it — **inspected**
`ProductImage.sort_order` defaults to `0` (`PLAN.md:120`) under `UNIQUE(product, sort_order)` (DR-06). `API.md:544` makes `sort_order` optional on upload. Upload two images without it ⇒ `400 validation_error: sort_order taken` for a caller who supplied nothing. Needs auto-assign (`max(sort_order)+1`) in P29.

### C3 — `details.available` clamp is stated in §4 but not §5 — **inspected**
`API.md:291` says the clamp applies to the checkout `409` too, but the §5 error table (`API.md:364`) lists `details.available` unconditionally. Same field, two readings; §5 is the one an implementer copies. `PLAN.md:243` gets it right.

### C4 — `API.md:1.6` omits the public-catalog throttle exemption — **inspected**
`SRS.md:548` (NFR-07) and `PLAN.md:50` exempt `/products/`, `/categories/`, `/health/` from `AnonRateThrottle` — the exemption exists precisely because AD-05 funnels all public traffic through one Next.js IP. `API.md:81-87` states a flat "Anonymous IP 30 req/min" with no exemption. A frontend dev reading only API.md will design for a limit that shouldn't apply.

### C5 — DB_DESIGN contradicts its own normalization claim — **inspected**
`DB_DESIGN.md:164` (2NF): *"No table has a natural composite key."* But `:154` and `:156` name `(product_id, sort_order)` and `(cart_id, product_id)` as candidate keys. Both are true statements about different things (PK choice vs. candidate keys) but as written they conflict. Also: the "set `db_index=False` where a composite prefix covers the FK" rule at `:239` covers only IX-01..04 — the same logic applies to `ProductImage.product` (DR-06) and `CartItem.cart` (DR-07), and `PLAN.md` P09/P14 don't set it there.

---

## D. Latent / drift — one line each

| # | Finding | Where |
|---|---|---|
| D1 | `django-filter` installed but not in `INSTALLED_APPS` — needed by P12 | `settings.py:16`, `requirements.txt:6` |
| D2 | No `SIMPLE_JWT` block: defaults are 5m/1d, spec says 15m/7d | `settings.py`, `API.md:5`, `PLAN.md:85` |
| D3 | PLAN says DRF 3.15, requirements pin `3.16.*` | `PLAN.md:21` vs `requirements.txt:2` |
| D4 | No `migrate` in the container entrypoint — CMD is bare gunicorn (P41 scope) | `Dockerfile:11` |
| D5 | `pytest`/`pytest-django` ship in the production image | `requirements.txt:10-11` |
| D6 | `pytest.ini` listed in the PLAN layout, absent from the repo | `PLAN.md:26` |
| D7 | `check --deploy`: no HSTS, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` (W004/W008/W012/W016) | `settings.py` |
| D8 | `GET /api/orders/` example omits `next`/`previous` that §1.5 mandates on every list | `API.md:376` |
| D9 | Rejected AI output always reports `reason: "low_confidence"`, with no code for a schema failure | `API.md:698`, `PLAN.md:359` |
| D10 | Compose `api` mounts source but runs gunicorn without `--reload` — dev edits need a restart | `docker-compose.yml:19-20` |

---

## Suggested order

1. **B1** — before anyone runs `migrate`.
2. **A1 + A2 + D4** — one entrypoint script fixes all three (`migrate` → `collectstatic` → gunicorn) plus `required: false`.
3. **B2** — five lines in settings.
4. **C1** — a doc decision that blocks P34–P37; settle it before writing the AI app.
5. Everything else lands naturally with its phase.
