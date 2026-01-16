import { describe, it, expect } from "vitest"
import { py } from "../src/runtime/index.js"

describe("Runtime Library (py.*)", () => {
  describe("Arithmetic Operations", () => {
    describe("floordiv", () => {
      it("should perform floor division for positive numbers", () => {
        expect(py.floordiv(10, 3)).toBe(3)
        expect(py.floordiv(9, 3)).toBe(3)
        expect(py.floordiv(7, 2)).toBe(3)
      })

      it("should perform floor division for negative numbers (Python semantics)", () => {
        expect(py.floordiv(-10, 3)).toBe(-4)
        expect(py.floordiv(10, -3)).toBe(-4)
        expect(py.floordiv(-10, -3)).toBe(3)
      })
    })

    describe("pow", () => {
      it("should calculate power", () => {
        expect(py.pow(2, 8)).toBe(256)
        expect(py.pow(3, 3)).toBe(27)
        expect(py.pow(10, 0)).toBe(1)
      })

      it("should handle negative exponents", () => {
        expect(py.pow(2, -1)).toBe(0.5)
      })
    })

    describe("mod", () => {
      it("should perform modulo for positive numbers", () => {
        expect(py.mod(7, 3)).toBe(1)
        expect(py.mod(10, 5)).toBe(0)
      })

      it("should follow Python semantics for negative numbers", () => {
        // In Python: -7 % 3 == 2 (result has same sign as divisor)
        expect(py.mod(-7, 3)).toBe(2)
        expect(py.mod(7, -3)).toBe(-2)
        expect(py.mod(-7, -3)).toBe(-1)
      })
    })
  })

  describe("Slicing", () => {
    describe("slice()", () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const str = "0123456789"

      it("should slice arrays with start and stop", () => {
        expect(py.slice(arr, 2, 5)).toEqual([2, 3, 4])
      })

      it("should slice strings with start and stop", () => {
        expect(py.slice(str, 2, 5)).toBe("234")
      })

      it("should handle negative indices", () => {
        expect(py.slice(arr, -3)).toEqual([7, 8, 9])
        expect(py.slice(arr, 0, -2)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
      })

      it("should handle step", () => {
        expect(py.slice(arr, 0, 10, 2)).toEqual([0, 2, 4, 6, 8])
        expect(py.slice(arr, 1, 10, 2)).toEqual([1, 3, 5, 7, 9])
      })

      it("should handle negative step", () => {
        expect(py.slice(arr, 9, 0, -1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
        expect(py.slice(arr, undefined, undefined, -1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
      })

      it("should throw for zero step", () => {
        expect(() => py.slice(arr, 0, 5, 0)).toThrow("slice step cannot be zero")
      })

      it("should handle undefined start/stop", () => {
        expect(py.slice(arr, undefined, 3)).toEqual([0, 1, 2])
        expect(py.slice(arr, 7, undefined)).toEqual([7, 8, 9])
      })
    })
  })

  describe("Iterables", () => {
    describe("range()", () => {
      it("should generate range with stop only", () => {
        expect([...py.range(5)]).toEqual([0, 1, 2, 3, 4])
      })

      it("should generate range with start and stop", () => {
        expect([...py.range(2, 7)]).toEqual([2, 3, 4, 5, 6])
      })

      it("should generate range with step", () => {
        expect([...py.range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])
      })

      it("should generate range with negative step", () => {
        expect([...py.range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1])
      })

      it("should generate empty range when start >= stop with positive step", () => {
        expect([...py.range(5, 2)]).toEqual([])
      })

      it("should throw for zero step", () => {
        expect(() => [...py.range(0, 5, 0)]).toThrow()
      })
    })

    describe("enumerate()", () => {
      it("should enumerate items", () => {
        expect([...py.enumerate(["a", "b", "c"])]).toEqual([
          [0, "a"],
          [1, "b"],
          [2, "c"]
        ])
      })

      it("should support start parameter", () => {
        expect([...py.enumerate(["a", "b"], 1)]).toEqual([
          [1, "a"],
          [2, "b"]
        ])
      })
    })

    describe("zip()", () => {
      it("should zip two arrays", () => {
        expect([...py.zip([1, 2, 3], ["a", "b", "c"])]).toEqual([
          [1, "a"],
          [2, "b"],
          [3, "c"]
        ])
      })

      it("should stop at shortest iterable", () => {
        expect([...py.zip([1, 2], ["a", "b", "c"])]).toEqual([
          [1, "a"],
          [2, "b"]
        ])
      })
    })
  })

  describe("Collections", () => {
    describe("list()", () => {
      it("should create empty list", () => {
        expect(py.list()).toEqual([])
      })

      it("should create list from iterable", () => {
        expect(py.list(py.range(3))).toEqual([0, 1, 2])
      })
    })

    describe("dict()", () => {
      it("should create empty dict", () => {
        expect(py.dict().size).toBe(0)
      })

      it("should create dict from entries", () => {
        const d = py.dict([
          ["a", 1],
          ["b", 2]
        ] as [string, number][])
        expect(d.get("a")).toBe(1)
        expect(d.get("b")).toBe(2)
      })
    })

    describe("set()", () => {
      it("should create empty set", () => {
        expect(py.set().size).toBe(0)
      })

      it("should create set from iterable", () => {
        const s = py.set([1, 2, 2, 3])
        expect(s.size).toBe(3)
      })
    })

    describe("tuple()", () => {
      it("should create tuple", () => {
        const t = py.tuple(1, 2, 3)
        expect(t).toEqual([1, 2, 3])
        expect(Object.isFrozen(t)).toBe(true)
      })
    })
  })

  describe("Built-in Functions", () => {
    describe("len()", () => {
      it("should return length of array", () => {
        expect(py.len([1, 2, 3])).toBe(3)
      })

      it("should return length of string", () => {
        expect(py.len("hello")).toBe(5)
      })

      it("should return size of Map", () => {
        expect(
          py.len(
            new Map([
              ["a", 1],
              ["b", 2]
            ])
          )
        ).toBe(2)
      })

      it("should return size of Set", () => {
        expect(py.len(new Set([1, 2, 3]))).toBe(3)
      })
    })

    describe("abs()", () => {
      it("should return absolute value", () => {
        expect(py.abs(-5)).toBe(5)
        expect(py.abs(5)).toBe(5)
        expect(py.abs(0)).toBe(0)
      })
    })

    describe("min()", () => {
      it("should return minimum of arguments", () => {
        expect(py.min(1, 2, 3)).toBe(1)
        expect(py.min(3, 1, 2)).toBe(1)
      })

      it("should return minimum of iterable", () => {
        expect(py.min([5, 2, 8, 1])).toBe(1)
      })
    })

    describe("max()", () => {
      it("should return maximum of arguments", () => {
        expect(py.max(1, 2, 3)).toBe(3)
        expect(py.max(3, 1, 2)).toBe(3)
      })

      it("should return maximum of iterable", () => {
        expect(py.max([5, 2, 8, 1])).toBe(8)
      })
    })

    describe("sum()", () => {
      it("should sum numbers", () => {
        expect(py.sum([1, 2, 3, 4, 5])).toBe(15)
      })

      it("should support start parameter", () => {
        expect(py.sum([1, 2, 3], 10)).toBe(16)
      })
    })

    describe("sorted()", () => {
      it("should sort array", () => {
        expect(py.sorted([3, 1, 2])).toEqual([1, 2, 3])
      })

      it("should support reverse", () => {
        expect(py.sorted([3, 1, 2], { reverse: true })).toEqual([3, 2, 1])
      })

      it("should support key function", () => {
        const items = [{ x: 3 }, { x: 1 }, { x: 2 }]
        const sorted = py.sorted(items, { key: (i) => i.x })
        expect(sorted.map((i) => i.x)).toEqual([1, 2, 3])
      })
    })

    describe("reversed()", () => {
      it("should reverse array", () => {
        expect([...py.reversed([1, 2, 3])]).toEqual([3, 2, 1])
      })
    })
  })

  describe("Type Conversions", () => {
    describe("int()", () => {
      it("should convert string to int", () => {
        expect(py.int("42")).toBe(42)
        expect(py.int("-10")).toBe(-10)
      })

      it("should truncate float", () => {
        expect(py.int(3.7)).toBe(3)
        expect(py.int(-3.7)).toBe(-3)
      })

      it("should convert boolean", () => {
        expect(py.int(true)).toBe(1)
        expect(py.int(false)).toBe(0)
      })

      it("should support base parameter", () => {
        expect(py.int("ff", 16)).toBe(255)
        expect(py.int("1010", 2)).toBe(10)
      })
    })

    describe("float()", () => {
      it("should convert string to float", () => {
        expect(py.float("3.14")).toBe(3.14)
      })

      it("should return number as is", () => {
        expect(py.float(42)).toBe(42)
      })
    })

    describe("str()", () => {
      it("should convert number to string", () => {
        expect(py.str(42)).toBe("42")
      })

      it("should convert null to None", () => {
        expect(py.str(null)).toBe("None")
      })

      it("should convert boolean with Python style", () => {
        expect(py.str(true)).toBe("True")
        expect(py.str(false)).toBe("False")
      })

      it("should convert array with Python style", () => {
        expect(py.str([1, 2, 3])).toBe("[1, 2, 3]")
      })
    })

    describe("bool()", () => {
      it("should convert truthy/falsy values", () => {
        expect(py.bool(1)).toBe(true)
        expect(py.bool(0)).toBe(false)
        expect(py.bool("")).toBe(false)
        expect(py.bool("hello")).toBe(true)
        expect(py.bool([])).toBe(false)
        expect(py.bool([1])).toBe(true)
        expect(py.bool(null)).toBe(false)
        expect(py.bool(undefined)).toBe(false)
      })
    })
  })

  describe("Membership Testing", () => {
    describe("in()", () => {
      it("should check membership in array", () => {
        expect(py.in(2, [1, 2, 3])).toBe(true)
        expect(py.in(5, [1, 2, 3])).toBe(false)
      })

      it("should check substring in string", () => {
        expect(py.in("el", "hello")).toBe(true)
        expect(py.in("xyz", "hello")).toBe(false)
      })

      it("should check key in Map", () => {
        const m = new Map([["a", 1]])
        expect(py.in("a", m)).toBe(true)
        expect(py.in("b", m)).toBe(false)
      })

      it("should check element in Set", () => {
        const s = new Set([1, 2, 3])
        expect(py.in(2, s)).toBe(true)
        expect(py.in(5, s)).toBe(false)
      })
    })
  })

  describe("String Methods", () => {
    describe("join()", () => {
      it("should join strings", () => {
        expect(py.string.join(", ", ["a", "b", "c"])).toBe("a, b, c")
      })
    })

    describe("split()", () => {
      it("should split string by separator", () => {
        expect(py.string.split("a,b,c", ",")).toEqual(["a", "b", "c"])
      })

      it("should split on whitespace by default", () => {
        expect(py.string.split("  a  b  c  ")).toEqual(["a", "b", "c"])
      })

      it("should support maxsplit", () => {
        expect(py.string.split("a,b,c,d", ",", 2)).toEqual(["a", "b", "c,d"])
      })
    })

    describe("strip()", () => {
      it("should strip whitespace by default", () => {
        expect(py.string.strip("  hello  ")).toBe("hello")
      })

      it("should strip specified characters", () => {
        expect(py.string.strip("xxhelloxx", "x")).toBe("hello")
      })
    })

    describe("upper() / lower()", () => {
      it("should convert to uppercase", () => {
        expect(py.string.upper("hello")).toBe("HELLO")
      })

      it("should convert to lowercase", () => {
        expect(py.string.lower("HELLO")).toBe("hello")
      })
    })

    describe("startswith() / endswith()", () => {
      it("should check prefix", () => {
        expect(py.string.startswith("hello world", "hello")).toBe(true)
        expect(py.string.startswith("hello world", "world")).toBe(false)
      })

      it("should check suffix", () => {
        expect(py.string.endswith("hello world", "world")).toBe(true)
        expect(py.string.endswith("hello world", "hello")).toBe(false)
      })
    })

    describe("replace()", () => {
      it("should replace all occurrences", () => {
        expect(py.string.replace("aaa", "a", "b")).toBe("bbb")
      })

      it("should replace limited occurrences", () => {
        expect(py.string.replace("aaa", "a", "b", 2)).toBe("bba")
      })
    })

    describe("find()", () => {
      it("should find substring", () => {
        expect(py.string.find("hello world", "world")).toBe(6)
        expect(py.string.find("hello world", "xyz")).toBe(-1)
      })
    })

    describe("count()", () => {
      it("should count occurrences", () => {
        expect(py.string.count("banana", "a")).toBe(3)
        expect(py.string.count("banana", "na")).toBe(2)
      })
    })

    describe("format()", () => {
      it("should format string with positional args", () => {
        expect(py.string.format("Hello, {}!", "World")).toBe("Hello, World!")
        expect(py.string.format("{} + {} = {}", 1, 2, 3)).toBe("1 + 2 = 3")
      })

      it("should format string with numbered args", () => {
        expect(py.string.format("{1} {0}", "World", "Hello")).toBe("Hello World")
      })
    })
  })

  describe("Other Built-ins", () => {
    describe("ord() / chr()", () => {
      it("should get character code", () => {
        expect(py.ord("A")).toBe(65)
        expect(py.ord("a")).toBe(97)
      })

      it("should get character from code", () => {
        expect(py.chr(65)).toBe("A")
        expect(py.chr(97)).toBe("a")
      })
    })

    describe("all() / any()", () => {
      it("should check if all elements are truthy", () => {
        expect(py.all([true, true, true])).toBe(true)
        expect(py.all([true, false, true])).toBe(false)
        expect(py.all([])).toBe(true)
      })

      it("should check if any element is truthy", () => {
        expect(py.any([false, false, true])).toBe(true)
        expect(py.any([false, false, false])).toBe(false)
        expect(py.any([])).toBe(false)
      })
    })

    describe("map() / filter()", () => {
      it("should map over iterable", () => {
        expect([...py.map((x: number) => x * 2, [1, 2, 3])]).toEqual([2, 4, 6])
      })

      it("should filter iterable", () => {
        expect([...py.filter((x: number) => x > 2, [1, 2, 3, 4])]).toEqual([3, 4])
      })

      it("should filter with null (remove falsy)", () => {
        expect([...py.filter(null, [0, 1, "", "a", null, true])]).toEqual([1, "a", true])
      })
    })

    describe("round()", () => {
      it("should round number", () => {
        expect(py.round(3.7)).toBe(4)
        expect(py.round(3.2)).toBe(3)
      })

      it("should round to specified digits", () => {
        expect(py.round(3.14159, 2)).toBe(3.14)
        expect(py.round(1234.5, -2)).toBe(1200)
      })
    })

    describe("divmod()", () => {
      it("should return quotient and remainder", () => {
        expect(py.divmod(7, 3)).toEqual([2, 1])
        expect(py.divmod(-7, 3)).toEqual([-3, 2])
      })
    })

    describe("hex() / oct() / bin()", () => {
      it("should convert to hex", () => {
        expect(py.hex(255)).toBe("0xff")
        expect(py.hex(-255)).toBe("-0xff")
      })

      it("should convert to octal", () => {
        expect(py.oct(8)).toBe("0o10")
      })

      it("should convert to binary", () => {
        expect(py.bin(10)).toBe("0b1010")
      })
    })
  })

  describe("Format Specifiers", () => {
    it("should handle 'n' format type (locale-aware)", () => {
      const result = py.format(1234567.89, "n")
      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
    })

    it("should handle space sign for positive integers", () => {
      expect(py.format(42, " d")).toBe(" 42")
    })

    it("should handle space sign for positive floats", () => {
      expect(py.format(3.14, " .2f")).toBe(" 3.14")
    })

    it("should handle + sign for percentage", () => {
      expect(py.format(0.5, "+.0%")).toBe("+50%")
    })

    it("should handle space sign for percentage", () => {
      expect(py.format(0.5, " .0%")).toBe(" 50%")
    })

    it("should handle 'c' format type (character)", () => {
      expect(py.format(65, "c")).toBe("A")
      expect(py.format(97, "c")).toBe("a")
    })

    it("should handle unknown format with default string conversion", () => {
      expect(py.format({ key: "value" }, "")).toBeDefined()
    })

    it("should handle 'g' format type (general)", () => {
      const result = py.format(1234.5678, ".4g")
      expect(typeof result).toBe("string")
      expect(result).toBeDefined()
    })

    it("should handle 'G' format type (general uppercase)", () => {
      const result = py.format(1234.5678, ".4G")
      expect(typeof result).toBe("string")
      expect(result).toBeDefined()
    })

    it("should handle 'g' with sign", () => {
      const result = py.format(123.45, "+.3g")
      expect(result).toContain("+")
    })

    it("should handle 'g' with space sign", () => {
      const result = py.format(123.45, " .3g")
      expect(result.startsWith(" ")).toBe(true)
    })

    it("should handle 'e' format type (exponential)", () => {
      const result = py.format(1234.5, ".2e")
      expect(result).toContain("e")
    })

    it("should handle 'E' format type (exponential uppercase)", () => {
      const result = py.format(1234.5, ".2E")
      expect(result).toContain("E")
    })

    it("should handle 'e' with + sign", () => {
      const result = py.format(1234.5, "+.2e")
      expect(result).toContain("+")
    })

    it("should handle 'e' with space sign", () => {
      const result = py.format(1234.5, " .2e")
      expect(result.startsWith(" ")).toBe(true)
    })

    it("should handle unknown format type (fallback)", () => {
      const obj = { custom: "value" }
      const result = py.format(obj, "")
      expect(typeof result).toBe("string")
    })

    it("should handle fill character with left alignment", () => {
      const result = py.format(42, "*<10d")
      expect(result).toBe("42********")
    })

    it("should handle fill character with right alignment", () => {
      const result = py.format(42, "*>10d")
      expect(result).toBe("********42")
    })

    it("should handle fill character with center alignment", () => {
      const result = py.format(42, "*^10d")
      expect(result.length).toBe(10)
      expect(result).toContain("42")
      expect(result).toContain("*")
    })

    it("should handle format with invalid/unknown type", () => {
      const result = py.format({ x: 1 }, "q")
      expect(typeof result).toBe("string")
    })

    it("should handle = alignment for sign padding", () => {
      const result = py.format(-42, "=10d")
      expect(result.length).toBe(10)
      expect(result.startsWith("-")).toBe(true)
    })
  })

  describe("Index Access (at)", () => {
    it("should handle py.at with valid negative index", () => {
      expect(py.at([1, 2, 3], -1)).toBe(3)
      expect(py.at("hello", -1)).toBe("o")
    })

    it("should throw IndexError for out of range index", () => {
      expect(() => py.at([1, 2, 3], 10)).toThrow("IndexError")
      expect(() => py.at([1, 2, 3], -10)).toThrow("IndexError")
    })
  })

  describe("Repetition (repeat)", () => {
    it("should handle py.repeat with count 0", () => {
      expect(py.repeat("ab", 0)).toBe("")
      expect(py.repeat([1, 2], 0)).toEqual([])
    })

    it("should handle py.repeat with negative count", () => {
      expect(py.repeat("ab", -1)).toBe("")
      expect(py.repeat([1, 2], -1)).toEqual([])
    })

    it("should handle py.repeat with arrays", () => {
      expect(py.repeat([1, 2], 3)).toEqual([1, 2, 1, 2, 1, 2])
    })
  })

  describe("repr() and ascii()", () => {
    it("should handle py.repr", () => {
      expect(py.repr("hello")).toBe("'hello'")
      expect(py.repr(42)).toBe("42")
    })

    it("should handle py.ascii", () => {
      expect(py.ascii("hello")).toBe("'hello'")
    })

    it("should escape non-ASCII characters in ascii()", () => {
      const result = py.ascii("hello\u00e9")
      expect(result).toContain("\\u00e9")
    })

    it("should handle high Unicode characters as surrogate pairs", () => {
      const result = py.ascii("\u{1F600}")
      expect(result).toContain("\\u")
    })
  })
})
