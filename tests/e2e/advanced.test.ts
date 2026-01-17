import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { string, sorted, enumerate, zip, slice } from "pythonlib"

describe("E2E: Advanced Features", () => {
  describe("Slicing", () => {
    it("should convert array slice", () => {
      const python = "x = arr[1:3]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
    })

    it("should convert array slice with step", () => {
      const python = "x = arr[::2]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
    })

    it("should convert negative slice", () => {
      const python = "x = arr[-3:]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
    })
  })

  describe("Subscript Access", () => {
    it("should convert simple subscript", () => {
      const python = "x = arr[0]"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("arr[0]")
    })

    it("should convert negative subscript", () => {
      const python = "x = arr[-1]"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("at(arr, (-1))")
    })

    it("should convert variable subscript", () => {
      const python = "x = arr[i]"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("arr[i]")
    })
  })

  describe("Member Access", () => {
    it("should convert member access", () => {
      const python = "x = obj.attr"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("obj.attr")
    })

    it("should convert chained member access", () => {
      const python = "x = obj.a.b.c"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("obj.a.b.c")
    })
  })

  describe("Tuples", () => {
    it("should convert tuple", () => {
      const python = "x = (1, 2, 3)"
      const ts = transpile(python)
      expect(ts).toContain("tuple")
    })
  })

  describe("Chained Comparisons", () => {
    it("should convert simple comparisons", () => {
      const python = "x < 10"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("(x < 10)")
    })

    // Note: Full chained comparison support (a < b < c -> (a < b) && (b < c))
    // is planned for a future phase
  })

  describe("Identity Operators", () => {
    it("should convert is for simple cases", () => {
      const python = "x == None"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("==")
      expect(ts).toContain("null")
    })

    // Note: Full "is" and "is not" operator support is planned for a future phase
  })

  describe("Raw Strings", () => {
    it("should convert raw strings", () => {
      const python = 'x = r"\\n"'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('"\\n"')
    })

    it("should convert uppercase raw strings", () => {
      const python = "x = R'\\n'"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("'\\n'")
    })
  })

  describe("Complex Expressions", () => {
    it("should handle complex nested expressions", () => {
      const python = "result = (a + b) * (c - d) / e"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("+")
      expect(ts).toContain("*")
      expect(ts).toContain("-")
      expect(ts).toContain("/")
    })

    it("should handle expression with all arithmetic operators", () => {
      const python = "x = a + b - c * d / e // f % g ** h"
      const ts = transpile(python)
      expect(ts).toContain("+")
      expect(ts).toContain("-")
      expect(ts).toContain("*")
      expect(ts).toContain("/")
      expect(ts).toContain("floordiv")
      expect(ts).toContain("mod")
      expect(ts).toContain("pow")
    })
  })

  describe("Multiple Assignment (Destructuring)", () => {
    it("should transform simple multiple assignment", () => {
      const python = "a, b = 1, 2"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [a, b] = [1, 2];")
    })

    it("should transform swap pattern", () => {
      const python = "a, b = b, a"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [a, b] = [b, a];")
    })

    it("should transform unpacking from variable", () => {
      const python = "x, y = point"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [x, y] = point;")
    })

    it("should transform triple assignment", () => {
      const python = "x, y, z = 1, 2, 3"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [x, y, z] = [1, 2, 3];")
    })

    it("should transform nested tuple unpacking", () => {
      const python = "a, (b, c) = item"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [a, [b, c]] = item;")
    })

    it("should transform unpacking from function call", () => {
      const python = "x, y = get_point()"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [x, y] = get_point();")
    })

    it("should transform single target with multiple values (tuple)", () => {
      const python = "point = 1, 2"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let point = [1, 2];")
    })

    it("should transform unpacking with expressions", () => {
      const python = "a, b = x + 1, y + 2"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("let [a, b] = [(x + 1), (y + 2)];")
    })
  })

  describe("Multiple Elif Branches", () => {
    it("should handle multiple elif branches", () => {
      const python = `if a:
    x = 1
elif b:
    x = 2
elif c:
    x = 3
elif d:
    x = 4
else:
    x = 5`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if (a)")
      expect(ts).toContain("else if (b)")
      expect(ts).toContain("else if (c)")
      expect(ts).toContain("else if (d)")
      expect(ts).toContain("else")
    })
  })

  describe("Runtime: String Methods", () => {
    it("join should join strings with separator", () => {
      expect(string.join("-", ["a", "b", "c"])).toBe("a-b-c")
      expect(string.join("", ["a", "b", "c"])).toBe("abc")
    })

    it("split should handle various cases", () => {
      expect(string.split("a,b,c", ",")).toEqual(["a", "b", "c"])
      expect(string.split("  a  b  c  ")).toEqual(["a", "b", "c"])
      expect(string.split("a,b,c,d", ",", 2)).toEqual(["a", "b", "c,d"])
    })

    it("strip should strip characters", () => {
      expect(string.strip("  hello  ")).toBe("hello")
      expect(string.strip("xxhelloxx", "x")).toBe("hello")
      expect(string.strip("***test***", "*")).toBe("test")
    })

    it("startswith/endswith should check prefixes and suffixes", () => {
      expect(string.startswith("hello world", "hello")).toBe(true)
      expect(string.startswith("hello world", "world")).toBe(false)
      expect(string.endswith("hello world", "world")).toBe(true)
      expect(string.endswith("hello world", "hello")).toBe(false)
    })

    it("replace should replace substrings", () => {
      expect(string.replace("hello", "l", "L")).toBe("heLLo")
      expect(string.replace("hello", "l", "L", 1)).toBe("heLlo")
    })

    it("find should find substrings", () => {
      expect(string.find("hello", "l")).toBe(2)
      expect(string.find("hello", "x")).toBe(-1)
      expect(string.find("hello", "l", 3)).toBe(3)
    })

    it("count should count substrings", () => {
      expect(string.count("banana", "a")).toBe(3)
      expect(string.count("banana", "na")).toBe(2)
      expect(string.count("banana", "")).toBe(7) // Length + 1
    })

    it("format should format strings", () => {
      expect(string.format("Hello, {}!", "World")).toBe("Hello, World!")
      expect(string.format("{0} + {1} = {2}", 1, 2, 3)).toBe("1 + 2 = 3")
      expect(string.format("{1} before {0}", "A", "B")).toBe("B before A")
    })

    it("upper/lower should change case", () => {
      expect(string.upper("hello")).toBe("HELLO")
      expect(string.lower("HELLO")).toBe("hello")
    })
  })

  describe("Runtime: Collection Operations", () => {
    it("sorted should sort with key function", () => {
      const items = ["banana", "apple", "cherry"]
      const sortedByLen = sorted(items, { key: (s) => s.length })
      expect(sortedByLen).toEqual(["apple", "banana", "cherry"])
    })

    it("sorted should sort in reverse", () => {
      const items = [3, 1, 4, 1, 5, 9]
      const sortedReverse = sorted(items, { reverse: true })
      expect(sortedReverse).toEqual([9, 5, 4, 3, 1, 1])
    })

    it("enumerate should start from specified index", () => {
      const result = [...enumerate(["a", "b", "c"], 10)]
      expect(result).toEqual([
        [10, "a"],
        [11, "b"],
        [12, "c"]
      ])
    })

    it("zip should handle multiple iterables", () => {
      const a = [1, 2, 3]
      const b = ["a", "b", "c"]
      const result = [...zip(a, b)]
      expect(result).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"]
      ])
    })
  })

  describe("Runtime: Slice Edge Cases", () => {
    it("should handle empty slice", () => {
      expect(slice([1, 2, 3], 1, 1)).toEqual([])
    })

    it("should handle step larger than array", () => {
      expect(slice([1, 2, 3], 0, 10, 5)).toEqual([1])
    })

    it("should reverse string", () => {
      expect(slice("hello", undefined, undefined, -1)).toBe("olleh")
    })
  })
})
