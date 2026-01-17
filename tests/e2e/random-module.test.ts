import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

describe("E2E: random module", () => {
  describe("Import Handling", () => {
    it("should strip import random", () => {
      const result = transpile("import random", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from random import", () => {
      const result = transpile("from random import randint, choice", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform random.randint", () => {
      const result = transpile("x = random.randint(1, 10)", { includeRuntime: false })
      expect(result).toContain("py.random.randint(1, 10)")
    })

    it("should transform random.choice", () => {
      const result = transpile("x = random.choice([1, 2, 3])", { includeRuntime: false })
      expect(result).toContain("py.random.choice([1, 2, 3])")
    })

    it("should transform random.shuffle", () => {
      const result = transpile("random.shuffle(my_list)", { includeRuntime: false })
      expect(result).toContain("py.random.shuffle(my_list)")
    })
  })

  describe("Runtime Functions", () => {
    it("py.random.random should return value in [0, 1)", () => {
      for (let i = 0; i < 100; i++) {
        const val = py.random.random()
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(1)
      }
    })

    it("py.random.randint should return value in [a, b]", () => {
      for (let i = 0; i < 100; i++) {
        const val = py.random.randint(1, 10)
        expect(val).toBeGreaterThanOrEqual(1)
        expect(val).toBeLessThanOrEqual(10)
        expect(Number.isInteger(val)).toBe(true)
      }
    })

    it("py.random.uniform should return value in [a, b]", () => {
      for (let i = 0; i < 100; i++) {
        const val = py.random.uniform(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThanOrEqual(10)
      }
    })

    it("py.random.choice should return element from sequence", () => {
      const seq = [1, 2, 3, 4, 5]
      for (let i = 0; i < 100; i++) {
        const val = py.random.choice(seq)
        expect(seq).toContain(val)
      }
    })

    it("py.random.choice should work with strings", () => {
      const s = "abc"
      for (let i = 0; i < 100; i++) {
        const val = py.random.choice(s)
        expect("abc").toContain(val)
      }
    })

    it("py.random.choices should return k elements with replacement", () => {
      const seq = [1, 2, 3]
      const result = py.random.choices(seq, { k: 5 })
      expect(result).toHaveLength(5)
      for (const val of result) {
        expect(seq).toContain(val)
      }
    })

    it("py.random.sample should return k unique elements", () => {
      const seq = [1, 2, 3, 4, 5]
      const result = py.random.sample(seq, 3)
      expect(result).toHaveLength(3)
      expect(new Set(result).size).toBe(3) // all unique
      for (const val of result) {
        expect(seq).toContain(val)
      }
    })

    it("py.random.shuffle should shuffle in place", () => {
      const arr = [1, 2, 3, 4, 5]
      const original = [...arr]
      py.random.shuffle(arr)
      expect(arr).toHaveLength(5)
      expect(arr.sort()).toEqual(original.sort())
    })

    it("py.random.randrange should return value in range", () => {
      for (let i = 0; i < 100; i++) {
        const val = py.random.randrange(10)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(10)
      }

      for (let i = 0; i < 100; i++) {
        const val = py.random.randrange(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThan(10)
      }

      for (let i = 0; i < 100; i++) {
        const val = py.random.randrange(0, 10, 2)
        expect(val % 2).toBe(0)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(10)
      }
    })

    it("py.random.gauss should return normal distributed values", () => {
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        values.push(py.random.gauss(0, 1))
      }
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      // Mean should be close to 0
      expect(Math.abs(mean)).toBeLessThan(0.2)
    })

    it("py.random.triangular should return triangular distributed values", () => {
      for (let i = 0; i < 100; i++) {
        const val = py.random.triangular(0, 10)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThanOrEqual(10)
      }
    })
  })
})
