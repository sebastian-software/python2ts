import { describe, it, expect } from "vitest"
import * as math from "./math.js"

describe("math module", () => {
  describe("constants", () => {
    it("should export pi", () => {
      expect(math.pi).toBeCloseTo(Math.PI)
    })

    it("should export e", () => {
      expect(math.e).toBeCloseTo(Math.E)
    })

    it("should export tau", () => {
      expect(math.tau).toBeCloseTo(2 * Math.PI)
    })

    it("should export inf", () => {
      expect(math.inf).toBe(Infinity)
    })

    it("should export nan", () => {
      expect(Number.isNaN(math.nan)).toBe(true)
    })
  })

  describe("basic functions", () => {
    it("sqrt should calculate square root", () => {
      expect(math.sqrt(16)).toBe(4)
      expect(math.sqrt(2)).toBeCloseTo(1.414, 3)
    })

    it("pow should calculate power", () => {
      expect(math.pow(2, 3)).toBe(8)
      expect(math.pow(10, -1)).toBeCloseTo(0.1)
    })

    it("exp should calculate e^x", () => {
      expect(math.exp(0)).toBe(1)
      expect(math.exp(1)).toBeCloseTo(Math.E)
    })

    it("log should calculate natural log", () => {
      expect(math.log(1)).toBe(0)
      expect(math.log(Math.E)).toBeCloseTo(1)
    })

    it("log10 should calculate base-10 log", () => {
      expect(math.log10(100)).toBeCloseTo(2)
    })

    it("log2 should calculate base-2 log", () => {
      expect(math.log2(8)).toBeCloseTo(3)
    })
  })

  describe("trigonometric functions", () => {
    it("sin should calculate sine", () => {
      expect(math.sin(0)).toBeCloseTo(0)
      expect(math.sin(math.pi / 2)).toBeCloseTo(1)
    })

    it("cos should calculate cosine", () => {
      expect(math.cos(0)).toBeCloseTo(1)
      expect(math.cos(math.pi)).toBeCloseTo(-1)
    })

    it("tan should calculate tangent", () => {
      expect(math.tan(0)).toBeCloseTo(0)
    })

    it("asin should calculate arc sine", () => {
      expect(math.asin(0)).toBeCloseTo(0)
      expect(math.asin(1)).toBeCloseTo(math.pi / 2)
    })

    it("acos should calculate arc cosine", () => {
      expect(math.acos(1)).toBeCloseTo(0)
    })

    it("atan should calculate arc tangent", () => {
      expect(math.atan(0)).toBeCloseTo(0)
    })

    it("atan2 should calculate 2-argument arc tangent", () => {
      expect(math.atan2(1, 1)).toBeCloseTo(math.pi / 4)
    })
  })

  describe("hyperbolic functions", () => {
    it("sinh should calculate hyperbolic sine", () => {
      expect(math.sinh(0)).toBeCloseTo(0)
    })

    it("cosh should calculate hyperbolic cosine", () => {
      expect(math.cosh(0)).toBeCloseTo(1)
    })

    it("tanh should calculate hyperbolic tangent", () => {
      expect(math.tanh(0)).toBeCloseTo(0)
    })

    it("asinh should calculate inverse hyperbolic sine", () => {
      expect(math.asinh(0)).toBeCloseTo(0)
    })

    it("acosh should calculate inverse hyperbolic cosine", () => {
      expect(math.acosh(1)).toBeCloseTo(0)
    })

    it("atanh should calculate inverse hyperbolic tangent", () => {
      expect(math.atanh(0)).toBeCloseTo(0)
    })
  })

  describe("number theory", () => {
    it("factorial should calculate factorial", () => {
      expect(math.factorial(0)).toBe(1)
      expect(math.factorial(5)).toBe(120)
    })

    it("factorial should throw for negative numbers", () => {
      expect(() => math.factorial(-1)).toThrow()
    })

    it("factorial handles non-integer input", () => {
      // factorial truncates to integer
      expect(math.factorial(1.5)).toBe(1)
    })

    it("gcd should calculate greatest common divisor", () => {
      expect(math.gcd(12, 8)).toBe(4)
      expect(math.gcd(17, 13)).toBe(1)
    })

    it("lcm should calculate least common multiple", () => {
      expect(math.lcm(4, 6)).toBe(12)
      expect(math.lcm(3, 5)).toBe(15)
    })
  })

  describe("rounding and special functions", () => {
    it("floor should round down", () => {
      expect(math.floor(3.7)).toBe(3)
      expect(math.floor(-3.7)).toBe(-4)
    })

    it("ceil should round up", () => {
      expect(math.ceil(3.2)).toBe(4)
      expect(math.ceil(-3.2)).toBe(-3)
    })

    it("trunc should truncate toward zero", () => {
      expect(math.trunc(3.7)).toBe(3)
      expect(math.trunc(-3.7)).toBe(-3)
    })

    it("fabs should return absolute value", () => {
      expect(math.fabs(-5)).toBe(5)
      expect(math.fabs(5)).toBe(5)
    })

    it("copysign should copy sign", () => {
      expect(math.copysign(3, -1)).toBe(-3)
      expect(math.copysign(-3, 1)).toBe(3)
    })

    it("modf should split into integer and fractional parts", () => {
      const [frac, int] = math.modf(3.5)
      expect(frac).toBeCloseTo(0.5)
      expect(int).toBe(3)
    })
  })

  describe("special values", () => {
    it("isfinite should check if finite", () => {
      expect(math.isfinite(1)).toBe(true)
      expect(math.isfinite(Infinity)).toBe(false)
      expect(math.isfinite(NaN)).toBe(false)
    })

    it("isinf should check if infinite", () => {
      expect(math.isinf(Infinity)).toBe(true)
      expect(math.isinf(-Infinity)).toBe(true)
      expect(math.isinf(1)).toBe(false)
    })

    it("isnan should check if NaN", () => {
      expect(math.isnan(NaN)).toBe(true)
      expect(math.isnan(1)).toBe(false)
    })
  })

  describe("additional functions", () => {
    it("degrees should convert radians to degrees", () => {
      expect(math.degrees(math.pi)).toBeCloseTo(180)
    })

    it("radians should convert degrees to radians", () => {
      expect(math.radians(180)).toBeCloseTo(math.pi)
    })

    it("hypot should calculate hypotenuse", () => {
      expect(math.hypot(3, 4)).toBeCloseTo(5)
    })

    it("isclose should check approximate equality", () => {
      expect(math.isclose(1.0, 1.0000000001)).toBe(true)
      expect(math.isclose(1.0, 1.1)).toBe(false)
    })

    it("prod should calculate product", () => {
      expect(math.prod([1, 2, 3, 4])).toBe(24)
      expect(math.prod([])).toBe(1)
    })

    it("fsum should calculate precise sum", () => {
      expect(math.fsum([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1])).toBeCloseTo(1)
    })

    it("cbrt should calculate cube root", () => {
      expect(math.cbrt(27)).toBe(3)
      expect(math.cbrt(8)).toBe(2)
    })

    it("expm1 should calculate e^x - 1", () => {
      expect(math.expm1(0)).toBe(0)
      expect(math.expm1(1)).toBeCloseTo(Math.E - 1)
    })

    it("log1p should calculate log(1+x)", () => {
      expect(math.log1p(0)).toBe(0)
      expect(math.log1p(Math.E - 1)).toBeCloseTo(1)
    })
  })
})
