import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Functions", () => {
  describe("Function Definitions", () => {
    it("should convert simple function", () => {
      const python = `def greet():
    print("Hello")`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function greet()")
      expect(ts).toContain('console.log("Hello")')
    })

    it("should convert function with parameters", () => {
      const python = `def add(a, b):
    return a + b`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function add(a, b)")
      expect(ts).toContain("return (a + b);")
    })

    it("should convert function with default parameters", () => {
      const python = `def greet(name, greeting = "Hello"):
    print(greeting, name)`
      const ts = transpile(python, { includeRuntime: false })
      // Currently parameters are passed through - full default support is Phase 4
      expect(ts).toContain("function greet(name, greeting)")
    })

    it("should convert function with return", () => {
      const python = `def square(x):
    return x * x`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("return (x * x);")
    })

    it("should convert function with empty return", () => {
      const python = `def early_return():
    return`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("return;")
    })

    it("should convert function with multiple statements", () => {
      const python = `def process(x):
    y = x + 1
    z = y * 2
    return z`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("let y = (x + 1);")
      expect(ts).toContain("let z = (y * 2);")
      expect(ts).toContain("return z;")
    })
  })

  describe("Function Calls", () => {
    it("should convert simple function call", () => {
      const python = "greet()"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("greet();")
    })

    it("should convert function call with arguments", () => {
      const python = "add(1, 2)"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("add(1, 2);")
    })

    it("should convert nested function calls", () => {
      const python = "outer(inner(x))"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe("outer(inner(x));")
    })

    it("should convert chained method calls", () => {
      const python = "obj.method1().method2()"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("obj.method1().method2()")
    })
  })

  describe("Built-in Functions", () => {
    it("should convert print with multiple arguments", () => {
      const python = 'print("Hello", name, "!")'
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toBe('console.log("Hello", name, "!");')
    })

    it("should convert len", () => {
      const python = "n = len(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.len(items)")
    })

    it("should convert range with one argument", () => {
      const python = "r = range(10)"
      const ts = transpile(python)
      expect(ts).toContain("py.range(10)")
    })

    it("should convert range with two arguments", () => {
      const python = "r = range(1, 10)"
      const ts = transpile(python)
      expect(ts).toContain("py.range(1, 10)")
    })

    it("should convert range with three arguments", () => {
      const python = "r = range(0, 10, 2)"
      const ts = transpile(python)
      expect(ts).toContain("py.range(0, 10, 2)")
    })

    it("should convert enumerate", () => {
      const python = "e = enumerate(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.enumerate(items)")
    })

    it("should convert zip", () => {
      const python = "z = zip(a, b)"
      const ts = transpile(python)
      expect(ts).toContain("py.zip(a, b)")
    })

    it("should convert sorted", () => {
      const python = "s = sorted(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.sorted(items)")
    })

    it("should convert reversed", () => {
      const python = "r = reversed(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.reversed(items)")
    })

    it("should convert abs", () => {
      const python = "a = abs(-5)"
      const ts = transpile(python)
      expect(ts).toContain("py.abs(")
      expect(ts).toContain("-5")
    })

    it("should convert min", () => {
      const python = "m = min(1, 2, 3)"
      const ts = transpile(python)
      expect(ts).toContain("py.min(1, 2, 3)")
    })

    it("should convert max", () => {
      const python = "m = max(1, 2, 3)"
      const ts = transpile(python)
      expect(ts).toContain("py.max(1, 2, 3)")
    })

    it("should convert sum", () => {
      const python = "s = sum(numbers)"
      const ts = transpile(python)
      expect(ts).toContain("py.sum(numbers)")
    })

    it("should convert int", () => {
      const python = 'i = int("42")'
      const ts = transpile(python)
      expect(ts).toContain('py.int("42")')
    })

    it("should convert float", () => {
      const python = 'f = float("3.14")'
      const ts = transpile(python)
      expect(ts).toContain('py.float("3.14")')
    })

    it("should convert str", () => {
      const python = "s = str(42)"
      const ts = transpile(python)
      expect(ts).toContain("py.str(42)")
    })

    it("should convert bool", () => {
      const python = "b = bool(x)"
      const ts = transpile(python)
      expect(ts).toContain("py.bool(x)")
    })

    it("should convert list", () => {
      const python = "l = list(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.list(items)")
    })

    it("should convert dict", () => {
      const python = "d = dict(entries)"
      const ts = transpile(python)
      expect(ts).toContain("py.dict(entries)")
    })

    it("should convert set", () => {
      const python = "s = set(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.set(items)")
    })

    it("should convert tuple", () => {
      const python = "t = tuple(items)"
      const ts = transpile(python)
      expect(ts).toContain("py.tuple(items)")
    })

    it("should convert isinstance", () => {
      const python = "isinstance(x, int)"
      const ts = transpile(python)
      expect(ts).toContain("py.isinstance(x, int)")
    })

    it("should convert type", () => {
      const python = "type(x)"
      const ts = transpile(python)
      expect(ts).toContain("py.type(x)")
    })

    it("should convert ord", () => {
      const python = 'ord("A")'
      const ts = transpile(python)
      expect(ts).toContain('py.ord("A")')
    })

    it("should convert chr", () => {
      const python = "chr(65)"
      const ts = transpile(python)
      expect(ts).toContain("py.chr(65)")
    })
  })
})
