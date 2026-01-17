import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { math } from "pythonlib"

describe("E2E: math module", () => {
  describe("Import Handling", () => {
    it("should strip import math", () => {
      const result = transpile("import math", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from math import", () => {
      const result = transpile("from math import sqrt, pi", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform math.sqrt", () => {
      const result = transpile("x = math.sqrt(16)", { includeRuntime: false })
      expect(result).toContain("math.sqrt(16)")
    })

    it("should transform math.floor and math.ceil", () => {
      const result = transpile("a = math.floor(3.7)\nb = math.ceil(3.2)", {
        includeRuntime: false
      })
      expect(result).toContain("math.floor(3.7)")
      expect(result).toContain("math.ceil(3.2)")
    })

    it("should transform math constants", () => {
      const result = transpile("x = math.pi\ny = math.e", { includeRuntime: false })
      expect(result).toContain("math.pi")
      expect(result).toContain("math.e")
    })

    it("should transform trigonometric functions", () => {
      const result = transpile("a = math.sin(x)\nb = math.cos(x)\nc = math.tan(x)", {
        includeRuntime: false
      })
      expect(result).toContain("math.sin(x)")
      expect(result).toContain("math.cos(x)")
      expect(result).toContain("math.tan(x)")
    })
  })

  describe("Runtime Functions", () => {
    it("math.sqrt should compute square root", () => {
      expect(math.sqrt(16)).toBe(4)
      expect(math.sqrt(2)).toBeCloseTo(1.4142, 4)
    })

    it("math.floor should round down", () => {
      expect(math.floor(3.7)).toBe(3)
      expect(math.floor(-3.2)).toBe(-4)
    })

    it("math.ceil should round up", () => {
      expect(math.ceil(3.2)).toBe(4)
      expect(math.ceil(-3.7)).toBe(-3)
    })

    it("math.pi should equal Math.PI", () => {
      expect(math.pi).toBe(Math.PI)
    })

    it("math.e should equal Math.E", () => {
      expect(math.e).toBe(Math.E)
    })

    it("math.pow should compute powers", () => {
      expect(math.pow(2, 3)).toBe(8)
      expect(math.pow(2, 0.5)).toBeCloseTo(1.4142, 4)
    })

    it("math.log should compute logarithms", () => {
      expect(math.log(Math.E)).toBeCloseTo(1, 10)
      expect(math.log(100, 10)).toBeCloseTo(2, 10)
    })

    it("math.factorial should compute factorials", () => {
      expect(math.factorial(0)).toBe(1)
      expect(math.factorial(5)).toBe(120)
      expect(math.factorial(10)).toBe(3628800)
    })

    it("math.gcd should compute greatest common divisor", () => {
      expect(math.gcd(12, 8)).toBe(4)
      expect(math.gcd(17, 5)).toBe(1)
    })

    it("math.lcm should compute least common multiple", () => {
      expect(math.lcm(4, 6)).toBe(12)
      expect(math.lcm(3, 5)).toBe(15)
    })

    it("math.degrees and radians should convert", () => {
      expect(math.degrees(Math.PI)).toBeCloseTo(180, 10)
      expect(math.radians(180)).toBeCloseTo(Math.PI, 10)
    })

    it("math.isfinite, isinf, isnan should work", () => {
      expect(math.isfinite(1.0)).toBe(true)
      expect(math.isfinite(Infinity)).toBe(false)
      expect(math.isinf(Infinity)).toBe(true)
      expect(math.isinf(1.0)).toBe(false)
      expect(math.isnan(NaN)).toBe(true)
      expect(math.isnan(1.0)).toBe(false)
    })

    it("math.hypot should compute Euclidean norm", () => {
      expect(math.hypot(3, 4)).toBe(5)
      expect(math.hypot(1, 1, 1)).toBeCloseTo(1.732, 3)
    })

    it("math.trunc should truncate toward zero", () => {
      expect(math.trunc(3.7)).toBe(3)
      expect(math.trunc(-3.7)).toBe(-3)
    })
  })
})
