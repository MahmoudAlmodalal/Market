# Souqi backend↔frontend integration — delegation queue

## HOW TO RESUME (paused 2026-09-03, waiting on Antigravity quota)
1. Confirm quota is back: `agy models` (should exit 0 — it did even while blocked, so that alone is
   not proof). Real test is step 3.
2. Start the backend if it is down: `docker compose up -d` (it must be *up* — `docker compose restart`
   does NOT re-read `.env`). Sanity: `curl -s 'http://localhost:8000/api/products/?page_size=1'`.
3. Re-dispatch P3 verbatim, from a clean tree:
   `node ~/.claude/skills/agy-delegate/scripts/relay.mjs --brief .delegate/p3-brief.txt --cd /home/mahmoud/Desktop/p3 --effort high`
   (`--effort` is rejected for `claude-sonnet-4-6`; it works on agy's default model.)
4. Review the diff against the brief, re-run `npm run build` yourself, then commit. Do not trust the
   self-report — P2's was truncated and its gates were never actually run by agy.
5. Continue with P4 onward; briefs for those are not written yet.


Orchestrator: Claude Code. Implementer: `agy` (Antigravity CLI). One commit per task, sequential.

Base commit: `11db381` (wip: responsive + orders/cart UI tweaks before backend integration)

## Environment (done inline, Phase 0)
- Docker up: `p3-api-1` :8000, `p3-db-1` postgres 16. DB seeded (12 products, 7 users).
- `.env`: `DEBUG=True` (container **recreated**, not restarted — `docker compose restart` does not re-read env_file). Media now 200.
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `.gitignore`: added `.env.local`, `.playwright-mcp/`
- Seeded creds (all `password123`): `omar@souqi.com`/`layla@souqi.com` customer, `sara@souqi.com`/`gaza.crafts@souqi.com`/`artisan@souqi.com` seller, `admin@souqi.com`/`admin@test.local` admin.

## Decisions (user, this session)
- Commit WIP before the queue — done (`11db381`).
- Phase 6: **add** `GET /admin/products/` + `GET /admin/users/` list endpoints (IsAdmin ListAPIView) — extra backend task P6a.
- Gates: `npm run build` + `npm run lint`. Plus a **final task P8: real Playwright E2E** against the live backend.
- `tests/e2e/` is the hand-rolled mock-logic harness, not Playwright — deleted in P7, not converted.

## Status
| # | Task | Status | Commit |
|---|------|--------|--------|
| P1 | `lib/api/` client + resources | committed | `c1e1640` |
| P2 | Public pages → server-side fetch | committed | `2e79b94` |
| P3 | AuthContext → real JWT | **BLOCKED — agy quota** | |
| P4 | Cart / checkout / orders | queued | |
| P5 | Seller surface | queued | |
| P6a | Backend: admin product/user list endpoints | queued | |
| P6b | Admin UI | queued | |
| P7 | Delete mock layer | queued | |
| P8 | Playwright E2E vs live backend | queued | |

## BLOCKER (2026-09-03 ~13:32 local)
Antigravity is out of model quota — **account-wide, not per-model**. Three P3 dispatches:
1. default model + `--effort high` → `RESOURCE_EXHAUSTED (code 429)`, 0 files touched.
2. `--model claude-sonnet-4-6 --effort high` → CLI usage error (`--effort` unsupported for that
   model); never reached the model, proves nothing.
3. `--model claude-sonnet-4-6` (no effort) → same `RESOURCE_EXHAUSTED (code 429)`, 0 files touched.

Auth is fine (`agy models` still fetches, exit 0), so this is a quota cap, not a login problem.
The `agy` CLI self-updated 1.1.23 → 1.1.25 between runs; an "You are not logged into Antigravity"
line appears in run 3's log for `loadCodeAssist` but models still list, so treat it as noise unless
retries keep failing after the quota resets.

Working tree is clean at `2e79b94` — nothing half-written to reconcile.
Brief is written and ready to re-dispatch verbatim: `scratchpad/p3-brief.txt`.

## Needs your eyes
- **P1:** `redirectToLogin()` sent the browser to `/login`, which 404s (all routes live under
  `/[locale]/`). Fixed inline before commit — derives locale from `window.location.pathname`, falls
  back to `ar`.
- **Gates:** `npm run lint` is unusable — eslint is not installed and `next lint` prompts
  interactively. Gate is `npm run build` only (it type-checks). Adding eslint = a new dep for no
  current signal.
- **P2 consequences (my calls, not spelled out in the plan):** FilterDrawer loses price-range /
  rating / stock filters (`ProductFilter` has no such fields; faking them breaks under pagination).
  Product name/description are single-language DB columns, so localized product copy is gone — only
  static UI chrome stays translated.
- **P2 nitpick, not fixed:** `/ar/products/99999` renders the correct not-found UI but returns
  HTTP 200 in `next dev` (streaming + force-dynamic artifact). Correct body, wrong status header.

## Review notes
- **P1** — scope held (only `lib/api/`, 1216 lines). Route coverage matches `api/*/urls.py`. Got both
  traps right: `price_acknowledgements` (not the doc's `acknowledged_issues`) and caller-supplied
  `Idempotency-Key`. Also collapsed a 9-clause `isAuthBypassEndpoint` into one regex.
- **P2** — agy's report was truncated mid-verification (it backgrounded the gates and ended its turn);
  no gate evidence from it. Verified myself: `npm run build` green; dev server serves real product
  names in the server-rendered HTML for `/ar`, `/ar/catalog?search=olive`, `/ar/products/12`; zero
  `lib/mock` imports in the three pages. Removed components survive only as barrel re-exports
  (`components/pdp/index.ts`, `components/feed/index.ts`) — P7 deletes the files.
  Vestigial `minPrice`/`maxPrice` props remain in `FilterDrawer.tsx`, unused by any caller.
  P3's brief now explicitly forbids backgrounding the gates.
