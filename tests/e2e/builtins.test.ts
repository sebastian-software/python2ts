import { describe, it, expect } from "vitest"
import { py } from "pythonlib"

describe("E2E: Built-in Functions Execution", () => {
  describe("type()", () => {
    it("should return int for integers", () => {
      expect(py.type(42)).toBe("int")
    })

    it("should return float for floats", () => {
      expect(py.type(3.14)).toBe("float")
    })

    it("should return str for strings", () => {
      expect(py.type("hello")).toBe("str")
    })

    it("should return bool for booleans", () => {
      expect(py.type(true)).toBe("bool")
    })

    it("should return list for arrays", () => {
      expect(py.type([1, 2, 3])).toBe("list")
    })

    it("should return dict for Maps", () => {
      expect(py.type(new Map())).toBe("dict")
    })

    it("should return set for Sets", () => {
      expect(py.type(new Set())).toBe("set")
    })

    it("should return NoneType for null", () => {
      expect(py.type(null)).toBe("NoneType")
    })
  })

  describe("isinstance()", () => {
    it("should check number types", () => {
      expect(py.isinstance(42, Number)).toBe(true)
      expect(py.isinstance(42, "int")).toBe(true)
      expect(py.isinstance(3.14, "float")).toBe(true)
    })

    it("should check string type", () => {
      expect(py.isinstance("hello", String)).toBe(true)
      expect(py.isinstance("hello", "str")).toBe(true)
    })

    it("should check boolean type", () => {
      expect(py.isinstance(true, Boolean)).toBe(true)
      expect(py.isinstance(true, "bool")).toBe(true)
    })

    it("should check list type", () => {
      expect(py.isinstance([1, 2], Array)).toBe(true)
      expect(py.isinstance([1, 2], "list")).toBe(true)
    })

    it("should check dict type", () => {
      expect(py.isinstance(new Map(), Map)).toBe(true)
      expect(py.isinstance(new Map(), "dict")).toBe(true)
    })

    it("should check set type", () => {
      expect(py.isinstance(new Set(), Set)).toBe(true)
      expect(py.isinstance(new Set(), "set")).toBe(true)
    })
  })

  describe("repr()", () => {
    it("should add quotes around strings", () => {
      expect(py.repr("hello")).toBe("'hello'")
    })

    it("should not add quotes to non-strings", () => {
      expect(py.repr(42)).toBe("42")
      expect(py.repr(true)).toBe("True")
    })
  })

  describe("all() / any()", () => {
    it("should check all with various truthiness", () => {
      expect(py.all([1, 2, 3])).toBe(true)
      expect(py.all([1, 0, 3])).toBe(false)
      expect(py.all(["a", "b", "c"])).toBe(true)
      expect(py.all(["a", "", "c"])).toBe(false)
    })

    it("should check any with various truthiness", () => {
      expect(py.any([0, 0, 0])).toBe(false)
      expect(py.any([0, 1, 0])).toBe(true)
      expect(py.any(["", "", ""])).toBe(false)
      expect(py.any(["", "a", ""])).toBe(true)
    })
  })

  describe("map() / filter()", () => {
    it("should map over numbers", () => {
      const result = [...py.map((x: number) => x * x, [1, 2, 3, 4])]
      expect(result).toEqual([1, 4, 9, 16])
    })

    it("should filter numbers", () => {
      const result = [...py.filter((x: number) => x % 2 === 0, [1, 2, 3, 4, 5, 6])]
      expect(result).toEqual([2, 4, 6])
    })

    it("should filter with null predicate", () => {
      const result = [...py.filter(null, [0, 1, 2, "", "a", null, undefined, true, false])]
      expect(result).toEqual([1, 2, "a", true])
    })
  })

  describe("round()", () => {
    it("should round to integer by default", () => {
      expect(py.round(3.7)).toBe(4)
      expect(py.round(3.2)).toBe(3)
      expect(py.round(2.5)).toBe(2) // Banker's rounding
      expect(py.round(3.5)).toBe(4) // Banker's rounding
    })

    it("should round to specified decimals", () => {
      expect(py.round(3.14159, 2)).toBe(3.14)
      expect(py.round(3.14159, 3)).toBe(3.142)
    })

    it("should round to negative decimals", () => {
      expect(py.round(1234.5, -1)).toBe(1230)
      expect(py.round(1234.5, -2)).toBe(1200)
    })
  })

  describe("divmod()", () => {
    it("should return quotient and remainder", () => {
      expect(py.divmod(7, 3)).toEqual([2, 1])
      expect(py.divmod(10, 3)).toEqual([3, 1])
    })

    it("should follow Python semantics for negative numbers", () => {
      expect(py.divmod(-7, 3)).toEqual([-3, 2])
      expect(py.divmod(7, -3)).toEqual([-3, -2])
    })
  })

  describe("hex() / oct() / bin()", () => {
    it("should convert to hexadecimal", () => {
      expect(py.hex(0)).toBe("0x0")
      expect(py.hex(16)).toBe("0x10")
      expect(py.hex(255)).toBe("0xff")
      expect(py.hex(-16)).toBe("-0x10")
    })

    it("should convert to octal", () => {
      expect(py.oct(0)).toBe("0o0")
      expect(py.oct(8)).toBe("0o10")
      expect(py.oct(64)).toBe("0o100")
    })

    it("should convert to binary", () => {
      expect(py.bin(0)).toBe("0b0")
      expect(py.bin(2)).toBe("0b10")
      expect(py.bin(10)).toBe("0b1010")
      expect(py.bin(-10)).toBe("-0b1010")
    })
  })

  describe("ord() / chr()", () => {
    it("should convert characters to codes", () => {
      expect(py.ord("A")).toBe(65)
      expect(py.ord("Z")).toBe(90)
      expect(py.ord("0")).toBe(48)
      expect(py.ord("\n")).toBe(10)
    })

    it("should convert codes to characters", () => {
      expect(py.chr(65)).toBe("A")
      expect(py.chr(90)).toBe("Z")
      expect(py.chr(48)).toBe("0")
      expect(py.chr(10)).toBe("\n")
    })

    it("should throw for invalid ord input", () => {
      expect(() => py.ord("")).toThrow()
      expect(() => py.ord("ab")).toThrow()
    })
  })

  describe("len() edge cases", () => {
    it("should handle empty collections", () => {
      expect(py.len([])).toBe(0)
      expect(py.len("")).toBe(0)
      expect(py.len(new Map())).toBe(0)
      expect(py.len(new Set())).toBe(0)
    })

    it("should throw for invalid types", () => {
      expect(() => py.len(42 as never)).toThrow()
    })
  })

  describe("min() / max() edge cases", () => {
    it("should throw for empty iterables", () => {
      expect(() => py.min([])).toThrow()
      expect(() => py.max([])).toThrow()
    })

    it("should throw for no arguments", () => {
      expect(() => (py.min as () => number)()).toThrow()
      expect(() => (py.max as () => number)()).toThrow()
    })
  })

  describe("int() / float() edge cases", () => {
    it("should throw for invalid strings", () => {
      expect(() => py.int("not a number")).toThrow()
      expect(() => py.float("not a number")).toThrow()
    })
  })

  describe("slice() edge cases", () => {
    it("should handle slice with only start", () => {
      expect(py.slice([0, 1, 2, 3, 4], 2)).toEqual([2, 3, 4])
    })

    it("should handle slice with large indices", () => {
      expect(py.slice([0, 1, 2], 0, 100)).toEqual([0, 1, 2])
      expect(py.slice([0, 1, 2], -100, 100)).toEqual([0, 1, 2])
    })

    it("should handle reverse slice on strings", () => {
      expect(py.slice("hello", undefined, undefined, -1)).toBe("olleh")
    })
  })

  describe("range() edge cases", () => {
    it("should handle empty ranges", () => {
      expect([...py.range(0)]).toEqual([])
      expect([...py.range(5, 2)]).toEqual([])
      expect([...py.range(2, 5, -1)]).toEqual([])
    })
  })

  describe("str() edge cases", () => {
    it("should convert empty map/set", () => {
      expect(py.str(new Map())).toBe("{}")
      expect(py.str(new Set())).toBe("set()")
    })

    it("should convert map with entries", () => {
      const m = new Map([
        ["a", 1],
        ["b", 2]
      ])
      expect(py.str(m)).toContain("'a': 1")
      expect(py.str(m)).toContain("'b': 2")
    })

    it("should convert set with entries", () => {
      const s = new Set([1, 2, 3])
      const str = py.str(s)
      expect(str).toContain("1")
      expect(str).toContain("2")
      expect(str).toContain("3")
    })
  })
})
