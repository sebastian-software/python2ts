import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { random } from "pythonlib"

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
      const result = transpile("x = random.randint(1, 10)")
      expect(result).toContain('from "pythonlib/random"')
      expect(result).toContain("randInt(1, 10)")
    })

    it("should transform random.choice", () => {
      const result = transpile("x = random.choice([1, 2, 3])")
      expect(result).toContain('from "pythonlib/random"')
      expect(result).toContain("choice([1, 2, 3])")
    })

    it("should transform random.shuffle", () => {
      const result = transpile("random.shuffle(my_list)")
      expect(result).toContain('from "pythonlib/random"')
      expect(result).toContain("shuffle(my_list)")
    })
  })

  describe("Runtime Functions", () => {
    it("random.random should return value in [0, 1)", () => {
      for (let i = 0; i < 100; i++) {
        const val = random.random()
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(1)
      }
    })

    it("random.randInt should return value in [a, b]", () => {
      for (let i = 0; i < 100; i++) {
        const val = random.randInt(1, 10)
        expect(val).toBeGreaterThanOrEqual(1)
        expect(val).toBeLessThanOrEqual(10)
        expect(Number.isInteger(val)).toBe(true)
      }
    })

    it("random.uniform should return value in [a, b]", () => {
      for (let i = 0; i < 100; i++) {
        const val = random.uniform(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThanOrEqual(10)
      }
    })

    it("random.choice should return element from sequence", () => {
      const seq = [1, 2, 3, 4, 5]
      for (let i = 0; i < 100; i++) {
        const val = random.choice(seq)
        expect(seq).toContain(val)
      }
    })

    it("random.choice should work with strings", () => {
      const s = "abc"
      for (let i = 0; i < 100; i++) {
        const val = random.choice(s)
        expect("abc").toContain(val)
      }
    })

    it("random.choices should return k elements with replacement", () => {
      const seq = [1, 2, 3]
      const result = random.choices(seq, { k: 5 })
      expect(result).toHaveLength(5)
      for (const val of result) {
        expect(seq).toContain(val)
      }
    })

    it("random.sample should return k unique elements", () => {
      const seq = [1, 2, 3, 4, 5]
      const result = random.sample(seq, 3)
      expect(result).toHaveLength(3)
      expect(new Set(result).size).toBe(3) // all unique
      for (const val of result) {
        expect(seq).toContain(val)
      }
    })

    it("random.shuffle should shuffle in place", () => {
      const arr = [1, 2, 3, 4, 5]
      const original = [...arr]
      random.shuffle(arr)
      expect(arr).toHaveLength(5)
      expect(arr.sort()).toEqual(original.sort())
    })

    it("random.randRange should return value in range", () => {
      for (let i = 0; i < 100; i++) {
        const val = random.randRange(10)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(10)
      }

      for (let i = 0; i < 100; i++) {
        const val = random.randRange(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThan(10)
      }

      for (let i = 0; i < 100; i++) {
        const val = random.randRange(0, 10, 2)
        expect(val % 2).toBe(0)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(10)
      }
    })

    it("random.gauss should return normal distributed values", () => {
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        values.push(random.gauss(0, 1))
      }
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      // Mean should be close to 0
      expect(Math.abs(mean)).toBeLessThan(0.2)
    })

    it("random.triangular should return triangular distributed values", () => {
      for (let i = 0; i < 100; i++) {
        const val = random.triangular(0, 10)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThanOrEqual(10)
      }
    })
  })
})
