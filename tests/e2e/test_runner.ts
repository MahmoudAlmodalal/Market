/**
 * Automated E2E Test Suite Runner for Souqi Marketplace
 * 
 * Supports:
 * - Full suite execution across all 4 tiers (476+ tests)
 * - Filter by tier (--tier=1|2|3|4)
 * - Filter by feature (--feature=1..41)
 * - Formatted console output with timings and ANSI colors
 * - Clean exit codes (0 = all pass, 1 = failure)
 */

import { registry } from './harness';
import type { TestResult, TestSuite } from './harness';

// Import all test suites to register tests
import './tier1_features.test';
import './tier2_boundaries.test';
import './tier3_combinations.test';
import './tier4_scenarios.test';

interface RunnerOptions {
  tier?: number;
  featureId?: number;
  verbose?: boolean;
  json?: boolean;
}

function parseArgs(): RunnerOptions {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--tier=')) {
      options.tier = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--tier' && i + 1 < args.length) {
      options.tier = parseInt(args[++i], 10);
    } else if (arg.startsWith('--feature=')) {
      options.featureId = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--feature' && i + 1 < args.length) {
      options.featureId = parseInt(args[++i], 10);
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--json') {
      options.json = true;
    }
  }

  return options;
}

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

async function runSuite(): Promise<number> {
  const options = parseArgs();
  const startTime = Date.now();

  let suites = registry.getSuites();

  if (options.tier) {
    suites = suites.filter(s => s.tier === options.tier);
  }

  if (options.featureId) {
    suites = suites.filter(s => s.featureId === options.featureId);
  }

  if (!options.json) {
    console.log(`\n${BOLD}${CYAN}========================================================================${RESET}`);
    console.log(`${BOLD}${CYAN}   🛍️  SOUQI MARKETPLACE — AUTOMATED E2E TEST SUITE RUNNER  🛍️   ${RESET}`);
    console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);
    console.log(`${GRAY}Starting execution across ${suites.length} suites (${options.tier ? `Tier ${options.tier}` : 'All Tiers'})...${RESET}\n`);
  }

  const results: TestResult[] = [];
  const globalBeforeEach = registry.getGlobalBeforeEach();
  const globalAfterEach = registry.getGlobalAfterEach();

  let currentTier: number | null = null;

  for (const suite of suites) {
    if (!options.json && suite.tier !== currentTier) {
      currentTier = suite.tier;
      const tierTitles: Record<number, string> = {
        1: 'TIER 1: Core Feature Happy Paths (Features 1-41)',
        2: 'TIER 2: Boundary Value Analysis & Edge Clamps (Features 1-41)',
        3: 'TIER 3: Pairwise Combinations & Cross-Module Interactions',
        4: 'TIER 4: Real-World End-to-End User Scenarios',
      };
      console.log(`\n${BOLD}${YELLOW}▶ ${tierTitles[currentTier] || `Tier ${currentTier}`}${RESET}`);
      console.log(`${GRAY}${'─'.repeat(60)}${RESET}`);
    }

    if (!options.json && options.verbose) {
      console.log(`\n  ${BOLD}${BLUE}📦 Suite: ${suite.name}${RESET}`);
    }

    for (const testCase of suite.tests) {
      const testStart = Date.now();
      let passed = true;
      let errorMsg: string | undefined;
      let stackTrace: string | undefined;

      try {
        // Run global beforeEach hooks
        for (const hook of globalBeforeEach) {
          await hook();
        }
        // Run suite-level beforeEach hooks
        for (const hook of suite.beforeEachFns) {
          await hook();
        }

        // Run the test
        await testCase.fn();

        // Run suite-level afterEach hooks
        for (const hook of suite.afterEachFns) {
          await hook();
        }
        // Run global afterEach hooks
        for (const hook of globalAfterEach) {
          await hook();
        }
      } catch (err: any) {
        passed = false;
        errorMsg = err?.message || String(err);
        stackTrace = err?.stack;
      }

      const durationMs = Date.now() - testStart;
      const result: TestResult = {
        suite: suite.name,
        name: testCase.name,
        tier: suite.tier,
        featureId: suite.featureId,
        passed,
        durationMs,
        error: errorMsg,
        stack: stackTrace,
      };
      results.push(result);

      if (!options.json) {
        if (passed) {
          if (options.verbose) {
            console.log(`    ${GREEN}✔${RESET} ${testCase.name} ${GRAY}(${durationMs}ms)${RESET}`);
          } else {
            process.stdout.write(`${GREEN}.${RESET}`);
          }
        } else {
          if (!options.verbose) {
            process.stdout.write(`\n`);
          }
          console.log(`    ${RED}✘ FAIL: ${testCase.name}${RESET} ${GRAY}(${durationMs}ms)${RESET}`);
          console.log(`      ${RED}Error:${RESET} ${errorMsg}`);
          if (stackTrace) {
            console.log(`      ${GRAY}${stackTrace.split('\n').slice(1, 4).join('\n      ')}${RESET}`);
          }
        }
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalCount = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          total: totalCount,
          passed: passedCount,
          failed: failedCount,
          durationMs: totalDuration,
          results,
        },
        null,
        2
      )
    );
  } else {
    console.log(`\n\n${BOLD}${CYAN}========================================================================${RESET}`);
    console.log(`${BOLD}   TEST RUN SUMMARY   ${RESET}`);
    console.log(`${BOLD}${CYAN}========================================================================${RESET}`);

    // Tier Breakdown
    const tierCounts: Record<number, { total: number; passed: number; failed: number }> = {
      1: { total: 0, passed: 0, failed: 0 },
      2: { total: 0, passed: 0, failed: 0 },
      3: { total: 0, passed: 0, failed: 0 },
      4: { total: 0, passed: 0, failed: 0 },
    };

    for (const r of results) {
      tierCounts[r.tier].total++;
      if (r.passed) tierCounts[r.tier].passed++;
      else tierCounts[r.tier].failed++;
    }

    console.log(`\n  Tier 1 (Feature Happy Paths) : ${tierCounts[1].passed}/${tierCounts[1].total} passed`);
    console.log(`  Tier 2 (Boundary & Clamps)   : ${tierCounts[2].passed}/${tierCounts[2].total} passed`);
    console.log(`  Tier 3 (Pairwise Combos)     : ${tierCounts[3].passed}/${tierCounts[3].total} passed`);
    console.log(`  Tier 4 (Real Scenarios)      : ${tierCounts[4].passed}/${tierCounts[4].total} passed`);

    console.log(`\n  ${BOLD}Total Tests :${RESET} ${totalCount}`);
    console.log(`  ${BOLD}Passed      :${RESET} ${GREEN}${passedCount}${RESET}`);
    if (failedCount > 0) {
      console.log(`  ${BOLD}Failed      :${RESET} ${RED}${failedCount}${RESET}`);
    }
    console.log(`  ${BOLD}Duration    :${RESET} ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`${BOLD}${CYAN}========================================================================${RESET}`);

    if (failedCount === 0) {
      console.log(`\n${BOLD}${GREEN}🎉 ALL ${totalCount} E2E TESTS PASSED CLEANLY! (100% Pass Rate)${RESET}\n`);
    } else {
      console.log(`\n${BOLD}${RED}❌ ${failedCount} TEST(S) FAILED.${RESET}\n`);
    }
  }

  return failedCount === 0 ? 0 : 1;
}

runSuite()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('Runner Fatal Error:', err);
    process.exit(1);
  });
