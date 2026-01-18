/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-plus-operands */
import { describe, it, expect } from "vitest"
import * as random from "../packages/pythonlib/src/random"
import * as math from "../packages/pythonlib/src/math"
import * as datetime from "../packages/pythonlib/src/datetime"
import * as json from "../packages/pythonlib/src/json"
import * as re from "../packages/pythonlib/src/re"
import * as functools from "../packages/pythonlib/src/functools"
import * as os from "../packages/pythonlib/src/os"

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

  describe("randint()", () => {
    it("should return integers in the inclusive range", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randint(1, 6)
        expect(Number.isInteger(r)).toBe(true)
        expect(r).toBeGreaterThanOrEqual(1)
        expect(r).toBeLessThanOrEqual(6)
      }
    })
  })

  describe("randrange()", () => {
    it("should work with just stop parameter", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randrange(10)
        expect(Number.isInteger(r)).toBe(true)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(10)
      }
    })

    it("should work with start and stop", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randrange(5, 10)
        expect(r).toBeGreaterThanOrEqual(5)
        expect(r).toBeLessThan(10)
      }
    })

    it("should work with step", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.randrange(0, 10, 2)
        expect(r % 2).toBe(0)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(10)
      }
    })

    it("should throw for zero step", () => {
      expect(() => random.randrange(0, 10, 0)).toThrow("step cannot be zero")
    })

    it("should throw for empty range", () => {
      expect(() => random.randrange(10, 5)).toThrow("empty range")
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

  describe("gauss() / normalvariate()", () => {
    it("should return numbers centered around mu", () => {
      const samples = Array.from({ length: 1000 }, () => random.gauss(0, 1))
      const mean = samples.reduce((a, b) => a + b) / samples.length
      expect(Math.abs(mean)).toBeLessThan(0.2) // Should be close to 0
    })

    it("normalvariate should be an alias for gauss", () => {
      expect(random.normalvariate).toBe(random.gauss)
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

  describe("expovariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.expovariate(1)
        expect(r).toBeGreaterThan(0)
      }
    })
  })

  describe("gammavariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.gammavariate(2, 1)
        expect(r).toBeGreaterThan(0)
      }
    })

    it("should work with alpha <= 1", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.gammavariate(0.5, 1)
        expect(r).toBeGreaterThan(0)
      }
    })

    it("should throw for invalid parameters", () => {
      expect(() => random.gammavariate(0, 1)).toThrow()
      expect(() => random.gammavariate(1, 0)).toThrow()
    })
  })

  describe("betavariate()", () => {
    it("should return numbers in [0, 1]", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.betavariate(2, 5)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(1)
      }
    })
  })

  describe("lognormvariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.lognormvariate(0, 1)
        expect(r).toBeGreaterThan(0)
      }
    })
  })

  describe("vonmisesvariate()", () => {
    it("should return numbers (circular distribution)", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.vonmisesvariate(0, 1)
        expect(typeof r).toBe("number")
        expect(Number.isFinite(r)).toBe(true)
      }
    })

    it("should handle very small kappa (uniform on circle)", () => {
      for (let i = 0; i < 10; i++) {
        const r = random.vonmisesvariate(0, 0)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(2 * Math.PI)
      }
    })
  })

  describe("paretovariate()", () => {
    it("should return numbers >= 1", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.paretovariate(2)
        expect(r).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe("weibullvariate()", () => {
    it("should return positive numbers", () => {
      for (let i = 0; i < 100; i++) {
        const r = random.weibullvariate(1, 1)
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

    it("should get isoweekday", () => {
      const d = new datetime.date(2024, 1, 1) // Monday
      expect(d.isoweekday()).toBe(1)
    })

    it("should get isoformat", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.isoformat()).toBe("2024-01-15")
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

    it("should get isoformat", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.isoformat()).toBe("14:30:45")
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

    it("should get isoformat", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.isoformat()).toContain("2024-01-15")
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

    it("should parse from isoformat", () => {
      const dt = datetime.datetime.fromisoformat("2024-01-15T14:30:45")
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
      expect(td.total_seconds()).toBe(86400 + 7200)
    })

    it("should handle negative values", () => {
      const td = new datetime.timedelta({ days: -1 })
      expect(td.total_seconds()).toBe(-86400)
    })

    it("should add timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 1 })
      const td2 = new datetime.timedelta({ hours: 12 })
      const result = td1.add(td2)
      expect(result.total_seconds()).toBe(86400 + 43200)
    })

    it("should subtract timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 2 })
      const td2 = new datetime.timedelta({ days: 1 })
      const result = td1.subtract(td2)
      expect(result.total_seconds()).toBe(86400)
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

    it("should support sort_keys", () => {
      const result = json.dumps({ b: 2, a: 1 }, { sort_keys: true })
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

  describe("fullmatch()", () => {
    it("should match entire string", () => {
      const m = re.fullmatch("\\d+", "12345")
      expect(m).not.toBeNull()
    })

    it("should return null for partial match", () => {
      const m = re.fullmatch("\\d+", "123abc")
      expect(m).toBeNull()
    })
  })

  describe("findall()", () => {
    it("should find all matches", () => {
      const matches = re.findall("\\d+", "a1b2c3")
      expect(matches).toEqual(["1", "2", "3"])
    })

    it("should return empty array for no matches", () => {
      const matches = re.findall("\\d+", "abc")
      expect(matches).toEqual([])
    })
  })

  describe("finditer()", () => {
    it("should iterate over matches", () => {
      const matches = [...re.finditer("\\d+", "a1b2c3")]
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

  describe("lru_cache()", () => {
    it("should cache function results", () => {
      let callCount = 0
      const fn = functools.lru_cache((n: number) => {
        callCount++
        return n * 2
      })
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1) // Only called once due to cache
    })

    it("should provide cache_info", () => {
      const fn = functools.lru_cache((n: number) => n * 2)
      fn(1)
      fn(1)
      fn(2)
      const info = fn.cache_info()
      expect(info.hits).toBe(1)
      expect(info.misses).toBe(2)
    })

    it("should provide cache_clear", () => {
      const fn = functools.lru_cache((n: number) => n * 2)
      fn(1)
      fn.cache_clear()
      const info = fn.cache_info()
      expect(info.currsize).toBe(0)
    })
  })

  describe("attrgetter()", () => {
    it("should get attribute from object", () => {
      const getName = functools.attrgetter("name")
      expect(getName({ name: "John" })).toBe("John")
    })

    it("should support nested attributes", () => {
      const getCity = functools.attrgetter("address.city")
      expect(getCity({ address: { city: "NYC" } })).toBe("NYC")
    })

    it("should support multiple attributes", () => {
      const getNameAge = functools.attrgetter("name", "age")
      expect(getNameAge({ name: "John", age: 30 })).toEqual(["John", 30])
    })
  })

  describe("itemgetter()", () => {
    it("should get item from array", () => {
      const getSecond = functools.itemgetter(1)
      expect(getSecond([10, 20, 30])).toBe(20)
    })

    it("should get item from object", () => {
      const getA = functools.itemgetter("a")
      expect(getA({ a: 1, b: 2 })).toBe(1)
    })

    it("should support multiple items", () => {
      const getItems = functools.itemgetter(0, 2)
      expect(getItems([10, 20, 30])).toEqual([10, 30])
    })
  })

  describe("cmp_to_key()", () => {
    it("should convert comparison function to key function", () => {
      const cmp = (a: number, b: number) => a - b
      const key = functools.cmp_to_key(cmp)
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

    it("splitext should split extension", () => {
      const [root, ext] = os.path.splitext("/path/to/file.txt")
      expect(root).toBe("/path/to/file")
      expect(ext).toBe(".txt")
    })

    it("isabs should check if path is absolute", () => {
      expect(os.path.isabs("/absolute/path")).toBe(true)
      expect(os.path.isabs("relative/path")).toBe(false)
    })

    it("normpath should normalize path", () => {
      expect(os.path.normpath("a/b/../c")).toBe("a/c")
      expect(os.path.normpath("a//b")).toBe("a/b")
    })

    it("abspath should normalize path", () => {
      const result = os.path.abspath("a/../b")
      expect(result).toBe("b")
    })

    it("relpath should return relative path", () => {
      expect(os.path.relpath("/a/b/c", "/a")).toBe("b/c")
    })

    it("commonpath should return common path prefix", () => {
      expect(os.path.commonpath(["/a/b/c", "/a/b/d"])).toBe("/a/b")
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

    it("getcwd should return current directory", () => {
      const cwd = os.getcwd()
      expect(typeof cwd).toBe("string")
      expect(cwd.length).toBeGreaterThan(0)
    })
  })

  describe("constants", () => {
    it("should export sep", () => {
      expect(os.sep).toBe("/")
    })

    it("should export linesep", () => {
      expect(os.linesep).toBe("\n")
    })

    it("should export name", () => {
      expect(["posix", "nt"]).toContain(os.name)
    })
  })
})
