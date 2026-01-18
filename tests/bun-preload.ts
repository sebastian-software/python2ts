/**
 * Bun test preload file
 *
 * Sets up global test functions for Bun's test runner to match Vitest's API.
 * Bun uses its own test runner with similar but not identical globals.
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "bun:test"

// Make these available globally for test files that expect vitest globals
Object.assign(globalThis, {
  describe,
  it,
  test: it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
})
