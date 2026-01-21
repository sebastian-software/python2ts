import { describe, it, expect } from "vitest"
import * as random from "./random.js"

describe("random module", () => {
  describe("random()", () => {
    it("should return a number between 0 and 1", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.random()
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(1)
      }
    })
  })

  describe("uniform()", () => {
    it("should return a number in the specified range", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.uniform(5, 10)
        expect(r).toBeGreaterThanOrEqual(5)
        expect(r).toBeLessThanOrEqual(10)
      }
    })
  })

  describe("randInt()", () => {
    it("should return integers in the inclusive range", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randInt(1, 6)
        expect(Number.isInteger(r)).toBe(true)
        expect(r).toBeGreaterThanOrEqual(1)
        expect(r).toBeLessThanOrEqual(6)
      }
    })
  })

  describe("randRange()", () => {
    it("should work with just stop parameter", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randRange(10)
        expect(Number.isInteger(r)).toBe(true)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(10)
      }
    })

    it("should work with start and stop", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randRange(5, 10)
        expect(r).toBeGreaterThanOrEqual(5)
        expect(r).toBeLessThan(10)
      }
    })

    it("should work with step", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randRange(0, 10, 2)
        expect(r % 2).toBe(0)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(10)
      }
    })

    it("should throw for zero step", () => {
      expect(() => random.randRange(0, 10, 0)).toThrow("step cannot be zero")
    })

    it("should throw for empty range", () => {
      expect(() => random.randRange(10, 5)).toThrow("empty range")
    })
  })

  describe("choice()", () => {
    it("should return an element from the sequence", () => {
      const seq = [1, 2, 3, 4, 5]
      for (let i = 0; i < 100; i++) {
        const c = random.choice(seq)
        expect(seq).toContain(c)
      }
    })

    it("should work with strings", () => {
      const s = "abcde"
      for (let i = 0; i < 100; i++) {
        const c = random.choice(s)
        expect(s).toContain(c)
      }
    })

    it("should throw for empty sequence", () => {
      expect(() => random.choice([])).toThrow("empty sequence")
    })
  })

  describe("choices()", () => {
    it("should return k elements with replacement", () => {
      const pop = [1, 2, 3]
      const result = random.choices(pop, { k: 10 })
      expect(result).toHaveLength(10)
      for (const r of result) {
        expect(pop).toContain(r)
      }
    })

    it("should support weights", () => {
      const pop = ["a", "b"]
      const weights = [100, 0]
      const result = random.choices(pop, { weights, k: 10 })
      // With weight 0 for "b", all should be "a"
      for (const r of result) {
        expect(r).toBe("a")
      }
    })

    it("should throw for empty population", () => {
      expect(() => random.choices([])).toThrow("empty population")
    })

    it("should throw for mismatched weights", () => {
      expect(() => random.choices([1, 2, 3], { weights: [1, 2] })).toThrow("same length")
    })
  })

  describe("sample()", () => {
    it("should return k unique elements", () => {
      const pop = [1, 2, 3, 4, 5]
      const result = random.sample(pop, 3)
      expect(result).toHaveLength(3)
      expect(new Set(result).size).toBe(3) // All unique
      for (const r of result) {
        expect(pop).toContain(r)
      }
    })

    it("should throw for k > population size", () => {
      expect(() => random.sample([1, 2], 5)).toThrow("larger than population")
    })

    it("should throw for negative k", () => {
      expect(() => random.sample([1, 2, 3], -1)).toThrow("negative")
    })
  })

  describe("shuffle()", () => {
    it("should shuffle array in place", () => {
      const arr = [1, 2, 3, 4, 5]
      const original = [...arr]
      random.shuffle(arr)
      expect(arr.sort()).toEqual(original.sort()) // Same elements
    })
  })

  describe("gauss() / normalVariate()", () => {
    it("should return numbers centered around mu", () => {
      const samples = Array.from({ length: 1000 }, () => random.gauss(0, 1))
      const mean = samples.reduce((a, b) => a + b) / samples.length
      expect(Math.abs(mean)).toBeLessThan(0.2) // Should be close to 0
    })

    it("normalVariate should be an alias for gauss", () => {
      expect(random.normalVariate).toBe(random.gauss)
    })
  })

  describe("triangular()", () => {
    it("should return numbers in range [low, high]", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.triangular(0, 10)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(10)
      }
    })

    it("should support custom mode", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.triangular(0, 10, 2)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(10)
      }
    })
  })

  describe("expoVariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.expoVariate(1)
        expect(r).toBeGreaterThan(0)
      }
    })
  })

  describe("gammaVariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.gammaVariate(2, 1)
        expect(r).toBeGreaterThan(0)
      }
    })

    it("should work with alpha <= 1", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.gammaVariate(0.5, 1)
        expect(r).toBeGreaterThan(0)
      }
    })

    it("should throw for invalid parameters", () => {
      expect(() => random.gammaVariate(0, 1)).toThrow()
      expect(() => random.gammaVariate(1, 0)).toThrow()
    })
  })

  describe("betaVariate()", () => {
    it("should return numbers in [0, 1]", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.betaVariate(2, 5)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(1)
      }
    })
  })

  describe("logNormVariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.logNormVariate(0, 1)
        expect(r).toBeGreaterThan(0)
      }
    })
  })

  describe("vonMisesVariate()", () => {
    it("should return numbers (circular distribution)", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.vonMisesVariate(0, 1)
        expect(typeof r).toBe("number")
        expect(Number.isFinite(r)).toBe(true)
      }
    })

    it("should handle very small kappa (uniform on circle)", () => {
      for (let i = 0; i < 10; i++) {
        const r = random.vonMisesVariate(0, 0)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(2 * Math.PI)
      }
    })
  })

  describe("paretoVariate()", () => {
    it("should return numbers >= 1", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.paretoVariate(2)
        expect(r).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe("weibullVariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.weibullVariate(1, 1)
        expect(r).toBeGreaterThan(0)
      }
    })
  })
})
