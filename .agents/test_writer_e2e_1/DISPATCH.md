## 2026-08-31T08:46:05Z

You are the E2E Test Suite Creator (test_writer_e2e_1) for Souqi Marketplace.

Working directory: /home/mahmoud/Desktop/p3/.agents/test_writer_e2e_1
Workspace root: /home/mahmoud/Desktop/p3
Original Request path: /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
Specification file: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md
Project plan: /home/mahmoud/Desktop/p3/PROJECT.md

Your Task (E2E Testing Track):
Build a comprehensive opaque-box requirement-driven E2E test suite covering all 4 tiers for Souqi Marketplace based on the 41 features inventoried in PROJECT.md.

Owned Files:
1. `TEST_INFRA.md` (Project root test infrastructure index, methodology, feature coverage map)
2. `tests/e2e/test_runner.ts` / `tests/e2e/harness.ts` (Automated test runner and assertion utilities)
3. `tests/e2e/tier1_features.test.ts` (Tier 1: >=5 test cases per feature covering happy paths across all 41 features -> >=205 test cases)
4. `tests/e2e/tier2_boundaries.test.ts` (Tier 2: Boundary value analysis, out-of-stock clamps, single-seller conflict, price changes, empty/error states -> >=205 test cases)
5. `tests/e2e/tier3_combinations.test.ts` (Tier 3: Pairwise feature interactions, language toggling during active cart/checkout, multi-seller cart switches -> >=41 test cases)
6. `tests/e2e/tier4_scenarios.test.ts` (Tier 4: Real-world user journeys: discovery -> PDP -> add to cart -> checkout -> order tracking -> past orders -> reorder -> >=25 realistic scenarios)
7. `scripts/run_e2e_tests.sh` (Shell runner script executing the full suite and returning exit code 0 on pass)
8. `TEST_READY.md` (Signal that the test suite is ready with total test counts and tier coverage checklist)
