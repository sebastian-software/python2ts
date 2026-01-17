import { describe, it, expect } from "vitest"
import {
  type,
  len,
  all,
  any,
  bin,
  chr,
  hex,
  isinstance,
  oct,
  ord,
  repr,
  round,
  str,
  slice,
  range,
  map,
  filter,
  divmod
} from "pythonlib"

describe("E2E: Built-in Functions Execution", () => {
  describe("type()", () => {
    it("should return int for integers", () => {
      expect(type(42)).toBe("int")
    })

    it("should return float for floats", () => {
      expect(type(3.14)).toBe("float")
    })

    it("should return str for strings", () => {
      expect(type("hello")).toBe("str")
    })

    it("should return bool for booleans", () => {
      expect(type(true)).toBe("bool")
    })

    it("should return list for arrays", () => {
      expect(type([1, 2, 3])).toBe("list")
    })

    it("should return dict for Maps", () => {
      expect(type(new Map())).toBe("dict")
    })

    it("should return set for Sets", () => {
      expect(type(new Set())).toBe("set")
    })

    it("should return NoneType for null", () => {
      expect(type(null)).toBe("NoneType")
    })
  })

  describe("isinstance()", () => {
    it("should check number types", () => {
      expect(isinstance(42, Number)).toBe(true)
      expect(isinstance(42, "int")).toBe(true)
      expect(isinstance(3.14, "float")).toBe(true)
    })

    it("should check string type", () => {
      expect(isinstance("hello", String)).toBe(true)
      expect(isinstance("hello", "str")).toBe(true)
    })

    it("should check boolean type", () => {
      expect(isinstance(true, Boolean)).toBe(true)
      expect(isinstance(true, "bool")).toBe(true)
    })

    it("should check list type", () => {
      expect(isinstance([1, 2], Array)).toBe(true)
      expect(isinstance([1, 2], "list")).toBe(true)
    })

    it("should check dict type", () => {
      expect(isinstance(new Map(), Map)).toBe(true)
      expect(isinstance(new Map(), "dict")).toBe(true)
    })

    it("should check set type", () => {
      expect(isinstance(new Set(), Set)).toBe(true)
      expect(isinstance(new Set(), "set")).toBe(true)
    })
  })

  describe("repr()", () => {
    it("should add quotes around strings", () => {
      expect(repr("hello")).toBe("'hello'")
    })

    it("should not add quotes to non-strings", () => {
      expect(repr(42)).toBe("42")
      expect(repr(true)).toBe("True")
    })
  })

  describe("all() / any()", () => {
    it("should check all with various truthiness", () => {
      expect(all([1, 2, 3])).toBe(true)
      expect(all([1, 0, 3])).toBe(false)
      expect(all(["a", "b", "c"])).toBe(true)
      expect(all(["a", "", "c"])).toBe(false)
    })

    it("should check any with various truthiness", () => {
      expect(any([0, 0, 0])).toBe(false)
      expect(any([0, 1, 0])).toBe(true)
      expect(any(["", "", ""])).toBe(false)
      expect(any(["", "a", ""])).toBe(true)
    })
  })

  describe("map() / filter()", () => {
    it("should map over numbers", () => {
      const result = [...map((x: number) => x * x, [1, 2, 3, 4])]
      expect(result).toEqual([1, 4, 9, 16])
    })

    it("should filter numbers", () => {
      const result = [...filter((x: number) => x % 2 === 0, [1, 2, 3, 4, 5, 6])]
      expect(result).toEqual([2, 4, 6])
    })

    it("should filter with null predicate", () => {
      const result = [...filter(null, [0, 1, 2, "", "a", null, undefined, true, false])]
      expect(result).toEqual([1, 2, "a", true])
    })
  })

  describe("round()", () => {
    it("should round to integer by default", () => {
      expect(round(3.7)).toBe(4)
      expect(round(3.2)).toBe(3)
      expect(round(2.5)).toBe(2) // Banker's rounding
      expect(round(3.5)).toBe(4) // Banker's rounding
    })

    it("should round to specified decimals", () => {
      expect(round(3.14159, 2)).toBe(3.14)
      expect(round(3.14159, 3)).toBe(3.142)
    })

    it("should round to negative decimals", () => {
      expect(round(1234.5, -1)).toBe(1230)
      expect(round(1234.5, -2)).toBe(1200)
    })
  })

  describe("divmod()", () => {
    it("should return quotient and remainder", () => {
      expect(divmod(7, 3)).toEqual([2, 1])
      expect(divmod(10, 3)).toEqual([3, 1])
    })

    it("should follow Python semantics for negative numbers", () => {
      expect(divmod(-7, 3)).toEqual([-3, 2])
      expect(divmod(7, -3)).toEqual([-3, -2])
    })
  })

  describe("hex() / oct() / bin()", () => {
    it("should convert to hexadecimal", () => {
      expect(hex(0)).toBe("0x0")
      expect(hex(16)).toBe("0x10")
      expect(hex(255)).toBe("0xff")
      expect(hex(-16)).toBe("-0x10")
    })

    it("should convert to octal", () => {
      expect(oct(0)).toBe("0o0")
      expect(oct(8)).toBe("0o10")
      expect(oct(64)).toBe("0o100")
    })

    it("should convert to binary", () => {
      expect(bin(0)).toBe("0b0")
      expect(bin(2)).toBe("0b10")
      expect(bin(10)).toBe("0b1010")
      expect(bin(-10)).toBe("-0b1010")
    })
  })

  describe("ord() / chr()", () => {
    it("should convert characters to codes", () => {
      expect(ord("A")).toBe(65)
      expect(ord("Z")).toBe(90)
      expect(ord("0")).toBe(48)
      expect(ord("\n")).toBe(10)
    })

    it("should convert codes to characters", () => {
      expect(chr(65)).toBe("A")
      expect(chr(90)).toBe("Z")
      expect(chr(48)).toBe("0")
      expect(chr(10)).toBe("\n")
    })

    it("should throw for invalid ord input", () => {
      expect(() => ord("")).toThrow()
      expect(() => ord("ab")).toThrow()
    })
  })

  describe("len() edge cases", () => {
    it("should handle empty collections", () => {
      expect(len([])).toBe(0)
      expect(len("")).toBe(0)
      expect(len(new Map())).toBe(0)
      expect(len(new Set())).toBe(0)
    })

    it("should throw for invalid types", () => {
      expect(() => len(42 as never)).toThrow()
    })
  })

  describe("min() / max() edge cases", () => {
    it("should throw for empty iterables", () => {
      expect(() => min([])).toThrow()
      expect(() => max([])).toThrow()
    })

    it("should throw for no arguments", () => {
      expect(() => (py.min as () => number)()).toThrow()
      expect(() => (py.max as () => number)()).toThrow()
    })
  })

  describe("int() / float() edge cases", () => {
    it("should throw for invalid strings", () => {
      expect(() => int("not a number")).toThrow()
      expect(() => float("not a number")).toThrow()
    })
  })

  describe("slice() edge cases", () => {
    it("should handle slice with only start", () => {
      expect(slice([0, 1, 2, 3, 4], 2)).toEqual([2, 3, 4])
    })

    it("should handle slice with large indices", () => {
      expect(slice([0, 1, 2], 0, 100)).toEqual([0, 1, 2])
      expect(slice([0, 1, 2], -100, 100)).toEqual([0, 1, 2])
    })

    it("should handle reverse slice on strings", () => {
      expect(slice("hello", undefined, undefined, -1)).toBe("olleh")
    })
  })

  describe("range() edge cases", () => {
    it("should handle empty ranges", () => {
      expect([...range(0)]).toEqual([])
      expect([...range(5, 2)]).toEqual([])
      expect([...range(2, 5, -1)]).toEqual([])
    })
  })

  describe("str() edge cases", () => {
    it("should convert empty map/set", () => {
      expect(str(new Map())).toBe("{}")
      expect(str(new Set())).toBe("set()")
    })

    it("should convert map with entries", () => {
      const m = new Map([
        ["a", 1],
        ["b", 2]
      ])
      expect(str(m)).toContain("'a': 1")
      expect(str(m)).toContain("'b': 2")
    })

    it("should convert set with entries", () => {
      const s = new Set([1, 2, 3])
      const result = str(s)
      expect(result).toContain("1")
      expect(result).toContain("2")
      expect(result).toContain("3")
    })
  })
})
