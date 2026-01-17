import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

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
      expect(result).toContain("py.math.sqrt(16)")
    })

    it("should transform math.floor and math.ceil", () => {
      const result = transpile("a = math.floor(3.7)\nb = math.ceil(3.2)", {
        includeRuntime: false
      })
      expect(result).toContain("py.math.floor(3.7)")
      expect(result).toContain("py.math.ceil(3.2)")
    })

    it("should transform math constants", () => {
      const result = transpile("x = math.pi\ny = math.e", { includeRuntime: false })
      expect(result).toContain("py.math.pi")
      expect(result).toContain("py.math.e")
    })

    it("should transform trigonometric functions", () => {
      const result = transpile("a = math.sin(x)\nb = math.cos(x)\nc = math.tan(x)", {
        includeRuntime: false
      })
      expect(result).toContain("py.math.sin(x)")
      expect(result).toContain("py.math.cos(x)")
      expect(result).toContain("py.math.tan(x)")
    })
  })

  describe("Runtime Functions", () => {
    it("py.math.sqrt should compute square root", () => {
      expect(py.math.sqrt(16)).toBe(4)
      expect(py.math.sqrt(2)).toBeCloseTo(1.4142, 4)
    })

    it("py.math.floor should round down", () => {
      expect(py.math.floor(3.7)).toBe(3)
      expect(py.math.floor(-3.2)).toBe(-4)
    })

    it("py.math.ceil should round up", () => {
      expect(py.math.ceil(3.2)).toBe(4)
      expect(py.math.ceil(-3.7)).toBe(-3)
    })

    it("py.math.pi should equal Math.PI", () => {
      expect(py.math.pi).toBe(Math.PI)
    })

    it("py.math.e should equal Math.E", () => {
      expect(py.math.e).toBe(Math.E)
    })

    it("py.math.pow should compute powers", () => {
      expect(py.math.pow(2, 3)).toBe(8)
      expect(py.math.pow(2, 0.5)).toBeCloseTo(1.4142, 4)
    })

    it("py.math.log should compute logarithms", () => {
      expect(py.math.log(Math.E)).toBeCloseTo(1, 10)
      expect(py.math.log(100, 10)).toBeCloseTo(2, 10)
    })

    it("py.math.factorial should compute factorials", () => {
      expect(py.math.factorial(0)).toBe(1)
      expect(py.math.factorial(5)).toBe(120)
      expect(py.math.factorial(10)).toBe(3628800)
    })

    it("py.math.gcd should compute greatest common divisor", () => {
      expect(py.math.gcd(12, 8)).toBe(4)
      expect(py.math.gcd(17, 5)).toBe(1)
    })

    it("py.math.lcm should compute least common multiple", () => {
      expect(py.math.lcm(4, 6)).toBe(12)
      expect(py.math.lcm(3, 5)).toBe(15)
    })

    it("py.math.degrees and radians should convert", () => {
      expect(py.math.degrees(Math.PI)).toBeCloseTo(180, 10)
      expect(py.math.radians(180)).toBeCloseTo(Math.PI, 10)
    })

    it("py.math.isfinite, isinf, isnan should work", () => {
      expect(py.math.isfinite(1.0)).toBe(true)
      expect(py.math.isfinite(Infinity)).toBe(false)
      expect(py.math.isinf(Infinity)).toBe(true)
      expect(py.math.isinf(1.0)).toBe(false)
      expect(py.math.isnan(NaN)).toBe(true)
      expect(py.math.isnan(1.0)).toBe(false)
    })

    it("py.math.hypot should compute Euclidean norm", () => {
      expect(py.math.hypot(3, 4)).toBe(5)
      expect(py.math.hypot(1, 1, 1)).toBeCloseTo(1.732, 3)
    })

    it("py.math.trunc should truncate toward zero", () => {
      expect(py.math.trunc(3.7)).toBe(3)
      expect(py.math.trunc(-3.7)).toBe(-3)
    })
  })
})
