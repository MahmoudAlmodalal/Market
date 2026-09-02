# Orchestration Plan: Souqi Marketplace Bilingual UI Finalization

## 1. Objectives
- Implement 7 missing Next.js App Router route pages:
  1. `app/[locale]/checkout/confirmation/page.tsx`
  2. `app/[locale]/orders/page.tsx`
  3. `app/[locale]/orders/[id]/page.tsx`
  4. `app/[locale]/profile/page.tsx`
  5. `app/[locale]/seller/dashboard/page.tsx`
  6. `app/[locale]/login/page.tsx`
  7. `app/[locale]/register/page.tsx`
- Resolve all TypeScript typecheck errors across the codebase (`app/`, `components/`, `lib/`, `types/`, `tests/`) such that `npx tsc --noEmit` exits with 0 errors.
- Ensure `npm run build` succeeds cleanly with 0 errors.
- Ensure `npx ts-node tests/e2e/test_runner.ts` passes 100% across all tiers (Tier 1, Tier 2, Tier 3, Tier 4).
- Execute independent Review, Adversarial Challenge, and Forensic Integrity Audit before final delivery.

## 2. Milestone Structure & Iteration Strategy

### Milestone 1: Exploration & Gap Analysis
- Dispatch 3 Explorers in parallel:
  - `explorer_pages_1`: Map requirements and component fixtures for the 7 missing route pages.
  - `explorer_ts_1`: Identify all TypeScript errors across codebase, mismatching props (Button, Modal, etc.), missing exports in `types/index.ts`, test imports.
  - `explorer_tests_1`: Analyze test runner, E2E fixtures, and build configuration.

### Milestone 2: Implementation & TypeScript Resolution
- Dispatch `worker_pages_ts_1` to implement the 7 pages and fix all TypeScript errors.
- Worker runs `npx tsc --noEmit` and reports detailed output.

### Milestone 3: Production Build & E2E Test Execution
- Dispatch `worker_build_e2e_1` to run `npm run build` and `npx ts-node tests/e2e/test_runner.ts`, resolving any runtime or build issues.

### Milestone 4: Verification & Gating (Review, Challenge, Audit)
- Dispatch 2 independent Reviewers (`reviewer_1`, `reviewer_2`).
- Dispatch 2 independent Challengers (`challenger_1`, `challenger_2`).
- Dispatch 1 Forensic Auditor (`teamwork_preview_auditor`).
- Gate evaluation: strict AND of all criteria + Auditor binary veto.

### Milestone 5: Final Synthesis & Human Reporting
- Generate comprehensive completion report and present verified deliverables to the parent caller.
