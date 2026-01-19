/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-plus-operands */
import { describe, it, expect } from "vitest"
import * as random from "../packages/pythonlib/src/random"
import * as math from "../packages/pythonlib/src/math"
import * as datetime from "../packages/pythonlib/src/datetime"
import * as json from "../packages/pythonlib/src/json"
import * as re from "../packages/pythonlib/src/re"
import * as functools from "../packages/pythonlib/src/functools"
import * as os from "../packages/pythonlib/src/os"
import * as string from "../packages/pythonlib/src/string"
import * as itertools from "../packages/pythonlib/src/itertools"

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

describe("datetime module", () => {
  describe("date class", () => {
    it("should create a date", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.year).toBe(2024)
      expect(d.month).toBe(1)
      expect(d.day).toBe(15)
    })

    it("should format with strftime", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.strftime("%Y-%m-%d")).toBe("2024-01-15")
    })

    it("should get today", () => {
      const today = datetime.date.today()
      expect(today.year).toBeGreaterThan(2020)
    })

    it("should get weekday", () => {
      const d = new datetime.date(2024, 1, 1) // Monday
      expect(d.weekday()).toBe(0)
    })

    it("should get isoWeekday", () => {
      const d = new datetime.date(2024, 1, 1) // Monday
      expect(d.isoWeekday()).toBe(1)
    })

    it("should get isoFormat", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.isoFormat()).toBe("2024-01-15")
    })

    it("should replace parts", () => {
      const d = new datetime.date(2024, 1, 15)
      const d2 = d.replace({ month: 6 })
      expect(d2.month).toBe(6)
    })
  })

  describe("time class", () => {
    it("should create a time", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })

    it("should format with strftime", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.strftime("%H:%M:%S")).toBe("14:30:45")
    })

    it("should get isoFormat", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.isoFormat()).toBe("14:30:45")
    })

    it("should replace parts", () => {
      const t = new datetime.time(14, 30, 45)
      const t2 = t.replace({ hour: 10 })
      expect(t2.hour).toBe(10)
    })
  })

  describe("datetime class", () => {
    it("should create a datetime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should get now", () => {
      const now = datetime.datetime.now()
      expect(now.year).toBeGreaterThan(2020)
    })

    it("should format with strftime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%Y-%m-%d %H:%M:%S")).toBe("2024-01-15 14:30:45")
    })

    it("should get isoFormat", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.isoFormat()).toContain("2024-01-15")
    })

    it("should extract date", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const d = dt.date()
      expect(d.year).toBe(2024)
      expect(d.month).toBe(1)
    })

    it("should extract time", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const t = dt.time()
      expect(t.hour).toBe(14)
    })

    it("should get timestamp", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      const ts = dt.timestamp()
      expect(ts).toBeGreaterThan(0)
    })

    it("should parse from isoFormat", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-01-15T14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should combine date and time", () => {
      const d = new datetime.date(2024, 1, 15)
      const t = new datetime.time(14, 30)
      const dt = datetime.datetime.combine(d, t)
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })
  })

  describe("timedelta class", () => {
    it("should create a timedelta", () => {
      const td = new datetime.timedelta({ days: 1, hours: 2 })
      expect(td.totalSeconds()).toBe(86400 + 7200)
    })

    it("should handle negative values", () => {
      const td = new datetime.timedelta({ days: -1 })
      expect(td.totalSeconds()).toBe(-86400)
    })

    it("should add timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 1 })
      const td2 = new datetime.timedelta({ hours: 12 })
      const result = td1.add(td2)
      expect(result.totalSeconds()).toBe(86400 + 43200)
    })

    it("should subtract timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 2 })
      const td2 = new datetime.timedelta({ days: 1 })
      const result = td1.subtract(td2)
      expect(result.totalSeconds()).toBe(86400)
    })

    it("should multiply timedelta", () => {
      const td = new datetime.timedelta({ days: 1 })
      const result = td.multiply(2)
      expect(result.totalSeconds()).toBe(86400 * 2)
    })

    it("should convert to string", () => {
      const td1 = new datetime.timedelta({ days: 1, hours: 2, minutes: 30 })
      expect(td1.toString()).toContain("1 day")
      const td2 = new datetime.timedelta({ days: 2 })
      expect(td2.toString()).toContain("2 days")
      const td3 = new datetime.timedelta({ microseconds: 500000 })
      expect(td3.toString()).toContain(".")
    })

    it("should handle weeks and milliseconds", () => {
      const td = new datetime.timedelta({ weeks: 1, milliseconds: 500 })
      expect(td.days).toBe(7)
      expect(td.microseconds).toBe(500000)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.timedelta.min.days).toBe(-999999999)
      expect(datetime.timedelta.max.days).toBe(999999999)
      expect(datetime.timedelta.resolution.microseconds).toBe(1)
    })
  })

  describe("date class - extended", () => {
    it("should create from timestamp", () => {
      const d = datetime.date.fromTimestamp(1705363200) // 2024-01-16
      expect(d.year).toBe(2024)
    })

    it("should create from isoFormat", () => {
      const d = datetime.date.fromIsoFormat("2024-06-15")
      expect(d.year).toBe(2024)
      expect(d.month).toBe(6)
      expect(d.day).toBe(15)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.date.fromIsoFormat("invalid")).toThrow()
    })

    it("should convert to/from ordinal", () => {
      const d = new datetime.date(2024, 1, 15)
      const ordinal = d.toOrdinal()
      expect(ordinal).toBeGreaterThan(0)
      const d2 = datetime.date.fromOrdinal(ordinal)
      expect(d2.year).toBe(d.year)
    })

    it("should get isoCalendar", () => {
      // Use a date that's clearly in the middle of the year
      const d = new datetime.date(2024, 6, 15)
      const [year, week, weekday] = d.isoCalendar()
      expect(year).toBe(2024)
      expect(week).toBeGreaterThan(0)
      expect(weekday).toBeGreaterThanOrEqual(1)
      expect(weekday).toBeLessThanOrEqual(7)
    })

    it("should handle isoCalendar edge cases", () => {
      // Early January that belongs to previous year's week
      const d1 = new datetime.date(2021, 1, 1) // Friday of week 53 of 2020
      const [year1] = d1.isoCalendar()
      expect(year1).toBeLessThanOrEqual(2021)

      // Late December that belongs to next year's week
      const d2 = new datetime.date(2020, 12, 31)
      const [year2, week2] = d2.isoCalendar()
      expect(week2).toBeGreaterThan(50)
      expect(year2).toBeGreaterThanOrEqual(2020)
    })

    it("should add timedelta", () => {
      const d = new datetime.date(2024, 1, 15)
      const td = new datetime.timedelta({ days: 10 })
      const result = d.__add__(td)
      expect(result.day).toBe(25)
    })

    it("should subtract timedelta", () => {
      const d = new datetime.date(2024, 1, 15)
      const td = new datetime.timedelta({ days: 5 })
      const result = d.__sub__(td)
      expect(result instanceof datetime.date).toBe(true)
      expect((result as datetime.date).day).toBe(10)
    })

    it("should subtract dates", () => {
      const d1 = new datetime.date(2024, 1, 15)
      const d2 = new datetime.date(2024, 1, 10)
      const result = d1.__sub__(d2)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).days).toBe(5)
    })

    it("should compare dates", () => {
      const d1 = new datetime.date(2024, 1, 15)
      const d2 = new datetime.date(2024, 1, 10)
      const d3 = new datetime.date(2024, 1, 15)
      expect(d1.__gt__(d2)).toBe(true)
      expect(d1.__ge__(d2)).toBe(true)
      expect(d2.__lt__(d1)).toBe(true)
      expect(d2.__le__(d1)).toBe(true)
      expect(d1.__eq__(d3)).toBe(true)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.date.min.year).toBe(1)
      expect(datetime.date.max.year).toBe(9999)
      expect(datetime.date.resolution.days).toBe(1)
    })

    it("should validate month range", () => {
      expect(() => new datetime.date(2024, 0, 1)).toThrow("month must be in 1..12")
      expect(() => new datetime.date(2024, 13, 1)).toThrow("month must be in 1..12")
    })

    it("should validate day range", () => {
      expect(() => new datetime.date(2024, 2, 30)).toThrow("day is out of range")
    })
  })

  describe("time class - extended", () => {
    it("should create from isoFormat", () => {
      const t = datetime.time.fromIsoFormat("14:30:45")
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })

    it("should parse microseconds in isoFormat", () => {
      const t = datetime.time.fromIsoFormat("14:30:45.123456")
      expect(t.microsecond).toBe(123456)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.time.fromIsoFormat("invalid")).toThrow()
    })

    it("should format with different timespec", () => {
      const t = new datetime.time(14, 30, 45, 123456)
      expect(t.isoFormat("hours")).toBe("14")
      expect(t.isoFormat("minutes")).toBe("14:30")
      expect(t.isoFormat("seconds")).toBe("14:30:45")
      expect(t.isoFormat("milliseconds")).toBe("14:30:45.123")
      expect(t.isoFormat("microseconds")).toBe("14:30:45.123456")
    })

    it("should convert to string", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.toString()).toBe("14:30:45")
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.time.min.hour).toBe(0)
      expect(datetime.time.max.hour).toBe(23)
      expect(datetime.time.resolution.microseconds).toBe(1)
    })

    it("should validate ranges", () => {
      expect(() => new datetime.time(24, 0, 0)).toThrow("hour must be in 0..23")
      expect(() => new datetime.time(0, 60, 0)).toThrow("minute must be in 0..59")
      expect(() => new datetime.time(0, 0, 60)).toThrow("second must be in 0..59")
      expect(() => new datetime.time(0, 0, 0, 1000000)).toThrow("microsecond must be in 0..999999")
    })
  })

  describe("datetime class - extended", () => {
    it("should get today (datetime)", () => {
      const today = datetime.datetime.today()
      expect(today.year).toBeGreaterThan(2020)
    })

    it("should get utcNow", () => {
      const utcNow = datetime.datetime.utcNow()
      expect(utcNow.year).toBeGreaterThan(2020)
    })

    it("should create from timestamp", () => {
      const dt = datetime.datetime.fromTimestamp(1705363200)
      expect(dt.year).toBe(2024)
    })

    it("should create from UTC timestamp", () => {
      const dt = datetime.datetime.utcfromTimestamp(1705363200)
      expect(dt.year).toBe(2024)
    })

    it("should parse date-only isoFormat", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(0)
    })

    it("should parse isoFormat with space separator", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15 14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should parse isoFormat with microseconds", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15T14:30:45.123456")
      expect(dt.microsecond).toBe(123456)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.datetime.fromIsoFormat("invalid")).toThrow()
    })

    it("should replace parts", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const dt2 = dt.replace({ year: 2025, hour: 10 })
      expect(dt2.year).toBe(2025)
      expect(dt2.hour).toBe(10)
    })

    it("should get ctime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45) // Monday
      const ctime = dt.ctime()
      expect(ctime).toContain("Mon")
      expect(ctime).toContain("Jan")
      expect(ctime).toContain("2024")
    })

    it("should format isoFormat with custom separator", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.isoFormat(" ")).toContain("2024-01-15 14:30:45")
    })

    it("should add timedelta", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const td = new datetime.timedelta({ hours: 6 })
      const result = dt.__add__(td)
      expect(result.hour).toBe(18)
    })

    it("should subtract timedelta", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const td = new datetime.timedelta({ hours: 6 })
      const result = dt.__sub__(td)
      expect(result instanceof datetime.datetime).toBe(true)
      expect((result as datetime.datetime).hour).toBe(6)
    })

    it("should subtract datetime", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const dt2 = new datetime.datetime(2024, 1, 15, 6, 0, 0)
      const result = dt1.__sub__(dt2)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).totalSeconds()).toBe(6 * 3600)
    })

    it("should subtract date from datetime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const d = new datetime.date(2024, 1, 10)
      const result = dt.__sub__(d)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).days).toBe(5)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.datetime.min.year).toBe(1)
      expect(datetime.datetime.max.year).toBe(9999)
      expect(datetime.datetime.resolution.microseconds).toBe(1)
    })

    it("should validate ranges", () => {
      expect(() => new datetime.datetime(2024, 1, 1, 24, 0, 0)).toThrow("hour must be in 0..23")
      expect(() => new datetime.datetime(2024, 1, 1, 0, 60, 0)).toThrow("minute must be in 0..59")
    })

    it("should parse with strptime", () => {
      const dt = datetime.datetime.strptime("2024-01-15", "%Y-%m-%d")
      expect(dt.year).toBe(2024)
      expect(dt.month).toBe(1)
      expect(dt.day).toBe(15)
    })
  })

  describe("strftime extended", () => {
    it("should format weekday names", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0) // Monday
      expect(dt.strftime("%a")).toBe("Mon")
      expect(dt.strftime("%A")).toBe("Monday")
    })

    it("should format month names", () => {
      const dt = new datetime.datetime(2024, 6, 15, 0, 0, 0)
      expect(dt.strftime("%b")).toBe("Jun")
      expect(dt.strftime("%B")).toBe("June")
    })

    it("should format %c (ctime)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%c")).toContain("Mon")
    })

    it("should format %I (12-hour)", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 14, 30, 0)
      expect(dt1.strftime("%I")).toBe("02")
      const dt2 = new datetime.datetime(2024, 1, 15, 0, 30, 0)
      expect(dt2.strftime("%I")).toBe("12")
    })

    it("should format %p (AM/PM)", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 10, 0, 0)
      expect(dt1.strftime("%p")).toBe("AM")
      const dt2 = new datetime.datetime(2024, 1, 15, 14, 0, 0)
      expect(dt2.strftime("%p")).toBe("PM")
    })

    it("should format %j (day of year)", () => {
      const dt = new datetime.datetime(2024, 2, 1, 0, 0, 0)
      expect(dt.strftime("%j")).toBe("032")
    })

    it("should format %w (weekday number)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0) // Monday
      expect(dt.strftime("%w")).toBe("1")
    })

    it("should format %U and %W (week number)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%U")).toMatch(/^\d{2}$/)
      expect(dt.strftime("%W")).toMatch(/^\d{2}$/)
    })

    it("should format %x and %X (locale date/time)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%x")).toBe("01/15/24")
      expect(dt.strftime("%X")).toBe("14:30:45")
    })

    it("should format %y (2-digit year)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%y")).toBe("24")
    })

    it("should format %z and %Z (timezone)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%z")).toBe("")
      expect(dt.strftime("%Z")).toBe("")
    })
  })

  describe("strptime extended", () => {
    it("should parse 2-digit year", () => {
      const dt1 = datetime.datetime.strptime("24-01-15", "%y-%m-%d")
      expect(dt1.year).toBe(2024)
      const dt2 = datetime.datetime.strptime("70-01-15", "%y-%m-%d")
      expect(dt2.year).toBe(1970)
    })

    it("should parse month names", () => {
      const dt1 = datetime.datetime.strptime("Jan 15, 2024", "%b %d, %Y")
      expect(dt1.month).toBe(1)
      const dt2 = datetime.datetime.strptime("January 15, 2024", "%B %d, %Y")
      expect(dt2.month).toBe(1)
    })

    it("should parse time components", () => {
      const dt = datetime.datetime.strptime("14:30:45", "%H:%M:%S")
      expect(dt.hour).toBe(14)
      expect(dt.minute).toBe(30)
      expect(dt.second).toBe(45)
    })

    it("should parse microseconds", () => {
      const dt = datetime.datetime.strptime("14:30:45.123456", "%H:%M:%S.%f")
      expect(dt.microsecond).toBe(123456)
    })

    it("should throw on invalid format", () => {
      expect(() => datetime.datetime.strptime("invalid", "%Y")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%m")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%d")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%H")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%M")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%S")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%f")).toThrow()
      expect(() => datetime.datetime.strptime("xyz", "%b")).toThrow()
    })

    it("should throw on mismatched literal", () => {
      expect(() => datetime.datetime.strptime("2024/01/15", "%Y-%m-%d")).toThrow()
    })
  })
})

describe("json module", () => {
  describe("dumps()", () => {
    it("should serialize objects", () => {
      expect(json.dumps({ a: 1 })).toBe('{"a":1}')
    })

    it("should serialize arrays", () => {
      expect(json.dumps([1, 2, 3])).toBe("[1,2,3]")
    })

    it("should support indent", () => {
      const result = json.dumps({ a: 1 }, { indent: 2 })
      expect(result).toContain("\n")
      expect(result).toContain("  ")
    })

    it("should support sortKeys", () => {
      const result = json.dumps({ b: 2, a: 1 }, { sortKeys: true })
      expect(result.indexOf("a")).toBeLessThan(result.indexOf("b"))
    })

    it("should support separators", () => {
      const result = json.dumps({ a: 1, b: 2 }, { separators: ["; ", " = "] })
      expect(result).toContain(" = ")
    })
  })

  describe("loads()", () => {
    it("should parse objects", () => {
      expect(json.loads('{"a":1}')).toEqual({ a: 1 })
    })

    it("should parse arrays", () => {
      expect(json.loads("[1,2,3]")).toEqual([1, 2, 3])
    })

    it("should parse primitives", () => {
      expect(json.loads("42")).toBe(42)
      expect(json.loads('"hello"')).toBe("hello")
      expect(json.loads("true")).toBe(true)
      expect(json.loads("null")).toBe(null)
    })
  })

  describe("dump()", () => {
    it("should call the file-like write method", () => {
      let written = ""
      const file = { write: (s: string) => (written = s) }
      json.dump({ a: 1 }, file)
      expect(written).toBe('{"a":1}')
    })
  })

  describe("load()", () => {
    it("should call the file-like read method", () => {
      const file = { read: () => '{"a":1}' }
      expect(json.load(file)).toEqual({ a: 1 })
    })
  })

  describe("advanced options", () => {
    it("should support ensureAscii: false", () => {
      const result = json.dumps({ name: "日本語" }, { ensureAscii: false })
      expect(result).toContain("日本語")
    })

    it("should escape non-ASCII by default", () => {
      const result = json.dumps({ name: "日本語" })
      expect(result).toContain("\\u")
    })

    it("should support default function", () => {
      const obj = {
        date: { toJSON: () => "2024-01-15" }
      }
      const result = json.dumps(obj, {
        default: (o) => {
          if (typeof (o as { toJSON?: () => string }).toJSON === "function") {
            return (o as { toJSON: () => string }).toJSON()
          }
          return String(o)
        }
      })
      expect(result).toContain("2024-01-15")
    })

    it("should use sortKeys with nested objects", () => {
      const result = json.dumps({ b: { d: 1, c: 2 }, a: 1 }, { sortKeys: true })
      expect(result.indexOf("a")).toBeLessThan(result.indexOf("b"))
    })

    it("should throw on invalid JSON parse", () => {
      expect(() => json.loads("{invalid}")).toThrow("JSON decode error")
    })
  })
})

describe("re module", () => {
  describe("search()", () => {
    it("should find a match", () => {
      const m = re.search("world", "hello world")
      expect(m).not.toBeNull()
      expect(m?.group(0)).toBe("world")
    })

    it("should return null if no match", () => {
      const m = re.search("xyz", "hello world")
      expect(m).toBeNull()
    })

    it("should support named groups", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.group("name")).toBe("user")
      expect(m?.group("domain")).toBe("example")
    })
  })

  describe("match()", () => {
    it("should match at start of string", () => {
      const m = re.match("hello", "hello world")
      expect(m).not.toBeNull()
      expect(m?.group(0)).toBe("hello")
    })

    it("should return null if not at start", () => {
      const m = re.match("world", "hello world")
      expect(m).toBeNull()
    })
  })

  describe("fullMatch()", () => {
    it("should match entire string", () => {
      const m = re.fullMatch("\\d+", "12345")
      expect(m).not.toBeNull()
    })

    it("should return null for partial match", () => {
      const m = re.fullMatch("\\d+", "123abc")
      expect(m).toBeNull()
    })
  })

  describe("findAll()", () => {
    it("should find all matches", () => {
      const matches = re.findAll("\\d+", "a1b2c3")
      expect(matches).toEqual(["1", "2", "3"])
    })

    it("should return empty array for no matches", () => {
      const matches = re.findAll("\\d+", "abc")
      expect(matches).toEqual([])
    })
  })

  describe("findIter()", () => {
    it("should iterate over matches", () => {
      const matches = [...re.findIter("\\d+", "a1b2c3")]
      expect(matches).toHaveLength(3)
      expect(matches[0]?.group(0)).toBe("1")
    })
  })

  describe("split()", () => {
    it("should split by pattern", () => {
      const parts = re.split("[,;]", "a,b;c")
      expect(parts).toEqual(["a", "b", "c"])
    })

    it("should support maxsplit", () => {
      const parts = re.split(",", "a,b,c,d", 2)
      expect(parts).toEqual(["a", "b", "c,d"])
    })
  })

  describe("sub()", () => {
    it("should replace matches", () => {
      expect(re.sub("\\d", "X", "a1b2c3")).toBe("aXbXcX")
    })

    it("should support count", () => {
      expect(re.sub("\\d", "X", "a1b2c3", 2)).toBe("aXbXc3")
    })

    it("should support function replacement", () => {
      const result = re.sub("\\d", (m) => String(parseInt(m.group(0)) * 2), "a1b2c3")
      expect(result).toBe("a2b4c6")
    })
  })

  describe("subn()", () => {
    it("should return replacement count", () => {
      const [result, count] = re.subn("\\d", "X", "a1b2c3")
      expect(result).toBe("aXbXcX")
      expect(count).toBe(3)
    })
  })

  describe("compile()", () => {
    it("should create a compiled pattern", () => {
      const pattern = re.compile("\\d+")
      const m = pattern.search("abc123")
      expect(m?.group(0)).toBe("123")
    })
  })

  describe("escape()", () => {
    it("should escape special characters", () => {
      expect(re.escape("a.b*c?")).toBe("a\\.b\\*c\\?")
    })
  })

  describe("purge()", () => {
    it("should be callable (no-op)", () => {
      expect(() => re.purge()).not.toThrow()
    })
  })

  describe("flags", () => {
    it("should support IGNORECASE", () => {
      const m = re.search("hello", "HELLO WORLD", re.IGNORECASE)
      expect(m).not.toBeNull()
    })

    it("should support MULTILINE", () => {
      const m = re.search("^world", "hello\nworld", re.MULTILINE)
      expect(m).not.toBeNull()
    })

    it("should support DOTALL", () => {
      const m = re.search("a.b", "a\nb", re.DOTALL)
      expect(m).not.toBeNull()
    })

    it("should expose flag aliases", () => {
      expect(re.I).toBe(re.IGNORECASE)
      expect(re.M).toBe(re.MULTILINE)
      expect(re.S).toBe(re.DOTALL)
      expect(re.U).toBe(re.UNICODE)
      expect(re.A).toBe(re.ASCII)
    })
  })

  describe("Match object", () => {
    it("should provide groups()", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      expect(m?.groups()).toEqual(["user", "example"])
    })

    it("should provide groups() with default value", () => {
      const m = re.search("(\\w+)(?:@(\\w+))?", "user")
      const groups = m?.groups("default")
      expect(groups).toBeDefined()
    })

    it("should provide groupDict()", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.groupDict()).toEqual({ name: "user", domain: "example" })
    })

    it("should provide groupDict() with default value", () => {
      const m = re.search("(?<name>\\w+)", "user")
      expect(m?.groupDict("default")).toEqual({ name: "user" })
    })

    it("should provide start() and end()", () => {
      const m = re.search("world", "hello world")
      expect(m?.start()).toBe(6)
      expect(m?.end()).toBe(11)
    })

    it("should provide start/end for groups", () => {
      const m = re.search("(\\w+)@(\\w+)", "test user@example")
      expect(m?.start(1)).toBeGreaterThanOrEqual(0)
      expect(m?.end(1)).toBeGreaterThan(0)
    })

    it("should return -1 for non-matched groups", () => {
      const m = re.search("(a)|(b)", "b")
      expect(m?.start(1)).toBe(-1)
      expect(m?.end(1)).toBe(-1)
    })

    it("should provide span()", () => {
      const m = re.search("world", "hello world")
      const [start, end] = m?.span() ?? [-1, -1]
      expect(start).toBe(6)
      expect(end).toBe(11)
    })

    it("should provide pos and endpos", () => {
      const p = re.compile("\\w+")
      const m = p.search("hello world", 2, 8)
      expect(m?.pos).toBe(2)
      expect(m?.endpos).toBe(8)
    })

    it("should provide lastIndex", () => {
      const m = re.search("(\\w+)(\\d+)", "abc123")
      expect(m?.lastIndex).toBe(2)
    })

    it("should provide lastGroup", () => {
      const m = re.search("(?<word>\\w+)(?<num>\\d+)", "abc123")
      expect(m?.lastGroup).toBe("num")
    })

    it("should provide re property", () => {
      const p = re.compile("\\w+")
      const m = p.search("hello")
      expect(m?.re).toBe(p)
    })

    it("should provide string property", () => {
      const m = re.search("\\w+", "hello world")
      expect(m?.string).toBe("hello world")
    })

    it("should expand templates", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      expect(m?.expand("Name: \\1, Domain: \\2")).toBe("Name: user, Domain: example")
    })

    it("should expand named group templates", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.expand("\\g<name> at \\g<domain>")).toBe("user at example")
    })

    it("should be iterable", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      const parts = [...(m ?? [])]
      expect(parts).toEqual(["user@example", "user", "example"])
    })

    it("should convert to string", () => {
      const m = re.search("world", "hello world")
      expect(m?.toString()).toContain("span=")
      expect(m?.toString()).toContain("match=")
    })
  })

  describe("Pattern object", () => {
    it("should have pattern property", () => {
      const p = re.compile("\\w+")
      expect(p.pattern).toBe("\\w+")
    })

    it("should have flags property", () => {
      const p = re.compile("\\w+", re.IGNORECASE)
      expect(p.flags).toBe(re.IGNORECASE)
    })

    it("should count groups", () => {
      const p = re.compile("(\\w+)@(\\w+)")
      expect(p.groups).toBe(2)
    })

    it("should count named groups", () => {
      const p = re.compile("(?<name>\\w+)@(?<domain>\\w+)")
      expect(p.groups).toBe(2)
    })

    it("should provide groupIndex", () => {
      const p = re.compile("(?<name>\\w+)@(?<domain>\\w+)")
      expect(p.groupIndex).toEqual({ name: 1, domain: 2 })
    })

    it("should convert to string", () => {
      const p = re.compile("\\w+")
      expect(p.toString()).toContain("re.compile")
    })

    it("should support search with pos/endpos", () => {
      const p = re.compile("\\w+")
      const m = p.search("  hello world  ", 2, 7)
      expect(m?.group()).toBe("hello")
    })

    it("should support match with pos/endpos", () => {
      const p = re.compile("\\w+")
      const m = p.match("  hello", 2)
      expect(m?.group()).toBe("hello")
    })

    it("should support fullMatch with pos/endpos", () => {
      const p = re.compile("\\d+")
      const m = p.fullMatch("  123  ", 2, 5)
      expect(m?.group()).toBe("123")
    })

    it("should split with captured groups", () => {
      const p = re.compile("(,)")
      const parts = p.split("a,b,c")
      expect(parts).toContain(",")
    })

    it("should findAll with groups", () => {
      const p = re.compile("(\\w)(\\d)")
      const matches = p.findAll("a1b2c3")
      expect(matches.length).toBe(3)
    })

    it("should findAll returning single group", () => {
      const p = re.compile("(\\w)\\d")
      const matches = p.findAll("a1b2c3")
      expect(matches).toEqual(["a", "b", "c"])
    })

    it("should support findIter with pos/endpos", () => {
      const p = re.compile("\\d+")
      const matches = [...p.findIter("a1b22c333", 2, 7)]
      expect(matches.length).toBeGreaterThan(0)
    })

    it("should support sub with function and count", () => {
      const p = re.compile("\\d")
      let called = 0
      p.sub(
        () => {
          called++
          return "X"
        },
        "a1b2c3",
        2
      )
      expect(called).toBeGreaterThan(0)
    })

    it("should support sub with backreferences", () => {
      const p = re.compile("(\\w+)@(\\w+)")
      const result = p.sub("\\2-\\1", "user@host")
      expect(result).toBe("host-user")
    })

    it("should support sub with limited count", () => {
      const p = re.compile("\\d")
      const result = p.sub("X", "a1b2c3", 1)
      expect(result).toBe("aXb2c3")
    })

    it("should support subn with function", () => {
      const p = re.compile("\\d")
      const [result, count] = p.subn((m) => String(parseInt(m.group(0) ?? "0") * 2), "a1b2")
      expect(result).toBe("a2b4")
      expect(count).toBe(2)
    })

    it("should convert Python named groups to JS", () => {
      const p = re.compile("(?P<name>\\w+)")
      const m = p.search("hello")
      expect(m?.group("name")).toBe("hello")
    })
  })
})

describe("functools module", () => {
  describe("partial()", () => {
    it("should partially apply arguments", () => {
      const add = (a: number, b: number) => a + b
      const add5 = functools.partial(add, 5)
      expect(add5(3)).toBe(8)
    })
  })

  describe("reduce()", () => {
    it("should reduce an iterable", () => {
      const result = functools.reduce((a: number, b: number) => a + b, [1, 2, 3, 4, 5])
      expect(result).toBe(15)
    })

    it("should support initial value", () => {
      const result = functools.reduce((a: number, b: number) => a + b, [1, 2, 3], 10)
      expect(result).toBe(16)
    })

    it("should throw for empty iterable without initial", () => {
      expect(() => functools.reduce((a: number, b: number) => a + b, [])).toThrow()
    })
  })

  describe("lruCache()", () => {
    it("should cache function results", () => {
      let callCount = 0
      const fn = functools.lruCache((n: number) => {
        callCount++
        return n * 2
      })
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1) // Only called once due to cache
    })

    it("should provide cacheInfo", () => {
      const fn = functools.lruCache((n: number) => n * 2)
      fn(1)
      fn(1)
      fn(2)
      const info = fn.cacheInfo()
      expect(info.hits).toBe(1)
      expect(info.misses).toBe(2)
    })

    it("should provide cacheClear", () => {
      const fn = functools.lruCache((n: number) => n * 2)
      fn(1)
      fn.cacheClear()
      const info = fn.cacheInfo()
      expect(info.currsize).toBe(0)
    })
  })

  describe("attrGetter()", () => {
    it("should get attribute from object", () => {
      const getName = functools.attrGetter("name")
      expect(getName({ name: "John" })).toBe("John")
    })

    it("should support nested attributes", () => {
      const getCity = functools.attrGetter("address.city")
      expect(getCity({ address: { city: "NYC" } })).toBe("NYC")
    })

    it("should support multiple attributes", () => {
      const getNameAge = functools.attrGetter("name", "age")
      expect(getNameAge({ name: "John", age: 30 })).toEqual(["John", 30])
    })
  })

  describe("itemGetter()", () => {
    it("should get item from array", () => {
      const getSecond = functools.itemGetter(1)
      expect(getSecond([10, 20, 30])).toBe(20)
    })

    it("should get item from object", () => {
      const getA = functools.itemGetter("a")
      expect(getA({ a: 1, b: 2 })).toBe(1)
    })

    it("should support multiple items", () => {
      const getItems = functools.itemGetter(0, 2)
      expect(getItems([10, 20, 30])).toEqual([10, 30])
    })
  })

  describe("cmpToKey()", () => {
    it("should convert comparison function to key function", () => {
      const cmp = (a: number, b: number) => a - b
      const key = functools.cmpToKey(cmp)
      const arr = [3, 1, 2]
      arr.sort((a, b) => {
        const ka = key(a)
        const kb = key(b)
        // Uses __lt__ for comparison
        if (ka.__lt__(kb)) return -1
        if (kb.__lt__(ka)) return 1
        return 0
      })
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe("pipe()", () => {
    it("should pipe value through functions", () => {
      const result = functools.pipe(
        5,
        (x: number) => x * 2,
        (x: number) => x + 1
      )
      expect(result).toBe(11)
    })

    it("should return value unchanged with no functions", () => {
      expect(functools.pipe(42)).toBe(42)
    })
  })

  describe("cache()", () => {
    it("should cache function results", () => {
      let callCount = 0
      const fn = functools.cache((n: number) => {
        callCount++
        return n * 2
      })
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1)
    })
  })

  describe("identity()", () => {
    it("should return the same value", () => {
      expect(functools.identity(42)).toBe(42)
      expect(functools.identity("hello")).toBe("hello")
    })
  })

  describe("methodCaller()", () => {
    it("should call method on object", () => {
      const splitter = functools.methodCaller("split", ",")
      expect(splitter("a,b,c")).toEqual(["a", "b", "c"])
    })

    it("should throw for non-existent method", () => {
      const caller = functools.methodCaller("nonexistent")
      expect(() => caller({})).toThrow()
    })
  })

  describe("wraps()", () => {
    it("should copy function name", () => {
      function original() {
        return 1
      }
      const wrapped = functools.wraps(original)(() => 2)
      expect(wrapped.name).toBe("original")
    })
  })

  describe("singleDispatch()", () => {
    it("should dispatch based on first argument type", () => {
      const fn = functools.singleDispatch((x: unknown) => `default: ${String(x)}`)
      fn.register("number", (x: unknown) => `number: ${String(x)}`)
      fn.register("string", (x: unknown) => `string: ${String(x)}`)

      expect(fn(42)).toBe("number: 42")
      expect(fn("hello")).toBe("string: hello")
      expect(fn({})).toBe("default: [object Object]")
    })

    it("should handle null and array types", () => {
      const fn = functools.singleDispatch((x: unknown) => `default: ${String(x)}`)
      fn.register("null", () => "null value")
      fn.register("array", () => "array value")

      expect(fn(null)).toBe("null value")
      expect(fn([1, 2, 3])).toBe("array value")
    })

    it("should handle no arguments", () => {
      const fn = functools.singleDispatch(() => "no args")
      expect(fn()).toBe("no args")
    })
  })

  describe("lruCache eviction", () => {
    it("should evict oldest entries when maxsize reached", () => {
      const fn = functools.lruCache((n: number) => n * 2, 2)
      fn(1)
      fn(2)
      fn(3) // Should evict 1
      const info = fn.cacheInfo()
      expect(info.currsize).toBe(2)
    })
  })
})

describe("string module", () => {
  describe("constants", () => {
    it("should have asciiLowercase", () => {
      expect(string.asciiLowercase).toBe("abcdefghijklmnopqrstuvwxyz")
    })

    it("should have asciiUppercase", () => {
      expect(string.asciiUppercase).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("should have asciiLetters", () => {
      expect(string.asciiLetters).toBe(string.asciiLowercase + string.asciiUppercase)
    })

    it("should have digits", () => {
      expect(string.digits).toBe("0123456789")
    })

    it("should have hexDigits", () => {
      expect(string.hexDigits).toBe("0123456789abcdefABCDEF")
    })

    it("should have octDigits", () => {
      expect(string.octDigits).toBe("01234567")
    })

    it("should have punctuation", () => {
      expect(string.punctuation).toContain("!")
      expect(string.punctuation).toContain("@")
    })

    it("should have whitespace", () => {
      expect(string.whitespace).toContain(" ")
      expect(string.whitespace).toContain("\t")
      expect(string.whitespace).toContain("\n")
    })

    it("should have printable", () => {
      expect(string.printable).toContain("a")
      expect(string.printable).toContain("1")
      expect(string.printable).toContain(" ")
    })
  })

  describe("Template", () => {
    it("should substitute variables", () => {
      const t = new string.Template("Hello $name!")
      expect(t.substitute({ name: "World" })).toBe("Hello World!")
    })

    it("should support ${var} syntax", () => {
      const t = new string.Template("Hello ${name}!")
      expect(t.substitute({ name: "World" })).toBe("Hello World!")
    })

    it("should escape $$ as $", () => {
      const t = new string.Template("Price: $$100")
      expect(t.substitute()).toBe("Price: $100")
    })

    it("should throw on missing key", () => {
      const t = new string.Template("Hello $name!")
      expect(() => t.substitute()).toThrow("KeyError")
    })

    it("should safeSubstitute missing keys", () => {
      const t = new string.Template("Hello $name!")
      expect(t.safeSubstitute()).toBe("Hello $name!")
    })

    it("should getIdentifiers", () => {
      const t = new string.Template("$a and ${b} and $c")
      expect(t.getIdentifiers()).toEqual(["a", "b", "c"])
    })
  })

  describe("capWords()", () => {
    it("should capitalize each word", () => {
      expect(string.capWords("hello world")).toBe("Hello World")
    })

    it("should support custom separator", () => {
      expect(string.capWords("hello-world", "-")).toBe("Hello-World")
    })
  })

  describe("string namespace", () => {
    it("join should join strings", () => {
      expect(string.string.join(", ", ["a", "b", "c"])).toBe("a, b, c")
    })

    it("split should split string", () => {
      expect(string.string.split("a,b,c", ",")).toEqual(["a", "b", "c"])
    })

    it("split should handle whitespace default", () => {
      expect(string.string.split("  a  b  c  ")).toEqual(["a", "b", "c"])
    })

    it("split should support maxsplit", () => {
      expect(string.string.split("a,b,c,d", ",", 2)).toEqual(["a", "b", "c,d"])
    })

    it("split on whitespace with maxsplit", () => {
      expect(string.string.split("a b c d", undefined, 2)).toEqual(["a", "b", "c d"])
    })

    it("rSplit should split from right", () => {
      expect(string.string.rSplit("a,b,c,d", ",", 2)).toEqual(["a,b", "c", "d"])
    })

    it("rSplit on whitespace", () => {
      expect(string.string.rSplit("a b c d", undefined, 2)).toEqual(["a b", "c", "d"])
    })

    it("rSplit with maxsplit 0", () => {
      expect(string.string.rSplit("a b c", undefined, 0)).toEqual(["a b c"])
    })

    it("strip should remove characters", () => {
      expect(string.string.strip("  hello  ")).toBe("hello")
      expect(string.string.strip("xxhelloxx", "x")).toBe("hello")
    })

    it("lStrip should remove from left", () => {
      expect(string.string.lStrip("  hello")).toBe("hello")
      expect(string.string.lStrip("xxhello", "x")).toBe("hello")
    })

    it("rStrip should remove from right", () => {
      expect(string.string.rStrip("hello  ")).toBe("hello")
      expect(string.string.rStrip("helloxx", "x")).toBe("hello")
    })

    it("upper/lower should change case", () => {
      expect(string.string.upper("hello")).toBe("HELLO")
      expect(string.string.lower("HELLO")).toBe("hello")
    })

    it("capitalize should capitalize first letter", () => {
      expect(string.string.capitalize("hello WORLD")).toBe("Hello world")
      expect(string.string.capitalize("")).toBe("")
    })

    it("title should title case", () => {
      expect(string.string.title("hello world")).toBe("Hello World")
    })

    it("swapCase should swap case", () => {
      expect(string.string.swapCase("Hello World")).toBe("hELLO wORLD")
    })

    it("startsWith should check prefix", () => {
      expect(string.string.startsWith("hello world", "hello")).toBe(true)
      expect(string.string.startsWith("hello world", "world")).toBe(false)
      expect(string.string.startsWith("hello world", "world", 6)).toBe(true)
    })

    it("endsWith should check suffix", () => {
      expect(string.string.endsWith("hello world", "world")).toBe(true)
      expect(string.string.endsWith("hello world", "hello")).toBe(false)
      expect(string.string.endsWith("hello world", "hello", 0, 5)).toBe(true)
    })

    it("find/rFind should find substring", () => {
      expect(string.string.find("hello", "l")).toBe(2)
      expect(string.string.find("hello", "x")).toBe(-1)
      expect(string.string.rFind("hello", "l")).toBe(3)
      expect(string.string.find("hello world", "o", 5)).toBe(7)
    })

    it("index/rIndex should find or throw", () => {
      expect(string.string.index("hello", "l")).toBe(2)
      expect(() => string.string.index("hello", "x")).toThrow("substring not found")
      expect(string.string.rIndex("hello", "l")).toBe(3)
      expect(() => string.string.rIndex("hello", "x")).toThrow("substring not found")
    })

    it("count should count occurrences", () => {
      expect(string.string.count("hello", "l")).toBe(2)
      expect(string.string.count("hello", "x")).toBe(0)
      expect(string.string.count("hello", "")).toBe(6)
    })

    it("replace should replace substring", () => {
      expect(string.string.replace("hello", "l", "L")).toBe("heLLo")
      expect(string.string.replace("hello", "l", "L", 1)).toBe("heLlo")
    })

    it("zFill should pad with zeros", () => {
      expect(string.string.zFill("42", 5)).toBe("00042")
      expect(string.string.zFill("-42", 5)).toBe("-0042")
      expect(string.string.zFill("+42", 5)).toBe("+0042")
      expect(string.string.zFill("12345", 3)).toBe("12345")
    })

    it("center/lJust/rJust should align", () => {
      expect(string.string.center("hi", 6)).toBe("  hi  ")
      expect(string.string.center("hi", 7, "-")).toBe("--hi---")
      expect(string.string.lJust("hi", 5)).toBe("hi   ")
      expect(string.string.rJust("hi", 5)).toBe("   hi")
      expect(string.string.center("hello", 3)).toBe("hello")
    })

    it("partition/rPartition should split on separator", () => {
      expect(string.string.partition("a=b=c", "=")).toEqual(["a", "=", "b=c"])
      expect(string.string.partition("abc", "=")).toEqual(["abc", "", ""])
      expect(string.string.rPartition("a=b=c", "=")).toEqual(["a=b", "=", "c"])
      expect(string.string.rPartition("abc", "=")).toEqual(["", "", "abc"])
    })

    it("isAlpha/isDigit/isAlnum should check content", () => {
      expect(string.string.isAlpha("abc")).toBe(true)
      expect(string.string.isAlpha("abc123")).toBe(false)
      expect(string.string.isAlpha("")).toBe(false)
      expect(string.string.isDigit("123")).toBe(true)
      expect(string.string.isDigit("12a")).toBe(false)
      expect(string.string.isAlnum("abc123")).toBe(true)
      expect(string.string.isAlnum("abc!")).toBe(false)
    })

    it("isSpace should check whitespace", () => {
      expect(string.string.isSpace("   ")).toBe(true)
      expect(string.string.isSpace("  a  ")).toBe(false)
      expect(string.string.isSpace("")).toBe(false)
    })

    it("isUpper/isLower should check case", () => {
      expect(string.string.isUpper("HELLO")).toBe(true)
      expect(string.string.isUpper("Hello")).toBe(false)
      expect(string.string.isUpper("123")).toBe(false)
      expect(string.string.isLower("hello")).toBe(true)
      expect(string.string.isLower("Hello")).toBe(false)
    })

    it("format should format string", () => {
      expect(string.string.format("{} {}", "hello", "world")).toBe("hello world")
      expect(string.string.format("{0} {1} {0}", "a", "b")).toBe("a b a")
    })
  })
})

describe("itertools module", () => {
  describe("chain()", () => {
    it("should chain iterables", () => {
      expect(itertools.chain([1, 2], [3, 4], [5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe("combinations()", () => {
    it("should return combinations", () => {
      expect(itertools.combinations([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 3]
      ])
    })

    it("should return empty for r > n", () => {
      expect(itertools.combinations([1, 2], 3)).toEqual([])
    })

    it("should return empty for negative r", () => {
      expect(itertools.combinations([1, 2], -1)).toEqual([])
    })
  })

  describe("permutations()", () => {
    it("should return permutations", () => {
      expect(itertools.permutations([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2]
      ])
    })

    it("should default to full length", () => {
      expect(itertools.permutations([1, 2])).toEqual([
        [1, 2],
        [2, 1]
      ])
    })
  })

  describe("product()", () => {
    it("should return cartesian product", () => {
      expect(itertools.product([1, 2], ["a", "b"])).toEqual([
        [1, "a"],
        [1, "b"],
        [2, "a"],
        [2, "b"]
      ])
    })

    it("should return empty array for empty input", () => {
      expect(itertools.product([1, 2], [])).toEqual([])
    })

    it("should return [[]] for no arguments", () => {
      expect(itertools.product()).toEqual([[]])
    })
  })

  describe("cycle()", () => {
    it("should cycle through elements", () => {
      const gen = itertools.cycle([1, 2, 3])
      const result: number[] = []
      for (let i = 0; i < 7; i++) {
        result.push(gen.next().value as number)
      }
      expect(result).toEqual([1, 2, 3, 1, 2, 3, 1])
    })

    it("should handle empty iterable", () => {
      const gen = itertools.cycle([])
      expect(gen.next().done).toBe(true)
    })
  })

  describe("repeat()", () => {
    it("should repeat with count", () => {
      expect(itertools.repeat("x", 3)).toEqual(["x", "x", "x"])
    })

    it("should return infinite generator without count", () => {
      const gen = itertools.repeat("x") as Generator<string>
      const result: string[] = []
      for (let i = 0; i < 5; i++) {
        result.push(gen.next().value as string)
      }
      expect(result).toEqual(["x", "x", "x", "x", "x"])
    })
  })

  describe("islice()", () => {
    it("should slice iterable", () => {
      expect(itertools.islice([1, 2, 3, 4, 5], 1, 4)).toEqual([2, 3, 4])
    })

    it("should handle single argument as stop", () => {
      expect(itertools.islice([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })

    it("should support step", () => {
      expect(itertools.islice([1, 2, 3, 4, 5, 6], 0, 6, 2)).toEqual([1, 3, 5])
    })

    it("should throw for step < 1", () => {
      expect(() => itertools.islice([1, 2, 3], 0, 2, 0)).toThrow()
    })
  })

  describe("takeWhile()", () => {
    it("should take while predicate is true", () => {
      expect(itertools.takeWhile((x: number) => x < 5, [1, 4, 6, 4, 1])).toEqual([1, 4])
    })
  })

  describe("dropWhile()", () => {
    it("should drop while predicate is true", () => {
      expect(itertools.dropWhile((x: number) => x < 5, [1, 4, 6, 4, 1])).toEqual([6, 4, 1])
    })
  })

  describe("zipLongest()", () => {
    it("should zip with fill value", () => {
      expect(itertools.zipLongest([1, 2, 3], ["a", "b"], { fillvalue: "-" })).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "-"]
      ])
    })

    it("should work without options", () => {
      expect(itertools.zipLongest([1, 2], ["a"])).toEqual([
        [1, "a"],
        [2, undefined]
      ])
    })

    it("should return empty for no iterables", () => {
      expect(itertools.zipLongest()).toEqual([])
    })
  })

  describe("compress()", () => {
    it("should compress with selectors", () => {
      expect(itertools.compress([1, 2, 3, 4, 5], [1, 0, 1, 0, 1])).toEqual([1, 3, 5])
    })
  })

  describe("filterFalse()", () => {
    it("should filter falsey values", () => {
      expect(itertools.filterFalse((x: number) => x % 2, [1, 2, 3, 4, 5])).toEqual([2, 4])
    })
  })

  describe("accumulate()", () => {
    it("should accumulate with default sum", () => {
      expect(itertools.accumulate([1, 2, 3, 4, 5])).toEqual([1, 3, 6, 10, 15])
    })

    it("should accumulate with custom function", () => {
      expect(itertools.accumulate([1, 2, 3, 4, 5], (x, y) => x * y)).toEqual([1, 2, 6, 24, 120])
    })

    it("should support initial value", () => {
      expect(itertools.accumulate([1, 2, 3], (x, y) => x + y, 10)).toEqual([10, 11, 13, 16])
    })

    it("should handle empty iterable", () => {
      expect(itertools.accumulate([])).toEqual([])
    })

    it("should return initial for empty iterable with initial", () => {
      expect(itertools.accumulate([], undefined, 10)).toEqual([10])
    })
  })

  describe("groupby()", () => {
    it("should group consecutive elements", () => {
      const result = itertools.groupby([1, 1, 2, 2, 2, 3, 1, 1])
      expect(result).toEqual([
        [1, [1, 1]],
        [2, [2, 2, 2]],
        [3, [3]],
        [1, [1, 1]]
      ])
    })

    it("should support key function", () => {
      const result = itertools.groupby([1, 2, 3, 4, 5], (x) => x % 2)
      expect(result.length).toBe(5)
    })
  })

  describe("count()", () => {
    it("should count from start with step", () => {
      const gen = itertools.count(10, 2)
      const result: number[] = []
      for (let i = 0; i < 5; i++) {
        result.push(gen.next().value as number)
      }
      expect(result).toEqual([10, 12, 14, 16, 18])
    })

    it("should default to 0 and 1", () => {
      const gen = itertools.count()
      expect(gen.next().value).toBe(0)
      expect(gen.next().value).toBe(1)
    })
  })

  describe("tee()", () => {
    it("should create independent copies", () => {
      const [a, b] = itertools.tee([1, 2, 3])
      expect(a).toEqual([1, 2, 3])
      expect(b).toEqual([1, 2, 3])
    })
  })

  describe("pairwise()", () => {
    it("should return overlapping pairs", () => {
      expect(itertools.pairwise([1, 2, 3, 4])).toEqual([
        [1, 2],
        [2, 3],
        [3, 4]
      ])
    })
  })

  describe("productRepeat()", () => {
    it("should repeat product", () => {
      expect(itertools.productRepeat([0, 1], 2)).toEqual([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ])
    })

    it("should return [[]] for repeat 0", () => {
      expect(itertools.productRepeat([1, 2], 0)).toEqual([[]])
    })

    it("should return [] for empty input", () => {
      expect(itertools.productRepeat([], 2)).toEqual([])
    })
  })

  describe("combinationsWithReplacement()", () => {
    it("should return combinations with replacement", () => {
      expect(itertools.combinationsWithReplacement([1, 2, 3], 2)).toEqual([
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 2],
        [2, 3],
        [3, 3]
      ])
    })

    it("should return [[]] for r=0", () => {
      expect(itertools.combinationsWithReplacement([1, 2], 0)).toEqual([[]])
    })

    it("should return [] for empty input with r>0", () => {
      expect(itertools.combinationsWithReplacement([], 2)).toEqual([])
    })
  })

  describe("chunk()", () => {
    it("should split into chunks", () => {
      expect(itertools.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it("should throw for size < 1", () => {
      expect(() => itertools.chunk([1, 2, 3], 0)).toThrow()
    })
  })

  describe("partition()", () => {
    it("should partition by predicate", () => {
      expect(itertools.partition([1, 2, 3, 4], (x) => x % 2 === 0)).toEqual([
        [2, 4],
        [1, 3]
      ])
    })
  })
})

describe("os module", () => {
  describe("path functions", () => {
    it("join should join path components", () => {
      expect(os.path.join("a", "b", "c")).toBe("a/b/c")
      expect(os.path.join("/a", "b")).toBe("/a/b")
    })

    it("basename should return the final component", () => {
      expect(os.path.basename("/path/to/file.txt")).toBe("file.txt")
    })

    it("dirname should return the directory part", () => {
      expect(os.path.dirname("/path/to/file.txt")).toBe("/path/to")
    })

    it("split should split path into head and tail", () => {
      const [head, tail] = os.path.split("/path/to/file.txt")
      expect(head).toBe("/path/to")
      expect(tail).toBe("file.txt")
    })

    it("splitExt should split extension", () => {
      const [root, ext] = os.path.splitExt("/path/to/file.txt")
      expect(root).toBe("/path/to/file")
      expect(ext).toBe(".txt")
    })

    it("isAbs should check if path is absolute", () => {
      expect(os.path.isAbs("/absolute/path")).toBe(true)
      expect(os.path.isAbs("relative/path")).toBe(false)
    })

    it("normPath should normalize path", () => {
      expect(os.path.normPath("a/b/../c")).toBe("a/c")
      expect(os.path.normPath("a//b")).toBe("a/b")
    })

    it("absPath should normalize path", () => {
      const result = os.path.absPath("a/../b")
      expect(result).toBe("b")
    })

    it("relPath should return relative path", () => {
      expect(os.path.relPath("/a/b/c", "/a")).toBe("b/c")
    })

    it("commonPath should return common path prefix", () => {
      expect(os.path.commonPath(["/a/b/c", "/a/b/d"])).toBe("/a/b")
    })
  })

  describe("environment", () => {
    it("getenv should return environment variable or undefined in browser", () => {
      const path = os.getenv("PATH")
      // In Node.js, PATH is defined; in browser, environ is empty
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const isNode = typeof process !== "undefined" && process.env !== undefined
      if (isNode) {
        expect(path).toBeDefined()
      } else {
        expect(path).toBeUndefined()
      }
    })

    it("getenv should return default for missing variable", () => {
      expect(os.getenv("NONEXISTENT_VAR_12345", "default")).toBe("default")
    })

    it("getCwd should return current directory", () => {
      const cwd = os.getCwd()
      expect(typeof cwd).toBe("string")
      expect(cwd.length).toBeGreaterThan(0)
    })
  })

  describe("constants", () => {
    it("should export sep", () => {
      expect(os.sep).toBe("/")
    })

    it("should export lineSep", () => {
      expect(os.lineSep).toBe("\n")
    })

    it("should export name", () => {
      expect(["posix", "nt"]).toContain(os.name)
    })
  })
})
