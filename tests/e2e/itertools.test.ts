import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { itertools } from "pythonlib"

describe("E2E: itertools", () => {
  describe("Transformer", () => {
    it("should strip itertools imports", () => {
      const python = `
from itertools import chain, combinations
`
      const result = transpile(python, { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should transform chain call", () => {
      const python = `
from itertools import chain
result = list(chain([1, 2], [3, 4]))
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/itertools"')
      expect(result).toContain("chain([1, 2], [3, 4])")
    })

    it("should transform combinations call", () => {
      const python = `
from itertools import combinations
result = list(combinations([1, 2, 3], 2))
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/itertools"')
      expect(result).toContain("combinations([1, 2, 3], 2)")
    })

    it("should transform permutations call", () => {
      const python = `
from itertools import permutations
result = list(permutations([1, 2, 3]))
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/itertools"')
      expect(result).toContain("permutations([1, 2, 3])")
    })

    it("should transform product call", () => {
      const python = `
from itertools import product
result = list(product([1, 2], ['a', 'b']))
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/itertools"')
      expect(result).toContain("product([1, 2],")
    })

    it("should transform multiple itertools functions", () => {
      const python = `
from itertools import chain, cycle, repeat, islice, takewhile, dropwhile
`
      const result = transpile(python, { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Runtime - Eager Arrays (ADR-0008)", () => {
    it("chain should concatenate iterables and return array", () => {
      const result = itertools.chain([1, 2], [3, 4])
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it("chain should work with empty iterables", () => {
      const result = itertools.chain([], [1], [], [2, 3])
      expect(result).toEqual([1, 2, 3])
    })

    it("combinations should return array of r-length subsequences", () => {
      const result = itertools.combinations([1, 2, 3], 2)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [2, 3]
      ])
    })

    it("combinations should handle r > n", () => {
      const result = itertools.combinations([1, 2], 3)
      expect(result).toEqual([])
    })

    it("permutations should return array of r-length arrangements", () => {
      const result = itertools.permutations([1, 2, 3], 2)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2]
      ])
    })

    it("permutations should default to full length", () => {
      const result = itertools.permutations([1, 2])
      expect(result).toEqual([
        [1, 2],
        [2, 1]
      ])
    })

    it("product should return array of cartesian product", () => {
      const result = itertools.product([1, 2], ["a", "b"])
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([
        [1, "a"],
        [1, "b"],
        [2, "a"],
        [2, "b"]
      ])
    })

    it("product should handle empty iterables", () => {
      const result = itertools.product([1, 2], [])
      expect(result).toEqual([])
    })

    it("islice should return array", () => {
      const result = itertools.islice([1, 2, 3, 4, 5], 1, 4)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([2, 3, 4])
    })

    it("islice should work with step", () => {
      const result = itertools.islice([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, 10, 2)
      expect(result).toEqual([0, 2, 4, 6, 8])
    })

    it("islice should work with single argument (stop only)", () => {
      const result = itertools.islice([1, 2, 3, 4, 5], 3)
      expect(result).toEqual([1, 2, 3])
    })

    it("takewhile should return array", () => {
      const result = itertools.takewhile((x) => x < 5, [1, 4, 6, 4, 1])
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([1, 4])
    })

    it("dropwhile should return array", () => {
      const result = itertools.dropwhile((x) => x < 5, [1, 4, 6, 4, 1])
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([6, 4, 1])
    })
  })

  describe("Runtime - Infinite Generators (ADR-0008)", () => {
    it("cycle should return a generator (infinite)", () => {
      const cycled = itertools.cycle([1, 2, 3])
      // It's a generator, not an array
      expect(typeof cycled.next).toBe("function")

      const result = []
      for (let i = 0; i < 7; i++) {
        result.push(cycled.next().value)
      }
      expect(result).toEqual([1, 2, 3, 1, 2, 3, 1])
    })

    it("repeat with count should return array", () => {
      const result = itertools.repeat("x", 3)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual(["x", "x", "x"])
    })

    it("repeat with 0 count should return empty array", () => {
      const result = itertools.repeat("x", 0)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([])
    })

    it("repeat without count should return generator (infinite)", () => {
      const repeated = itertools.repeat("x")
      // It's a generator, not an array
      expect(Array.isArray(repeated)).toBe(false)
      expect(typeof (repeated as Generator).next).toBe("function")

      const result = []
      for (let i = 0; i < 5; i++) {
        result.push((repeated as Generator).next().value)
      }
      expect(result).toEqual(["x", "x", "x", "x", "x"])
    })
  })
})
