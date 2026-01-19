import { describe, it, expect } from "vitest"
import {
  floorDiv,
  mod,
  divMod,
  slice,
  at,
  sprintf,
  strFormat,
  contains,
  is,
  range,
  enumerate,
  zip,
  list,
  dict,
  set,
  tuple,
  len,
  abs,
  min,
  max,
  sum,
  sorted,
  reversed,
  int,
  float,
  str,
  bool,
  ord,
  chr,
  all,
  any,
  map,
  filter,
  round,
  hex,
  oct,
  bin,
  repr,
  ascii,
  format,
  string
} from "pythonlib"
import { pow, repeatValue as repeat } from "pythonlib"

describe("Runtime Library", () => {
  describe("Arithmetic Operations", () => {
    describe("floorDiv", () => {
      it("should perform floor division for positive numbers", () => {
        expect(floorDiv(10, 3)).toBe(3)
        expect(floorDiv(9, 3)).toBe(3)
        expect(floorDiv(7, 2)).toBe(3)
      })

      it("should perform floor division for negative numbers (Python semantics)", () => {
        expect(floorDiv(-10, 3)).toBe(-4)
        expect(floorDiv(10, -3)).toBe(-4)
        expect(floorDiv(-10, -3)).toBe(3)
      })
    })

    describe("pow", () => {
      it("should calculate power", () => {
        expect(pow(2, 8)).toBe(256)
        expect(pow(3, 3)).toBe(27)
        expect(pow(10, 0)).toBe(1)
      })

      it("should handle negative exponents", () => {
        expect(pow(2, -1)).toBe(0.5)
      })
    })

    describe("mod", () => {
      it("should perform modulo for positive numbers", () => {
        expect(mod(7, 3)).toBe(1)
        expect(mod(10, 5)).toBe(0)
      })

      it("should follow Python semantics for negative numbers", () => {
        // In Python: -7 % 3 == 2 (result has same sign as divisor)
        expect(mod(-7, 3)).toBe(2)
        expect(mod(7, -3)).toBe(-2)
        expect(mod(-7, -3)).toBe(-1)
      })
    })
  })

  describe("Slicing", () => {
    describe("slice()", () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const testStr = "0123456789"

      it("should slice arrays with start and stop", () => {
        expect(slice(arr, 2, 5)).toEqual([2, 3, 4])
      })

      it("should slice strings with start and stop", () => {
        expect(slice(testStr, 2, 5)).toBe("234")
      })

      it("should handle negative indices", () => {
        expect(slice(arr, -3)).toEqual([7, 8, 9])
        expect(slice(arr, 0, -2)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
      })

      it("should handle step", () => {
        expect(slice(arr, 0, 10, 2)).toEqual([0, 2, 4, 6, 8])
        expect(slice(arr, 1, 10, 2)).toEqual([1, 3, 5, 7, 9])
      })

      it("should handle negative step", () => {
        expect(slice(arr, 9, 0, -1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
        expect(slice(arr, undefined, undefined, -1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
      })

      it("should throw for zero step", () => {
        expect(() => slice(arr, 0, 5, 0)).toThrow("slice step cannot be zero")
      })

      it("should handle undefined start/stop", () => {
        expect(slice(arr, undefined, 3)).toEqual([0, 1, 2])
        expect(slice(arr, 7, undefined)).toEqual([7, 8, 9])
      })
    })
  })

  describe("Iterables", () => {
    describe("range()", () => {
      it("should generate range with stop only", () => {
        expect([...range(5)]).toEqual([0, 1, 2, 3, 4])
      })

      it("should generate range with start and stop", () => {
        expect([...range(2, 7)]).toEqual([2, 3, 4, 5, 6])
      })

      it("should generate range with step", () => {
        expect([...range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])
      })

      it("should generate range with negative step", () => {
        expect([...range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1])
      })

      it("should generate empty range when start >= stop with positive step", () => {
        expect([...range(5, 2)]).toEqual([])
      })

      it("should throw for zero step", () => {
        expect(() => [...range(0, 5, 0)]).toThrow()
      })
    })

    describe("enumerate()", () => {
      it("should enumerate items", () => {
        expect([...enumerate(["a", "b", "c"])]).toEqual([
          [0, "a"],
          [1, "b"],
          [2, "c"]
        ])
      })

      it("should support start parameter", () => {
        expect([...enumerate(["a", "b"], 1)]).toEqual([
          [1, "a"],
          [2, "b"]
        ])
      })
    })

    describe("zip()", () => {
      it("should zip two arrays", () => {
        expect([...zip([1, 2, 3], ["a", "b", "c"])]).toEqual([
          [1, "a"],
          [2, "b"],
          [3, "c"]
        ])
      })

      it("should stop at shortest iterable", () => {
        expect([...zip([1, 2], ["a", "b", "c"])]).toEqual([
          [1, "a"],
          [2, "b"]
        ])
      })
    })
  })

  describe("Collections", () => {
    describe("list()", () => {
      it("should create empty list", () => {
        expect(list()).toEqual([])
      })

      it("should create list from iterable", () => {
        expect(list(range(3))).toEqual([0, 1, 2])
      })
    })

    describe("dict()", () => {
      it("should create empty dict", () => {
        expect(dict().size).toBe(0)
      })

      it("should create dict from entries", () => {
        const d = dict([
          ["a", 1],
          ["b", 2]
        ] as [string, number][])
        expect(d.get("a")).toBe(1)
        expect(d.get("b")).toBe(2)
      })
    })

    describe("set()", () => {
      it("should create empty set", () => {
        expect(set().size).toBe(0)
      })

      it("should create set from iterable", () => {
        const s = set([1, 2, 2, 3])
        expect(s.size).toBe(3)
      })
    })

    describe("tuple()", () => {
      it("should create tuple", () => {
        const t = tuple(1, 2, 3)
        expect(t).toEqual([1, 2, 3])
        expect(Object.isFrozen(t)).toBe(true)
      })
    })
  })

  describe("Built-in Functions", () => {
    describe("len()", () => {
      it("should return length of array", () => {
        expect(len([1, 2, 3])).toBe(3)
      })

      it("should return length of string", () => {
        expect(len("hello")).toBe(5)
      })

      it("should return size of Map", () => {
        expect(
          len(
            new Map([
              ["a", 1],
              ["b", 2]
            ])
          )
        ).toBe(2)
      })

      it("should return size of Set", () => {
        expect(len(new Set([1, 2, 3]))).toBe(3)
      })
    })

    describe("abs()", () => {
      it("should return absolute value", () => {
        expect(abs(-5)).toBe(5)
        expect(abs(5)).toBe(5)
        expect(abs(0)).toBe(0)
      })
    })

    describe("min()", () => {
      it("should return minimum of arguments", () => {
        expect(min(1, 2, 3)).toBe(1)
        expect(min(3, 1, 2)).toBe(1)
      })

      it("should return minimum of iterable", () => {
        expect(min([5, 2, 8, 1])).toBe(1)
      })
    })

    describe("max()", () => {
      it("should return maximum of arguments", () => {
        expect(max(1, 2, 3)).toBe(3)
        expect(max(3, 1, 2)).toBe(3)
      })

      it("should return maximum of iterable", () => {
        expect(max([5, 2, 8, 1])).toBe(8)
      })
    })

    describe("sum()", () => {
      it("should sum numbers", () => {
        expect(sum([1, 2, 3, 4, 5])).toBe(15)
      })

      it("should support start parameter", () => {
        expect(sum([1, 2, 3], 10)).toBe(16)
      })
    })

    describe("sorted()", () => {
      it("should sort array", () => {
        expect(sorted([3, 1, 2])).toEqual([1, 2, 3])
      })

      it("should support reverse", () => {
        expect(sorted([3, 1, 2], { reverse: true })).toEqual([3, 2, 1])
      })

      it("should support key function", () => {
        const items = [{ x: 3 }, { x: 1 }, { x: 2 }]
        const result = sorted(items, { key: (i) => i.x })
        expect(result.map((i) => i.x)).toEqual([1, 2, 3])
      })
    })

    describe("reversed()", () => {
      it("should reverse array", () => {
        expect([...reversed([1, 2, 3])]).toEqual([3, 2, 1])
      })
    })
  })

  describe("Type Conversions", () => {
    describe("int()", () => {
      it("should convert string to int", () => {
        expect(int("42")).toBe(42)
        expect(int("-10")).toBe(-10)
      })

      it("should truncate float", () => {
        expect(int(3.7)).toBe(3)
        expect(int(-3.7)).toBe(-3)
      })

      it("should convert boolean", () => {
        expect(int(true)).toBe(1)
        expect(int(false)).toBe(0)
      })

      it("should support base parameter", () => {
        expect(int("ff", 16)).toBe(255)
        expect(int("1010", 2)).toBe(10)
      })
    })

    describe("float()", () => {
      it("should convert string to float", () => {
        expect(float("3.14")).toBe(3.14)
      })

      it("should return number as is", () => {
        expect(float(42)).toBe(42)
      })
    })

    describe("str()", () => {
      it("should convert number to string", () => {
        expect(str(42)).toBe("42")
      })

      it("should convert null to None", () => {
        expect(str(null)).toBe("None")
      })

      it("should convert boolean with Python style", () => {
        expect(str(true)).toBe("True")
        expect(str(false)).toBe("False")
      })

      it("should convert array with Python style", () => {
        expect(str([1, 2, 3])).toBe("[1, 2, 3]")
      })
    })

    describe("bool()", () => {
      it("should convert truthy/falsy values", () => {
        expect(bool(1)).toBe(true)
        expect(bool(0)).toBe(false)
        expect(bool("")).toBe(false)
        expect(bool("hello")).toBe(true)
        expect(bool([])).toBe(false)
        expect(bool([1])).toBe(true)
        expect(bool(null)).toBe(false)
        expect(bool(undefined)).toBe(false)
      })
    })
  })

  describe("Membership Testing", () => {
    describe("contains()", () => {
      it("should check membership in array", () => {
        expect(contains(2, [1, 2, 3])).toBe(true)
        expect(contains(5, [1, 2, 3])).toBe(false)
      })

      it("should check substring in string", () => {
        expect(contains("el", "hello")).toBe(true)
        expect(contains("xyz", "hello")).toBe(false)
      })

      it("should check key in Map", () => {
        const m = new Map([["a", 1]])
        expect(contains("a", m)).toBe(true)
        expect(contains("b", m)).toBe(false)
      })

      it("should check element in Set", () => {
        const s = new Set([1, 2, 3])
        expect(contains(2, s)).toBe(true)
        expect(contains(5, s)).toBe(false)
      })
    })
  })

  describe("String Methods", () => {
    describe("join()", () => {
      it("should join strings", () => {
        expect(string.join(", ", ["a", "b", "c"])).toBe("a, b, c")
      })
    })

    describe("split()", () => {
      it("should split string by separator", () => {
        expect(string.split("a,b,c", ",")).toEqual(["a", "b", "c"])
      })

      it("should split on whitespace by default", () => {
        expect(string.split("  a  b  c  ")).toEqual(["a", "b", "c"])
      })

      it("should support maxsplit", () => {
        expect(string.split("a,b,c,d", ",", 2)).toEqual(["a", "b", "c,d"])
      })
    })

    describe("strip()", () => {
      it("should strip whitespace by default", () => {
        expect(string.strip("  hello  ")).toBe("hello")
      })

      it("should strip specified characters", () => {
        expect(string.strip("xxhelloxx", "x")).toBe("hello")
      })
    })

    describe("upper() / lower()", () => {
      it("should convert to uppercase", () => {
        expect(string.upper("hello")).toBe("HELLO")
      })

      it("should convert to lowercase", () => {
        expect(string.lower("HELLO")).toBe("hello")
      })
    })

    describe("startswith() / endswith()", () => {
      it("should check prefix", () => {
        expect(string.startsWith("hello world", "hello")).toBe(true)
        expect(string.startsWith("hello world", "world")).toBe(false)
      })

      it("should check suffix", () => {
        expect(string.endsWith("hello world", "world")).toBe(true)
        expect(string.endsWith("hello world", "hello")).toBe(false)
      })
    })

    describe("replace()", () => {
      it("should replace all occurrences", () => {
        expect(string.replace("aaa", "a", "b")).toBe("bbb")
      })

      it("should replace limited occurrences", () => {
        expect(string.replace("aaa", "a", "b", 2)).toBe("bba")
      })
    })

    describe("find()", () => {
      it("should find substring", () => {
        expect(string.find("hello world", "world")).toBe(6)
        expect(string.find("hello world", "xyz")).toBe(-1)
      })
    })

    describe("count()", () => {
      it("should count occurrences", () => {
        expect(string.count("banana", "a")).toBe(3)
        expect(string.count("banana", "na")).toBe(2)
      })
    })

    describe("format()", () => {
      it("should format string with positional args", () => {
        expect(string.format("Hello, {}!", "World")).toBe("Hello, World!")
        expect(string.format("{} + {} = {}", 1, 2, 3)).toBe("1 + 2 = 3")
      })

      it("should format string with numbered args", () => {
        expect(string.format("{1} {0}", "World", "Hello")).toBe("Hello World")
      })
    })
  })

  describe("Other Built-ins", () => {
    describe("ord() / chr()", () => {
      it("should get character code", () => {
        expect(ord("A")).toBe(65)
        expect(ord("a")).toBe(97)
      })

      it("should get character from code", () => {
        expect(chr(65)).toBe("A")
        expect(chr(97)).toBe("a")
      })
    })

    describe("all() / any()", () => {
      it("should check if all elements are truthy", () => {
        expect(all([true, true, true])).toBe(true)
        expect(all([true, false, true])).toBe(false)
        expect(all([])).toBe(true)
      })

      it("should check if any element is truthy", () => {
        expect(any([false, false, true])).toBe(true)
        expect(any([false, false, false])).toBe(false)
        expect(any([])).toBe(false)
      })
    })

    describe("map() / filter()", () => {
      it("should map over iterable", () => {
        expect([...map((x: number) => x * 2, [1, 2, 3])]).toEqual([2, 4, 6])
      })

      it("should filter iterable", () => {
        expect([...filter((x: number) => x > 2, [1, 2, 3, 4])]).toEqual([3, 4])
      })

      it("should filter with null (remove falsy)", () => {
        expect([...filter(null, [0, 1, "", "a", null, true])]).toEqual([1, "a", true])
      })
    })

    describe("round()", () => {
      it("should round number", () => {
        expect(round(3.7)).toBe(4)
        expect(round(3.2)).toBe(3)
      })

      it("should round to specified digits", () => {
        expect(round(3.14159, 2)).toBe(3.14)
        expect(round(1234.5, -2)).toBe(1200)
      })
    })

    describe("divMod()", () => {
      it("should return quotient and remainder", () => {
        expect(divMod(7, 3)).toEqual([2, 1])
        expect(divMod(-7, 3)).toEqual([-3, 2])
      })
    })

    describe("hex() / oct() / bin()", () => {
      it("should convert to hex", () => {
        expect(hex(255)).toBe("0xff")
        expect(hex(-255)).toBe("-0xff")
      })

      it("should convert to octal", () => {
        expect(oct(8)).toBe("0o10")
      })

      it("should convert to binary", () => {
        expect(bin(10)).toBe("0b1010")
      })
    })
  })

  describe("Format Specifiers", () => {
    it("should handle 'n' format type (locale-aware)", () => {
      const result = format(1234567.89, "n")
      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
    })

    it("should handle space sign for positive integers", () => {
      expect(format(42, " d")).toBe(" 42")
    })

    it("should handle space sign for positive floats", () => {
      expect(format(3.14, " .2f")).toBe(" 3.14")
    })

    it("should handle space sign for octal", () => {
      expect(format(8, " o")).toBe(" 10")
    })

    it("should handle space sign for binary", () => {
      expect(format(5, " b")).toBe(" 101")
    })

    it("should handle + sign for percentage", () => {
      expect(format(0.5, "+.0%")).toBe("+50%")
    })

    it("should handle space sign for percentage", () => {
      expect(format(0.5, " .0%")).toBe(" 50%")
    })

    it("should handle 'c' format type (character)", () => {
      expect(format(65, "c")).toBe("A")
      expect(format(97, "c")).toBe("a")
    })

    it("should handle unknown format with default string conversion", () => {
      expect(format({ key: "value" }, "")).toBeDefined()
    })

    it("should handle 'g' format type (general)", () => {
      const result = format(1234.5678, ".4g")
      expect(typeof result).toBe("string")
      expect(result).toBeDefined()
    })

    it("should handle 'G' format type (general uppercase)", () => {
      const result = format(1234.5678, ".4G")
      expect(typeof result).toBe("string")
      expect(result).toBeDefined()
    })

    it("should handle 'g' with sign", () => {
      const result = format(123.45, "+.3g")
      expect(result).toContain("+")
    })

    it("should handle 'g' with space sign", () => {
      const result = format(123.45, " .3g")
      expect(result.startsWith(" ")).toBe(true)
    })

    it("should handle 'e' format type (exponential)", () => {
      const result = format(1234.5, ".2e")
      expect(result).toContain("e")
    })

    it("should handle 'E' format type (exponential uppercase)", () => {
      const result = format(1234.5, ".2E")
      expect(result).toContain("E")
    })

    it("should handle 'e' with + sign", () => {
      const result = format(1234.5, "+.2e")
      expect(result).toContain("+")
    })

    it("should handle 'e' with space sign", () => {
      const result = format(1234.5, " .2e")
      expect(result.startsWith(" ")).toBe(true)
    })

    it("should handle unknown format type (fallback)", () => {
      const obj = { custom: "value" }
      const result = format(obj, "")
      expect(typeof result).toBe("string")
    })

    it("should handle fill character with left alignment", () => {
      const result = format(42, "*<10d")
      expect(result).toBe("42********")
    })

    it("should handle fill character with right alignment", () => {
      const result = format(42, "*>10d")
      expect(result).toBe("********42")
    })

    it("should handle fill character with center alignment", () => {
      const result = format(42, "*^10d")
      expect(result.length).toBe(10)
      expect(result).toContain("42")
      expect(result).toContain("*")
    })

    it("should handle format with invalid/unknown type", () => {
      const result = format({ x: 1 }, "q")
      expect(typeof result).toBe("string")
    })

    it("should handle = alignment for sign padding", () => {
      const result = format(-42, "=10d")
      expect(result.length).toBe(10)
      expect(result.startsWith("-")).toBe(true)
    })
  })

  describe("Index Access (at)", () => {
    it("should handle at with valid negative index", () => {
      expect(at([1, 2, 3], -1)).toBe(3)
      expect(at("hello", -1)).toBe("o")
    })

    it("should throw IndexError for out of range index", () => {
      expect(() => at([1, 2, 3], 10)).toThrow("IndexError")
      expect(() => at([1, 2, 3], -10)).toThrow("IndexError")
    })
  })

  describe("Repetition (repeat)", () => {
    it("should handle repeat with count 0", () => {
      expect(repeat("ab", 0)).toBe("")
      expect(repeat([1, 2], 0)).toEqual([])
    })

    it("should handle repeat with negative count", () => {
      expect(repeat("ab", -1)).toBe("")
      expect(repeat([1, 2], -1)).toEqual([])
    })

    it("should handle repeat with arrays", () => {
      expect(repeat([1, 2], 3)).toEqual([1, 2, 1, 2, 1, 2])
    })
  })

  describe("repr() and ascii()", () => {
    it("should handle repr", () => {
      expect(repr("hello")).toBe("'hello'")
      expect(repr(42)).toBe("42")
    })

    it("should handle ascii", () => {
      expect(ascii("hello")).toBe("'hello'")
    })

    it("should escape non-ASCII characters in ascii()", () => {
      const result = ascii("hello\u00e9")
      expect(result).toContain("\\u00e9")
    })

    it("should handle high Unicode characters as surrogate pairs", () => {
      const result = ascii("\u{1F600}")
      expect(result).toContain("\\u")
    })
  })

  describe("Additional sprintf format specifiers", () => {
    it("should format %o (octal)", () => {
      expect(sprintf("%o", 8)).toBe("10")
      expect(sprintf("%o", 64)).toBe("100")
    })

    it("should format %e (exponential)", () => {
      expect(sprintf("%e", 1000)).toMatch(/1.*e\+/)
    })

    it("should format %r (repr)", () => {
      expect(sprintf("%r", "hello")).toBe('"hello"')
      expect(sprintf("%r", 42)).toBe("42")
    })

    it("should format %c (char)", () => {
      expect(sprintf("%c", 65)).toBe("A")
      expect(sprintf("%c", 97)).toBe("a")
    })
  })

  describe("strFormat edge cases", () => {
    it("should handle unmatched placeholders", () => {
      expect(strFormat("{unknown}", "value")).toBe("{unknown}")
    })

    it("should handle empty template", () => {
      expect(strFormat("", "value")).toBe("")
    })

    it("should keep empty placeholder when no more args", () => {
      expect(strFormat("{} {} {}", "a")).toBe("a {} {}")
    })
  })

  describe("sprintf edge cases", () => {
    it("should handle %f without precision", () => {
      expect(sprintf("%f", 3.14159)).toBe("3.14159")
    })

    it("should leave unmatched format specifiers unchanged", () => {
      // %z is not a valid format, so it's not matched by the regex
      expect(sprintf("%z test", "unused")).toBe("%z test")
    })
  })

  describe("is operator", () => {
    it("should compare identity for null", () => {
      expect(is(null, null)).toBe(true)
      expect(is(null, undefined)).toBe(false)
    })

    it("should compare identity for primitives", () => {
      expect(is(1, 1)).toBe(true)
      expect(is("a", "a")).toBe(true)
      expect(is(1, 2)).toBe(false)
    })

    it("should compare identity for objects", () => {
      const obj = { a: 1 }
      expect(is(obj, obj)).toBe(true)
      expect(is({ a: 1 }, { a: 1 })).toBe(false)
    })
  })

  describe("String methods", () => {
    it("swapcase should swap character cases", () => {
      expect(string.swapCase("Hello World")).toBe("hELLO wORLD")
      expect(string.swapCase("ABC")).toBe("abc")
      expect(string.swapCase("abc")).toBe("ABC")
    })

    it("strIndex should find substring or throw", () => {
      expect(string.index("hello", "ll")).toBe(2)
      expect(string.index("hello", "l")).toBe(2)
      expect(() => string.index("hello", "xyz")).toThrow()
    })

    it("strRindex should find last substring or throw", () => {
      expect(string.rIndex("hello", "l")).toBe(3)
      expect(string.rIndex("abcabc", "bc")).toBe(4)
      expect(() => string.rIndex("hello", "xyz")).toThrow()
    })

    it("rsplit should split from the right", () => {
      expect(string.rSplit("a,b,c,d", ",", 2)).toEqual(["a,b", "c", "d"])
      expect(string.rSplit("a,b,c", ",")).toEqual(["a", "b", "c"])
      expect(string.rSplit("hello", ",")).toEqual(["hello"])
    })
  })

  describe("List methods", () => {
    it("listRemove should remove first occurrence", () => {
      const arr = [1, 2, 3, 2, 4]
      list.remove(arr, 2)
      expect(arr).toEqual([1, 3, 2, 4])
    })

    it("listRemove should throw if not found", () => {
      const arr = [1, 2, 3]
      expect(() => {
        list.remove(arr, 5)
      }).toThrow()
    })

    it("listSort should sort with key function", () => {
      const arr = [{ n: 3 }, { n: 1 }, { n: 2 }]
      list.sort(arr, { key: (x: { n: number }) => x.n })
      expect(arr.map((x) => x.n)).toEqual([1, 2, 3])
    })

    it("listSort should sort in reverse", () => {
      const arr = [1, 3, 2]
      list.sort(arr, { reverse: true })
      expect(arr).toEqual([3, 2, 1])
    })

    it("listSort with key and reverse", () => {
      const arr = ["bb", "a", "ccc"]
      list.sort(arr, { key: (x: string) => x.length, reverse: true })
      expect(arr).toEqual(["ccc", "bb", "a"])
    })

    it("listSort should sort without options", () => {
      const arr = [3, 1, 2]
      list.sort(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it("listAppend should add item to end", () => {
      const arr = [1, 2]
      list.append(arr, 3)
      expect(arr).toEqual([1, 2, 3])
    })

    it("listExtend should add items from iterable", () => {
      const arr = [1, 2]
      list.extend(arr, [3, 4, 5])
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it("listInsert should insert item at index", () => {
      const arr = [1, 3]
      list.insert(arr, 1, 2)
      expect(arr).toEqual([1, 2, 3])
    })

    it("listPop should remove and return last item", () => {
      const arr = [1, 2, 3]
      expect(list.pop(arr)).toBe(3)
      expect(arr).toEqual([1, 2])
    })

    it("listPop should remove and return item at index", () => {
      const arr = [1, 2, 3]
      expect(list.pop(arr, 1)).toBe(2)
      expect(arr).toEqual([1, 3])
    })

    it("listPop should handle negative index", () => {
      const arr = [1, 2, 3]
      expect(list.pop(arr, -2)).toBe(2)
      expect(arr).toEqual([1, 3])
    })

    it("listPop should throw for empty list", () => {
      const arr: number[] = []
      expect(() => list.pop(arr)).toThrow("pop from empty list")
    })

    it("listPop should throw for out of range index", () => {
      const arr = [1, 2, 3]
      expect(() => list.pop(arr, 10)).toThrow("pop index out of range")
      expect(() => list.pop(arr, -10)).toThrow("pop index out of range")
    })

    it("listClear should remove all items", () => {
      const arr = [1, 2, 3]
      list.clear(arr)
      expect(arr).toEqual([])
    })

    it("listIndex should find first occurrence", () => {
      const arr = [1, 2, 3, 2]
      expect(list.index(arr, 2)).toBe(1)
    })

    it("listIndex should find with start parameter", () => {
      const arr = [1, 2, 3, 2]
      expect(list.index(arr, 2, 2)).toBe(3)
    })

    it("listIndex should find with start and end parameters", () => {
      const arr = [1, 2, 3, 2, 4]
      expect(list.index(arr, 2, 0, 2)).toBe(1)
    })

    it("listIndex should throw if not found", () => {
      const arr = [1, 2, 3]
      expect(() => list.index(arr, 5)).toThrow("x not in list")
    })

    it("listCount should count occurrences", () => {
      const arr = [1, 2, 2, 3, 2]
      expect(list.count(arr, 2)).toBe(3)
      expect(list.count(arr, 5)).toBe(0)
    })

    it("listReverse should reverse in place", () => {
      const arr = [1, 2, 3]
      list.reverse(arr)
      expect(arr).toEqual([3, 2, 1])
    })

    it("listCopy should return shallow copy", () => {
      const arr = [1, 2, 3]
      const copy = list.copy(arr)
      expect(copy).toEqual(arr)
      expect(copy).not.toBe(arr)
    })

    it("sliceAssign should replace slice with step=1", () => {
      const arr = [0, 1, 2, 3, 4]
      list.sliceAssign(arr, 1, 3, undefined, [10, 20, 30])
      expect(arr).toEqual([0, 10, 20, 30, 3, 4])
    })

    it("sliceAssign should handle negative indices", () => {
      const arr = [0, 1, 2, 3, 4]
      list.sliceAssign(arr, -2, undefined, undefined, [10, 20])
      expect(arr).toEqual([0, 1, 2, 10, 20])
    })

    it("sliceAssign should handle step > 1", () => {
      const arr = [0, 1, 2, 3, 4]
      list.sliceAssign(arr, 0, 5, 2, [10, 20, 30])
      expect(arr).toEqual([10, 1, 20, 3, 30])
    })

    it("sliceAssign should throw for mismatched extended slice size", () => {
      const arr = [0, 1, 2, 3, 4]
      expect(() => {
        list.sliceAssign(arr, 0, 5, 2, [10, 20])
      }).toThrow("attempt to assign sequence of size 2 to extended slice of size 3")
    })

    it("sliceAssign should handle negative step", () => {
      const arr = [0, 1, 2, 3, 4]
      list.sliceAssign(arr, 4, 1, -2, [40, 20])
      expect(arr).toEqual([0, 1, 20, 3, 40])
    })
  })

  describe("Dict methods", () => {
    it("dictSetdefault should return existing value", () => {
      const obj = { a: 1 }
      expect(dict.setDefault(obj, "a", 99)).toBe(1)
      expect(obj.a).toBe(1)
    })

    it("dictSetdefault should set and return default for missing key", () => {
      const obj: Record<string, number> = { a: 1 }
      expect(dict.setDefault(obj, "b", 2)).toBe(2)
      expect(obj.b).toBe(2)
    })

    it("dictFromkeys should create dict from keys", () => {
      const result = dict.fromKeys(["a", "b", "c"], 0)
      expect(result).toEqual({ a: 0, b: 0, c: 0 })
    })

    it("dictFromkeys should use undefined as default", () => {
      const result = dict.fromKeys(["x", "y"])
      expect(result).toEqual({ x: undefined, y: undefined })
    })

    it("dictGet should return value for existing key", () => {
      const obj = { a: 1, b: 2 }
      expect(dict.get(obj, "a")).toBe(1)
      expect(dict.get(obj, "b")).toBe(2)
    })

    it("dictGet should return undefined for missing key", () => {
      const obj = { a: 1 }
      expect(dict.get(obj, "b" as keyof typeof obj)).toBeUndefined()
    })

    it("dictGet should return default for missing key", () => {
      const obj = { a: 1 }
      expect(dict.get(obj, "b" as keyof typeof obj, 99)).toBe(99)
    })

    it("dictPop should remove and return value", () => {
      const obj: Record<string, number> = { a: 1, b: 2 }
      expect(dict.pop(obj, "a")).toBe(1)
      expect(obj).toEqual({ b: 2 })
    })

    it("dictPop should return default for missing key", () => {
      const obj: Record<string, number> = { a: 1 }
      expect(dict.pop(obj, "b", 99)).toBe(99)
    })

    it("dictPop should throw for missing key without default", () => {
      const obj: Record<string, number> = { a: 1 }
      expect(() => dict.pop(obj, "b")).toThrow("KeyError")
    })

    it("dictPopitem should remove and return last item", () => {
      const obj: Record<string, number> = { a: 1, b: 2 }
      const [key, value] = dict.popItem(obj)
      expect(key).toBe("b")
      expect(value).toBe(2)
      expect(obj).toEqual({ a: 1 })
    })

    it("dictPopitem should throw for empty dict", () => {
      const obj: Record<string, number> = {}
      expect(() => dict.popItem(obj)).toThrow("dictionary is empty")
    })

    it("dictUpdate should update with another dict", () => {
      const obj: Record<string, number> = { a: 1 }
      dict.update(obj, { b: 2, c: 3 })
      expect(obj).toEqual({ a: 1, b: 2, c: 3 })
    })

    it("dictUpdate should update with iterable of pairs", () => {
      const obj: Record<string, number> = { a: 1 }
      dict.update(obj, [
        ["b", 2],
        ["c", 3]
      ] as Iterable<[string, number]>)
      expect(obj).toEqual({ a: 1, b: 2, c: 3 })
    })

    it("dictClear should remove all items", () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      dict.clear(obj)
      expect(obj).toEqual({})
    })

    it("dictCopy should return shallow copy", () => {
      const obj = { a: 1, b: 2 }
      const copy = dict.copy(obj)
      expect(copy).toEqual(obj)
      expect(copy).not.toBe(obj)
    })

    it("dictKeys should return array of keys", () => {
      const obj = { a: 1, b: 2 }
      expect(dict.keys(obj)).toEqual(["a", "b"])
    })

    it("dictValues should return array of values", () => {
      const obj = { a: 1, b: 2 }
      expect(dict.values(obj)).toEqual([1, 2])
    })

    it("dictItems should return array of [key, value] pairs", () => {
      const obj = { a: 1, b: 2 }
      expect(dict.items(obj)).toEqual([
        ["a", 1],
        ["b", 2]
      ])
    })
  })

  describe("Set methods", () => {
    it("setIntersection should return common elements", () => {
      const result = set.intersection(new Set([1, 2, 3]), new Set([2, 3, 4]))
      expect(result).toEqual(new Set([2, 3]))
    })

    it("setDifference should return elements only in first set", () => {
      const result = set.difference(new Set([1, 2, 3]), new Set([2, 3, 4]))
      expect(result).toEqual(new Set([1]))
    })

    it("setSymmetricDifference should return elements in either but not both", () => {
      const result = set.symmetricDifference(new Set([1, 2, 3]), new Set([2, 3, 4]))
      expect(result).toEqual(new Set([1, 4]))
    })

    it("setIssubset should check if all elements are in other set", () => {
      expect(set.isSubset(new Set([1, 2]), new Set([1, 2, 3]))).toBe(true)
      expect(set.isSubset(new Set([1, 4]), new Set([1, 2, 3]))).toBe(false)
    })

    it("setIssuperset should check if contains all elements of other set", () => {
      expect(set.isSuperset(new Set([1, 2, 3]), new Set([1, 2]))).toBe(true)
      expect(set.isSuperset(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false)
    })

    it("setAdd should add element to set", () => {
      const s = new Set([1, 2])
      set.add(s, 3)
      expect(s).toEqual(new Set([1, 2, 3]))
    })

    it("setRemove should remove element from set", () => {
      const s = new Set([1, 2, 3])
      set.remove(s, 2)
      expect(s).toEqual(new Set([1, 3]))
    })

    it("setRemove should throw if element not found", () => {
      const s = new Set([1, 2])
      expect(() => {
        set.remove(s, 5)
      }).toThrow("KeyError")
    })

    it("setDiscard should remove element if present", () => {
      const s = new Set([1, 2, 3])
      set.discard(s, 2)
      expect(s).toEqual(new Set([1, 3]))
    })

    it("setDiscard should not throw if element not found", () => {
      const s = new Set([1, 2])
      set.discard(s, 5)
      expect(s).toEqual(new Set([1, 2]))
    })

    it("setPop should remove and return element", () => {
      const s = new Set([1])
      const item = set.pop(s)
      expect(item).toBe(1)
      expect(s.size).toBe(0)
    })

    it("setPop should throw for empty set", () => {
      const s = new Set<number>()
      expect(() => set.pop(s)).toThrow("pop from an empty set")
    })

    it("setClear should remove all elements", () => {
      const s = new Set([1, 2, 3])
      set.clear(s)
      expect(s.size).toBe(0)
    })

    it("setCopy should return shallow copy", () => {
      const s = new Set([1, 2, 3])
      const copy = set.copy(s)
      expect(copy).toEqual(s)
      expect(copy).not.toBe(s)
    })

    it("setUpdate should add elements from iterables", () => {
      const s = new Set([1])
      set.update(s, [2, 3], [4, 5])
      expect(s).toEqual(new Set([1, 2, 3, 4, 5]))
    })

    it("setUnion should return union of sets", () => {
      const result = set.union(new Set([1, 2]), [3, 4], [4, 5])
      expect(result).toEqual(new Set([1, 2, 3, 4, 5]))
    })

    it("setIntersectionUpdate should keep only common elements", () => {
      const s = new Set([1, 2, 3, 4])
      set.intersectionUpdate(s, new Set([2, 3, 5]))
      expect(s).toEqual(new Set([2, 3]))
    })

    it("setDifferenceUpdate should remove elements found in other", () => {
      const s = new Set([1, 2, 3, 4])
      set.differenceUpdate(s, new Set([2, 3, 5]))
      expect(s).toEqual(new Set([1, 4]))
    })

    it("setSymmetricDifferenceUpdate should update with symmetric difference", () => {
      const s = new Set([1, 2, 3])
      set.symmetricDifferenceUpdate(s, new Set([2, 3, 4]))
      expect(s).toEqual(new Set([1, 4]))
    })

    it("setIsdisjoint should check if no common elements", () => {
      expect(set.isDisjoint(new Set([1, 2]), new Set([3, 4]))).toBe(true)
      expect(set.isDisjoint(new Set([1, 2]), new Set([2, 3]))).toBe(false)
    })
  })
})
