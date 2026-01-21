import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { sorted, enumerate, contains, bool } from "pythonlib"

describe("E2E: Edge Cases", () => {
  describe("Empty and minimal code", () => {
    it("should handle empty string", () => {
      const ts = transpile("", { includeRuntime: false })
      expect(ts).toBe("")
    })

    it("should handle single variable", () => {
      const ts = transpile("x", { includeRuntime: false })
      expect(ts).toBe("x;")
    })
  })

  describe("Complex assignments", () => {
    it("should handle multiple assignments", () => {
      const python = `x = 1
y = 2
z = 3`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("let x = 1")
      expect(ts).toContain("let y = 2")
      expect(ts).toContain("let z = 3")
    })
  })

  describe("Nested functions and control flow", () => {
    it("should handle function with if inside loop", () => {
      const python = `def process(items):
    for item in items:
        if item > 0:
            print(item)`
      const ts = transpile(python)
      expect(ts).toContain("function process(items)")
      expect(ts).toContain("for (const item of iter(items))")
      expect(ts).toContain("if (item > 0)")
    })

    it("should handle nested loops", () => {
      const python = `for i in rows:
    for j in cols:
        for k in depths:
            print(i, j, k)`
      const ts = transpile(python)
      expect(ts).toContain("for (const i of iter(rows))")
      expect(ts).toContain("for (const j of iter(cols))")
      expect(ts).toContain("for (const k of iter(depths))")
    })
  })

  describe("Complex expressions", () => {
    it("should handle deeply nested parentheses", () => {
      const python = "x = ((((1 + 2))))"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("1 + 2")
    })

    it("should handle mixed operators", () => {
      const python = "x = a + b - c * d / e"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("+")
      expect(ts).toContain("-")
      expect(ts).toContain("*")
      expect(ts).toContain("/")
    })
  })

  describe("Dict edge cases", () => {
    it("should handle dict with multiple entries", () => {
      const python = '{"a": 1, "b": 2, "c": 3}'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('"a": 1')
      expect(ts).toContain('"b": 2')
      expect(ts).toContain('"c": 3')
    })

    it("should handle dict with number keys", () => {
      const python = '{1: "a", 2: "b"}'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('1: "a"')
      expect(ts).toContain('2: "b"')
    })
  })

  describe("List edge cases", () => {
    it("should handle deeply nested lists", () => {
      const python = "[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]")
    })

    it("should handle list with mixed types", () => {
      const python = '[1, "two", True, None]'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("1")
      expect(ts).toContain('"two"')
      expect(ts).toContain("true")
      expect(ts).toContain("null")
    })
  })

  describe("Comment handling", () => {
    it("should convert inline comments", () => {
      const python = `x = 1  # set x to 1
y = 2  # set y to 2`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("//")
    })

    it("should handle comment-only lines", () => {
      const python = `# this is a comment
x = 1`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("// this is a comment")
    })
  })

  describe("Slice edge cases", () => {
    it("should handle slice with all parameters", () => {
      const python = "x = arr[1:10:2]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
      expect(ts).toContain("1")
      expect(ts).toContain("10")
      expect(ts).toContain("2")
    })

    it("should handle slice with only start", () => {
      const python = "x = arr[5:]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
      expect(ts).toContain("5")
    })

    it("should handle slice with only stop", () => {
      const python = "x = arr[:5]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
      expect(ts).toContain("5")
    })

    it("should handle reverse slice", () => {
      const python = "x = arr[::-1]"
      const ts = transpile(python)
      expect(ts).toContain("slice")
      expect(ts).toContain("-1")
    })
  })

  describe("Runtime: sorted with string keys", () => {
    it("should sort strings alphabetically", () => {
      const result = sorted(["banana", "apple", "cherry"])
      expect(result).toEqual(["apple", "banana", "cherry"])
    })

    it("should sort with key and reverse", () => {
      const items = [{ name: "z" }, { name: "a" }, { name: "m" }]
      const result = sorted(items, { key: (x) => x.name, reverse: true })
      expect(result.map((x) => x.name)).toEqual(["z", "m", "a"])
    })
  })

  describe("Runtime: enumerate with generators", () => {
    it("should enumerate a generator", () => {
      const gen = function* () {
        yield "a"
        yield "b"
        yield "c"
      }
      const result = [...enumerate(gen())]
      expect(result).toEqual([
        [0, "a"],
        [1, "b"],
        [2, "c"]
      ])
    })
  })

  describe("Runtime: in operator edge cases", () => {
    it("should check membership in iterable", () => {
      const gen = function* () {
        yield 1
        yield 2
        yield 3
      }
      expect(contains(2, gen())).toBe(true)
    })
  })

  describe("Runtime: bool edge cases", () => {
    it("should handle Maps correctly", () => {
      expect(bool(new Map())).toBe(false)
      expect(bool(new Map([["a", 1]]))).toBe(true)
    })

    it("should handle Sets correctly", () => {
      expect(bool(new Set())).toBe(false)
      expect(bool(new Set([1]))).toBe(true)
    })

    it("should handle objects", () => {
      expect(bool({})).toBe(true)
      expect(bool({ a: 1 })).toBe(true)
    })
  })

  describe("Conditional expressions", () => {
    it("should handle simple conditional", () => {
      const python = "y = 1 if x else 0"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("?")
      expect(ts).toContain(":")
    })
  })

  describe("String variations", () => {
    it("should handle single-quoted triple string", () => {
      const python = "'''multi\nline'''"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("`")
    })

    it("should handle double-quoted triple string", () => {
      const python = '"""another\nmulti\nline"""'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("`")
    })

    it("should handle bytes literal", () => {
      const result = transpile("x = b'hello'", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle string with escape sequences", () => {
      const result = transpile('"hello\\nworld"', { includeRuntime: false })
      expect(result).toContain("hello\\nworld")
    })
  })

  describe("Tuple operations", () => {
    it("should handle tuple unpacking in assignment", () => {
      const result = transpile("a, b = 1, 2", { includeRuntime: false })
      expect(result).toContain("[a, b]")
      expect(result).toContain("[1, 2]")
    })

    it("should handle nested tuple unpacking", () => {
      const result = transpile("a, (b, c) = 1, (2, 3)", { includeRuntime: false })
      expect(result).toContain("[a, [b, c]]")
    })

    it("should handle empty parentheses", () => {
      const result = transpile("()", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle empty tuple assignment", () => {
      const result = transpile("x = ()", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle single item tuple", () => {
      const result = transpile("x = (1,)", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle tuple expression", () => {
      const result = transpile("(1, 2, 3)")
      expect(result).toContain("tuple")
    })
  })

  describe("Control statements", () => {
    it("should handle delete statement", () => {
      const result = transpile("del x", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle global statement", () => {
      const result = transpile("global x", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle nonlocal statement", () => {
      const result = transpile("nonlocal x", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle assert statement", () => {
      const result = transpile("assert x > 0, 'must be positive'", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle for/else statement", () => {
      const code = "for x in items:\n    pass\nelse:\n    print('done')"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle while/else statement", () => {
      const code = "while True:\n    break\nelse:\n    print('done')"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle try/except/else", () => {
      const code = "try:\n    x = 1\nexcept:\n    pass\nelse:\n    y = 2"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toBeDefined()
    })
  })

  describe("Unary operations", () => {
    it("should handle unary minus", () => {
      const result = transpile("x = -5", { includeRuntime: false })
      expect(result).toContain("-5")
    })

    it("should handle unary plus", () => {
      const result = transpile("x = +5", { includeRuntime: false })
      expect(result).toContain("+5")
    })

    it("should handle unary not", () => {
      const result = transpile("x = not y", { includeRuntime: false })
      expect(result).toContain("!")
    })

    it("should handle unary expression on parenthesized expression", () => {
      const result = transpile("x = -(a + b)", { includeRuntime: false })
      expect(result).toContain("-")
    })
  })

  describe("Complex member and subscript expressions", () => {
    it("should handle nested member expressions", () => {
      const result = transpile("a.b.c.d", { includeRuntime: false })
      expect(result).toBe("a.b.c.d;")
    })

    it("should handle chained method calls", () => {
      const code = "x = obj.method1().method2().method3()"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("method1()")
      expect(result).toContain("method2()")
    })

    it("should handle nested subscripts", () => {
      const code = "x = matrix[i][j][k]"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("matrix[i][j][k]")
    })

    it("should handle subscript with expression", () => {
      const result = transpile("arr[i + 1]", { includeRuntime: false })
      expect(result).toBe("arr[(i + 1)];")
    })

    it("should handle subscript assignment", () => {
      const code = "arr[0] = 10"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("arr[0]")
      expect(result).toContain("10")
    })

    it("should handle method call on literal", () => {
      const result = transpile("x = 'hello'.upper()")
      expect(result).toBeDefined()
    })

    it("should handle chained subscript and method", () => {
      const result = transpile("x = arr[0].method()")
      expect(result).toBeDefined()
    })
  })

  describe("Function and return edge cases", () => {
    it("should handle empty function body", () => {
      const code = "def empty():\n    pass"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("function empty()")
    })

    it("should handle function returning None", () => {
      const code = "def returns_none():\n    return None"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("return null")
    })

    it("should handle function with return in middle", () => {
      const code = "def fn():\n    x = 1\n    return x\n    y = 2"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("return x")
    })
  })

  describe("Literals and collections", () => {
    it("should handle simple number", () => {
      const result = transpile("x = 42", { includeRuntime: false })
      expect(result).toContain("42")
    })

    it("should handle float number", () => {
      const result = transpile("x = 3.14", { includeRuntime: false })
      expect(result).toContain("3.14")
    })

    it("should handle integer with underscores", () => {
      const result = transpile("x = 1_000_000", { includeRuntime: false })
      expect(result).toBeDefined()
    })

    it("should handle boolean True", () => {
      const result = transpile("x = True", { includeRuntime: false })
      expect(result).toContain("true")
    })

    it("should handle boolean False", () => {
      const result = transpile("x = False", { includeRuntime: false })
      expect(result).toContain("false")
    })

    it("should handle None literal", () => {
      const result = transpile("x = None", { includeRuntime: false })
      expect(result).toContain("null")
    })

    it("should handle empty list literal", () => {
      const code = "x = []"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("[]")
    })

    it("should handle empty dict literal", () => {
      const code = "x = {}"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("{")
      expect(result).toContain("}")
    })

    it("should handle complex list literal", () => {
      const code = "x = [1, 2, [3, 4], 5]"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("[1, 2, [3, 4], 5]")
    })

    it("should handle complex dict literal", () => {
      const code = 'x = {"nested": {"key": "value"}}'
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("nested")
      expect(result).toContain("key")
    })

    it("should handle set expression", () => {
      const result = transpile("{1, 2, 3}")
      expect(result).toContain("set")
    })
  })
})
