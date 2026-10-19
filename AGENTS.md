# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository shape

This repo contains two separate, not-yet-integrated halves:

- **Frontend** (repo root): Next.js 15 App Router marketplace UI ("Souqi"), driven entirely by mock data/engines in `lib/mock/*` and `lib/context/*` — there is no live fetch to `api/` yet.
- **Backend** (`api/`): Django 5 + DRF marketplace API, spec-driven from `SRS.md`, `API.md`, `DB_DESIGN.md`.

When making changes, check which half a task belongs to — commands, tests, and conventions differ per side.

## Frontend (root)

Commands:
- `npm run dev` / `npm run build` / `npm run start` — Next.js dev/build/serve
- `npm run lint` — Next.js lint

E2E tests live in `tests/e2e/` and use a **custom hand-rolled test runner/harness** (`tests/e2e/harness.ts`, `tests/e2e/test_runner.ts`) — not Jest/Vitest/Playwright. Run with `npx tsx tests/e2e/test_runner.ts`, filterable via `--tier=1|2|3|4` and `--feature=<id>`. `harness.ts` also contains standalone re-implementations of core business logic (`CatalogEngine`, `CartEngine`, `OrderEngine`, `SellerDashboardEngine`, etc.) used purely to verify behavior in isolation from the React components.

Architecture:
- **Locale routing**: every route lives under `app/[locale]/...` (`ar` default/RTL, `en`/LTR). `app/[locale]/layout.tsx` validates the locale segment (404s on anything else) and nests `LocaleProvider > AuthProvider > CartProvider > NotificationProvider > ToastProvider` around a fixed-width `MobileContainer` (`AppHeader` + `BottomNav` chrome).
- **State**: no server state layer — all data comes from `lib/mock/*` fixture stores, mutated in-memory through the contexts in `lib/context/*` (`CartContext`, `AuthContext`, `LocaleContext`, `NotificationContext`).
- **i18n**: `lib/i18n/dictionaries.ts` + `ar.json`/`en.json`; direction/font selection driven by `LocaleContext`.
- **Components**: organized by domain under `components/` (`feed`, `catalog`, `pdp`, `cart`, `checkout`, `orders`, `profile`, `seller`) plus shared `components/ui/*` primitives and `components/layout/*` chrome.
- **Design/spec docs** worth reading before UI work: `PROJECT.md` (architecture + feature/milestone inventory), `SOUQI_UI_IMPLEMENTATION_PLAN.md`, `design.md`, `UIUX_BRIEF.md`.

## Backend (`api/`)

Commands (run inside `api/`, or via `docker compose up --build` from repo root which runs migrate → collectstatic → gunicorn):
- `python manage.py runserver` — dev server
- `python manage.py migrate` — apply migrations
- `pytest` — full test suite (config in `api/pytest.ini`: `DJANGO_SETTINGS_MODULE=souqi.settings`, discovers `tests/test_*.py`)
- `pytest tests/test_checkout.py` — single test file; `pytest tests/test_checkout.py::TestName::test_method` for a single test
- `docker compose up --build` (repo root) — Postgres 16 + API container; requires `.env` (copy from `.env.example`, set `SECRET_KEY` via `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`)

Architecture:
- Django apps by domain: `accounts` (auth/users), `catalog` (products/categories, `services.py` for business logic), `orders` (cart/checkout, `services.py` + `state.py` for the order state machine), `ai` (AI suggestion provider, `provider.py`).
- `common/` holds cross-cutting concerns: `errors.py` defines one error-code constant per code in `API.md` §1.4 plus `APIError` (raise with a code from there; `common/exceptions.py` renders the JSON error envelope), plus `pagination.py`, `permissions.py`, `logging.py`.
- Order lifecycle is a state machine — see `orders/state.py` before touching order status transitions.
- Spec docs to consult before backend work: `SRS.md`, `API.md` (endpoint + error-code contract), `DB_DESIGN.md`, `PLAN.md`, `TICKETS.md`.
